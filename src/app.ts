import express, { Application } from 'express';
import compression from 'compression';
import morgan from 'morgan';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

// Importações internas
import { config, validateEnvironment } from './config/environment';
import { database } from './config/database';
import { setupRoutes } from './routes';
import {
  corsConfig,
  helmetConfig,
  rateLimitConfig,
  securityLogger,
  validateUserAgent,
  sanitizeHeaders,
  globalErrorHandler,
  notFoundHandler,
  timeoutHandler,
} from './middleware';
import { Logger } from './utils';

/**
 * Classe principal da aplicação
 * Centraliza configuração e inicialização de todos os componentes
 */
export class App {
  public app: Application;
  private isInitialized = false;

  constructor() {
    this.app = express();
  }

  /**
   * Inicializa a aplicação completa
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      Logger.warn('Aplicação já foi inicializada');
      return;
    }

    try {
      Logger.info('🚀 Inicializando aplicação Anota AI API');

      // 1. Validar ambiente
      this.validateEnvironment();

      // 2. Conectar ao banco
      await this.connectDatabase();

      // 3. Configurar middlewares
      this.setupMiddlewares();

      // 4. Configurar rotas
      this.setupRoutes();

      // 5. Configurar documentação
      this.setupDocumentation();

      // 6. Configurar tratamento de erros
      this.setupErrorHandling();

      this.isInitialized = true;
      Logger.info('✅ Aplicação inicializada com sucesso');
    } catch (error) {
      Logger.error('❌ Erro ao inicializar aplicação', error);
      throw error;
    }
  }

  /**
   * Inicia o servidor HTTP
   */
  public async start(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      const server = this.app.listen(config.node.port, () => {
        Logger.info(`🌐 Servidor rodando na porta ${config.node.port}`, {
          port: config.node.port,
          environment: config.node.env,
          urls: {
            api: `http://localhost:${config.node.port}/api`,
            docs: `http://localhost:${config.node.port}/api-docs`,
            health: `http://localhost:${config.node.port}/health`,
          },
        });
        resolve();
      });

      server.on('error', (error) => {
        Logger.error('Erro ao iniciar servidor', error);
        reject(error);
      });

      // Graceful shutdown
      this.setupGracefulShutdown(server);
    });
  }

  /**
   * Valida variáveis de ambiente
   */
  private validateEnvironment(): void {
    Logger.info('🔧 Validando variáveis de ambiente');
    validateEnvironment();
  }

  /**
   * Conecta ao banco de dados
   */
  private async connectDatabase(): Promise<void> {
    Logger.info('🗄️ Conectando ao MongoDB');
    await database.connect();
  }

  /**
   * Configura middlewares de segurança e funcionalidade
   */
  private setupMiddlewares(): void {
    Logger.info('🛡️ Configurando middlewares');

    // Timeout para requisições
    this.app.use(timeoutHandler(30000));

    // Segurança básica
    this.app.use(helmetConfig);
    this.app.use(corsConfig);
    this.app.use(sanitizeHeaders);
    this.app.use(validateUserAgent);
    this.app.use(securityLogger);

    // Rate limiting global
    this.app.use(rateLimitConfig);

    // Compressão de resposta
    this.app.use(compression());

    // Parsing de JSON
    this.app.use(express.json({ 
      limit: '10mb',
      strict: true,
    }));

    // Parsing de URL encoded
    this.app.use(express.urlencoded({ 
      extended: true,
      limit: '10mb',
    }));

    // Logging de requisições
    if (config.node.env === 'development') {
      this.app.use(morgan('dev'));
    } else {
      this.app.use(morgan('combined'));
    }

    Logger.debug('Middlewares configurados com sucesso');
  }

  /**
   * Configura todas as rotas
   */
  private setupRoutes(): void {
    Logger.info('🛣️ Configurando rotas');
    setupRoutes(this.app);
  }

  /**
   * Configura documentação Swagger
   */
  private setupDocumentation(): void {
    Logger.info('📚 Configurando documentação Swagger');

    const swaggerOptions = {
      definition: {
        openapi: '3.0.0',
        info: {
          title: 'Anota AI API',
          version: '1.0.0',
          description: 'API para contagem de acessos e gerenciamento de usuários',
          contact: {
            name: 'Suporte',
            email: 'suporte@anotaai.com',
          },
          license: {
            name: 'MIT',
          },
        },
        servers: [
          {
            url: `http://localhost:${config.node.port}`,
            description: 'Servidor de desenvolvimento',
          },
        ],
        tags: [
          {
            name: 'Access Counter',
            description: 'Operações do contador de acessos',
          },
          {
            name: 'Users',
            description: 'Gerenciamento de usuários',
          },
          {
            name: 'Health',
            description: 'Health checks e monitoramento',
          },
        ],
      },
      apis: ['./src/routes/*.ts'], // Caminho para os arquivos com anotações Swagger
    };

    const swaggerSpec = swaggerJsdoc(swaggerOptions);

    // Serve documentação Swagger
    this.app.use(
      '/api-docs',
      swaggerUi.serve,
      swaggerUi.setup(swaggerSpec, {
        explorer: true,
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'Anota AI API Documentation',
      })
    );

    // Endpoint para acessar spec JSON
    this.app.get('/api-docs.json', (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(swaggerSpec);
    });

    Logger.debug('Documentação Swagger configurada em /api-docs');
  }

  /**
   * Configura tratamento global de erros
   */
  private setupErrorHandling(): void {
    Logger.info('⚠️ Configurando tratamento de erros');

    // 404 handler (deve vir antes do error handler global)
    this.app.use(notFoundHandler);

    // Error handler global (deve ser o último middleware)
    this.app.use(globalErrorHandler);

    Logger.debug('Tratamento de erros configurado');
  }

  /**
   * Configura graceful shutdown
   */
  private setupGracefulShutdown(server: any): void {
    const shutdown = async (signal: string) => {
      Logger.info(`📴 Recebido sinal ${signal}, iniciando graceful shutdown`);

      // Para de aceitar novas conexões
      server.close(() => {
        Logger.info('🔐 Servidor HTTP fechado');
      });

      try {
        // Desconecta do banco
        await database.disconnect();
        Logger.info('✅ Graceful shutdown concluído');
        process.exit(0);
      } catch (error) {
        Logger.error('❌ Erro durante graceful shutdown', error);
        process.exit(1);
      }
    };

    // Escuta sinais de shutdown
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    // Trata exceções não capturadas
    process.on('uncaughtException', (error) => {
      Logger.error('💥 Exceção não capturada', error);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      Logger.error('💥 Promise rejection não tratada', { reason, promise });
      process.exit(1);
    });
  }
}
