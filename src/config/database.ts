import mongoose from 'mongoose';
import { config } from './environment';

/**
 * Configuração da conexão com MongoDB
 * Implementa retry automático e opções de performance
 */
export class DatabaseConnection {
  private static instance: DatabaseConnection;
  private connectionRetries = 0;
  private readonly maxRetries = 5;
  private readonly retryDelay = 5000;

  private constructor() {}

  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  /**
   * Conecta ao MongoDB com retry automático
   */
  public async connect(): Promise<void> {
    try {
      const options: mongoose.ConnectOptions = {
        maxPoolSize: 10, // Máximo de conexões simultâneas
        serverSelectionTimeoutMS: 5000, // Timeout para seleção do servidor
        socketTimeoutMS: 45000, // Timeout para operações
        family: 4, // Força IPv4
        retryWrites: true,
        w: 'majority',
      };

      await mongoose.connect(config.mongodb.uri, options);
      
      console.log('✅ MongoDB conectado com sucesso');
      this.connectionRetries = 0;
      this.setupEventListeners();
      
    } catch (error) {
      console.error('❌ Erro ao conectar com MongoDB:', error);
      await this.handleConnectionError();
    }
  }

  /**
   * Desconecta do MongoDB
   */
  public async disconnect(): Promise<void> {
    try {
      await mongoose.connection.close();
      console.log('📴 Desconectado do MongoDB');
    } catch (error) {
      console.error('❌ Erro ao desconectar do MongoDB:', error);
    }
  }

  /**
   * Verifica se a conexão está ativa
   */
  public isConnected(): boolean {
    return mongoose.connection.readyState === 1;
  }

  /**
   * Trata erros de conexão com retry automático
   */
  private async handleConnectionError(): Promise<void> {
    if (this.connectionRetries < this.maxRetries) {
      this.connectionRetries++;
      console.log(`🔄 Tentativa de reconexão ${this.connectionRetries}/${this.maxRetries} em ${this.retryDelay}ms`);
      
      await new Promise(resolve => setTimeout(resolve, this.retryDelay));
      await this.connect();
    } else {
      console.error('💥 Máximo de tentativas de conexão excedido');
      process.exit(1);
    }
  }

  /**
   * Configura listeners para eventos da conexão
   */
  private setupEventListeners(): void {
    mongoose.connection.on('error', (error) => {
      console.error('❌ Erro na conexão MongoDB:', error);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB desconectado');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconectado');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await this.disconnect();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      await this.disconnect();
      process.exit(0);
    });
  }
}

export const database = DatabaseConnection.getInstance();
