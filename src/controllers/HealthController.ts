import { Request, Response } from 'express';
import { ApiResponseUtil, Logger } from '../utils';
import { asyncHandler } from '../middleware';
import { database } from '../config/database';

/**
 * Controller para health checks e monitoramento
 * Permite verificar saúde da aplicação e seus componentes
 */
export class HealthController {
  /**
   * Health check básico da aplicação
   * Rota: GET /health
   */
  public static basicHealthCheck = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const healthData = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0',
      };

      ApiResponseUtil.success(
        res,
        healthData,
        'Aplicação está funcionando'
      );
    }
  );

  /**
   * Health check detalhado com verificação de dependências
   * Rota: GET /health/detailed
   */
  public static detailedHealthCheck = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const checks = {
        application: {
          status: 'healthy',
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          timestamp: new Date().toISOString(),
        },
        database: {
          status: 'unknown',
          connected: false,
          responseTime: 0,
        },
      };

      // Verifica conexão com MongoDB
      try {
        const startTime = Date.now();
        const isConnected = database.isConnected();
        const responseTime = Date.now() - startTime;

        checks.database = {
          status: isConnected ? 'healthy' : 'unhealthy',
          connected: isConnected,
          responseTime,
        };
      } catch (error) {
        checks.database = {
          status: 'unhealthy',
          connected: false,
          responseTime: 0,
        };
        Logger.error('Erro no health check do MongoDB', error);
      }

      // Determina status geral
      const overallStatus = Object.values(checks).every(
        check => check.status === 'healthy'
      ) ? 'healthy' : 'unhealthy';

      const statusCode = overallStatus === 'healthy' ? 200 : 503;

      const healthData = {
        status: overallStatus,
        timestamp: new Date().toISOString(),
        checks,
      };

      if (overallStatus === 'healthy') {
        ApiResponseUtil.success(
          res,
          healthData,
          'Todos os serviços estão funcionando'
        );
      } else {
        ApiResponseUtil.error(
          res,
          'Alguns serviços estão com problemas',
          statusCode
        );
      }
    }
  );

  /**
   * Informações sobre a aplicação
   * Rota: GET /info
   */
  public static getAppInfo = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const appInfo = {
        name: 'Anota AI API',
        description: 'API para contagem de acessos e gerenciamento de usuários',
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        nodeVersion: process.version,
        platform: process.platform,
        architecture: process.arch,
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        endpoints: {
          access: {
            increment: 'POST /api/access/increment',
            count: 'GET /api/access/count',
            statistics: 'GET /api/access/statistics',
          },
          users: {
            create: 'POST /api/users',
            getById: 'GET /api/users/:id',
            list: 'GET /api/users',
            update: 'PUT /api/users/:id',
            delete: 'DELETE /api/users/:id',
            statistics: 'GET /api/users/statistics',
          },
          health: {
            basic: 'GET /health',
            detailed: 'GET /health/detailed',
            info: 'GET /info',
          },
        },
      };

      ApiResponseUtil.success(
        res,
        appInfo,
        'Informações da aplicação'
      );
    }
  );

  /**
   * Métricas de performance
   * Rota: GET /metrics
   */
  public static getMetrics = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const metrics = {
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: {
          ...process.memoryUsage(),
          formatted: {
            rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)} MB`,
            heapTotal: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)} MB`,
            heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`,
            external: `${Math.round(process.memoryUsage().external / 1024 / 1024)} MB`,
          },
        },
        cpu: {
          usage: process.cpuUsage(),
        },
        os: {
          platform: process.platform,
          arch: process.arch,
          nodeVersion: process.version,
        },
      };

      ApiResponseUtil.success(
        res,
        metrics,
        'Métricas da aplicação'
      );
    }
  );
}
