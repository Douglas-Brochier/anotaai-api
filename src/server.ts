import { App } from './app';
import { Logger } from './utils';

/**
 * Ponto de entrada da aplicação
 * Inicializa e inicia o servidor
 */
async function startServer(): Promise<void> {
  try {
    Logger.info('🚀 Iniciando Anota AI API');
    
    // Cria e inicializa a aplicação
    const app = new App();
    await app.start();
    
    Logger.info('🎉 Anota AI API iniciada com sucesso!');
    
  } catch (error) {
    Logger.error('💥 Falha ao iniciar servidor', error);
    process.exit(1);
  }
}

// Inicia o servidor apenas se este arquivo for executado diretamente
if (require.main === module) {
  startServer();
}

export { startServer };
