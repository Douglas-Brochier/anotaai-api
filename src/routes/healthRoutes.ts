import { Router } from 'express';
import { HealthController } from '../controllers';

/**
 * Rotas para health checks e monitoramento
 * Endpoints para verificar saúde da aplicação
 */
const router = Router();

/**
 * @swagger
 * tags:
 *   name: Health
 *   description: Health checks e monitoramento da aplicação
 */

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check básico
 *     tags: [Health]
 *     description: Verifica se a aplicação está funcionando
 *     responses:
 *       200:
 *         description: Aplicação funcionando
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Aplicação está funcionando"
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: "healthy"
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                     uptime:
 *                       type: number
 *                       example: 3600.5
 *                     environment:
 *                       type: string
 *                       example: "development"
 *                     version:
 *                       type: string
 *                       example: "1.0.0"
 */
router.get('/', HealthController.basicHealthCheck);

/**
 * @swagger
 * /health/detailed:
 *   get:
 *     summary: Health check detalhado
 *     tags: [Health]
 *     description: Verifica saúde da aplicação e dependências
 *     responses:
 *       200:
 *         description: Todos os serviços funcionando
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Todos os serviços estão funcionando"
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: "healthy"
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                     checks:
 *                       type: object
 *                       properties:
 *                         application:
 *                           type: object
 *                           properties:
 *                             status:
 *                               type: string
 *                               example: "healthy"
 *                             uptime:
 *                               type: number
 *                               example: 3600.5
 *                             memory:
 *                               type: object
 *                               properties:
 *                                 rss:
 *                                   type: number
 *                                 heapTotal:
 *                                   type: number
 *                                 heapUsed:
 *                                   type: number
 *                                 external:
 *                                   type: number
 *                         database:
 *                           type: object
 *                           properties:
 *                             status:
 *                               type: string
 *                               example: "healthy"
 *                             connected:
 *                               type: boolean
 *                               example: true
 *                             responseTime:
 *                               type: number
 *                               example: 15
 *       503:
 *         description: Alguns serviços com problemas
 */
router.get('/detailed', HealthController.detailedHealthCheck);

/**
 * @swagger
 * /info:
 *   get:
 *     summary: Informações da aplicação
 *     tags: [Health]
 *     description: Retorna informações sobre a API e endpoints disponíveis
 *     responses:
 *       200:
 *         description: Informações da aplicação
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Informações da aplicação"
 *                 data:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "Anota AI API"
 *                     description:
 *                       type: string
 *                       example: "API para contagem de acessos e gerenciamento de usuários"
 *                     version:
 *                       type: string
 *                       example: "1.0.0"
 *                     environment:
 *                       type: string
 *                       example: "development"
 *                     nodeVersion:
 *                       type: string
 *                       example: "v18.17.0"
 *                     platform:
 *                       type: string
 *                       example: "linux"
 *                     architecture:
 *                       type: string
 *                       example: "x64"
 *                     uptime:
 *                       type: number
 *                       example: 3600.5
 *                     endpoints:
 *                       type: object
 *                       description: Mapa de endpoints disponíveis
 */
router.get('/info', HealthController.getAppInfo);

/**
 * @swagger
 * /metrics:
 *   get:
 *     summary: Métricas de performance
 *     tags: [Health]
 *     description: Retorna métricas de performance da aplicação
 *     responses:
 *       200:
 *         description: Métricas da aplicação
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Métricas da aplicação"
 *                 data:
 *                   type: object
 *                   properties:
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                     uptime:
 *                       type: number
 *                       example: 3600.5
 *                     memory:
 *                       type: object
 *                       properties:
 *                         rss:
 *                           type: number
 *                         heapTotal:
 *                           type: number
 *                         heapUsed:
 *                           type: number
 *                         external:
 *                           type: number
 *                         formatted:
 *                           type: object
 *                           properties:
 *                             rss:
 *                               type: string
 *                               example: "45 MB"
 *                             heapTotal:
 *                               type: string
 *                               example: "25 MB"
 *                             heapUsed:
 *                               type: string
 *                               example: "15 MB"
 *                             external:
 *                               type: string
 *                               example: "2 MB"
 *                     cpu:
 *                       type: object
 *                       properties:
 *                         usage:
 *                           type: object
 *                           properties:
 *                             user:
 *                               type: number
 *                             system:
 *                               type: number
 *                     os:
 *                       type: object
 *                       properties:
 *                         platform:
 *                           type: string
 *                         arch:
 *                           type: string
 *                         nodeVersion:
 *                           type: string
 */
router.get('/metrics', HealthController.getMetrics);

export default router;
