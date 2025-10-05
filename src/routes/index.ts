import { Router, Application } from 'express';
import accessRoutes from './accessRoutes';
import userRoutes from './userRoutes';
import healthRoutes from './healthRoutes';
import { Logger } from '../utils';

/**
 * Configuração centralizada de todas as rotas da aplicação
 * Organiza e registra todas as rotas com seus prefixos apropriados
 */
export const setupRoutes = (app: Application): void => {
  const router = Router();

  // Rota raiz da API com informações básicas
  router.get('/', (req, res) => {
    res.json({
      success: true,
      message: 'Anota AI API - Funcionando!',
      data: {
        name: 'Anota AI API',
        version: '1.0.0',
        description: 'API para contagem de acessos e gerenciamento de usuários',
        endpoints: {
          access: '/api/access',
          users: '/api/users',
          health: '/health',
          info: '/info',
          metrics: '/metrics',
          docs: '/api-docs',
        },
        documentation: '/api-docs',
      },
      timestamp: new Date().toISOString(),
    });
  });

  // Registro das rotas com seus prefixos
  router.use('/access', accessRoutes);
  router.use('/users', userRoutes);

  // Rotas de health check (sem prefixo /api)
  app.use('/health', healthRoutes);
  app.use('/info', healthRoutes);
  app.use('/metrics', healthRoutes);

  // Rota principal da API
  app.use('/api', router);

  // Rota raiz que redireciona para info
  app.get('/', (req, res) => {
    res.redirect('/info');
  });

  Logger.info('Rotas configuradas com sucesso', {
    routes: {
      api: '/api',
      access: '/api/access',
      users: '/api/users',
      health: '/health',
      info: '/info',
      metrics: '/metrics',
    },
  });
};

/**
 * Lista de todas as rotas disponíveis
 * Útil para documentação e debugging
 */
export const getAvailableRoutes = () => {
  return {
    api: {
      base: '/api',
      description: 'Rota principal da API',
    },
    access: {
      base: '/api/access',
      endpoints: [
        'POST /api/access/increment - Incrementa contador',
        'GET /api/access/count - Obtém contador atual', 
        'GET /api/access/statistics - Estatísticas do contador',
        'GET /api/access/health - Verifica integridade',
        'POST /api/access/reset - Reseta contador (dev only)',
      ],
    },
    users: {
      base: '/api/users',
      endpoints: [
        'POST /api/users - Cria usuário',
        'GET /api/users - Lista usuários (paginado)',
        'GET /api/users/:id - Obtém usuário por ID',
        'PUT /api/users/:id - Atualiza usuário',
        'DELETE /api/users/:id - Remove usuário',
        'GET /api/users/statistics - Estatísticas de usuários',
        'GET /api/users/search/email - Busca por email',
        'GET /api/users/:id/exists - Verifica se existe',
      ],
    },
    health: {
      base: '/health',
      endpoints: [
        'GET /health - Health check básico',
        'GET /health/detailed - Health check detalhado',
        'GET /info - Informações da aplicação',
        'GET /metrics - Métricas de performance',
      ],
    },
  };
};
