import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongoServer: MongoMemoryServer;

/**
 * Setup global para testes
 * Configura banco de dados em memória para testes isolados
 */
beforeAll(async () => {
  try {
    // Inicia servidor MongoDB em memória
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    // Conecta ao MongoDB em memória
    await mongoose.connect(mongoUri);
  } catch (error) {
    console.error('Erro no setup de testes:', error);
    throw error;
  }
}, 30000);

afterAll(async () => {
  try {
    // Desconecta e para o servidor
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    if (mongoServer) {
      await mongoServer.stop();
    }
  } catch (error) {
    console.error('Erro no teardown de testes:', error);
  }
});

afterEach(async () => {
  try {
    // Limpa todas as coleções após cada teste
    if (mongoose.connection.readyState === 1) {
      const collections = mongoose.connection.collections;
      for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany({});
      }
    }
  } catch (error) {
    console.error('Erro na limpeza de testes:', error);
  }
});
