import { Router } from 'express';
import { AccessCounterController } from '../controllers';
import { rateLimitConfig } from '../middleware';

/**
 * Rotas para gerenciamento do contador de acessos
 * Implementa as funcionalidades de incremento e consulta de acessos
 */
const router = Router();

/**
 * @swagger
 * tags:
 *   name: Access Counter
 *   description: Gerenciamento do contador de acessos ao site
 */

/**
 * @swagger
 * /api/access/increment:
 *   post:
 *     summary: Incrementa o contador de acessos
 *     tags: [Access Counter]
 *     description: Incrementa o número total de acessos ao site de forma atômica
 *     responses:
 *       200:
 *         description: Acesso incrementado com sucesso
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
 *                   example: "Acesso incrementado com sucesso"
 *                 data:
 *                   type: object
 *                   properties:
 *                     count:
 *                       type: number
 *                       example: 1542
 *                     lastUpdated:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-10-02T14:30:00.000Z"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       429:
 *         description: Muitas requisições
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/increment', rateLimitConfig, AccessCounterController.incrementAccess);

/**
 * @swagger
 * /api/access/count:
 *   get:
 *     summary: Obtém o número atual de acessos
 *     tags: [Access Counter]
 *     description: Retorna o contador atual de acessos ao site
 *     responses:
 *       200:
 *         description: Contador obtido com sucesso
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
 *                   example: "Contador obtido com sucesso"
 *                 data:
 *                   type: object
 *                   properties:
 *                     count:
 *                       type: number
 *                       example: 1542
 *                     lastUpdated:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-10-02T14:30:00.000Z"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/count', AccessCounterController.getCurrentCount);

/**
 * @swagger
 * /api/access/statistics:
 *   get:
 *     summary: Obtém estatísticas detalhadas do contador
 *     tags: [Access Counter]
 *     description: Retorna estatísticas avançadas incluindo média de acessos
 *     responses:
 *       200:
 *         description: Estatísticas obtidas com sucesso
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
 *                   example: "Estatísticas obtidas com sucesso"
 *                 data:
 *                   type: object
 *                   properties:
 *                     count:
 *                       type: number
 *                       example: 1542
 *                     lastUpdated:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-10-02T14:30:00.000Z"
 *                     averageAccessesPerDay:
 *                       type: number
 *                       example: 25.7
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-09-01T10:00:00.000Z"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/statistics', AccessCounterController.getStatistics);

/**
 * @swagger
 * /api/access/health:
 *   get:
 *     summary: Verifica integridade do contador
 *     tags: [Access Counter]
 *     description: Endpoint para verificar se o contador está em estado consistente
 *     responses:
 *       200:
 *         description: Contador está íntegro
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
 *                   example: "Contador está íntegro"
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: "healthy"
 *                     valid:
 *                       type: boolean
 *                       example: true
 *       500:
 *         description: Contador em estado inconsistente
 */
router.get('/health', AccessCounterController.checkIntegrity);

/**
 * @swagger
 * /api/access/reset:
 *   post:
 *     summary: Reseta o contador para 0 (apenas desenvolvimento)
 *     tags: [Access Counter]
 *     description: Endpoint para resetar contador - disponível apenas em desenvolvimento
 *     responses:
 *       200:
 *         description: Contador resetado com sucesso
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
 *                   example: "Contador resetado com sucesso"
 *                 data:
 *                   type: object
 *                   properties:
 *                     count:
 *                       type: number
 *                       example: 0
 *                     lastUpdated:
 *                       type: string
 *                       format: date-time
 *       403:
 *         description: Operação não permitida em produção
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/reset', AccessCounterController.resetCounter);

export default router;
