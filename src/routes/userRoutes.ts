import { Router } from 'express';
import { UserController } from '../controllers';
import {
  validateUserCreation,
  handleValidationErrors,
  sanitizeInput,
  validateQueryParams,
  validateRouteParams,
  userCreationRateLimit,
} from '../middleware';

/**
 * Rotas para gerenciamento de usuários
 * Implementa CRUD completo com validações e segurança
 */
const router = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Gerenciamento de usuários
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *       properties:
 *         name:
 *           type: string
 *           minLength: 2
 *           maxLength: 100
 *           pattern: '^[a-zA-ZÀ-ÿ\s]+$'
 *           description: Nome do usuário (apenas letras e espaços)
 *           example: "João Silva"
 *         email:
 *           type: string
 *           format: email
 *           maxLength: 255
 *           description: Email único do usuário
 *           example: "joao.silva@email.com"
 *         password:
 *           type: string
 *           minLength: 8
 *           maxLength: 128
 *           pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$'
 *           description: Senha com pelo menos 1 maiúscula, 1 minúscula e 1 número
 *           example: "MinhaSenh@123"
 *     UserResponse:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: ID único do usuário
 *           example: "507f1f77bcf86cd799439011"
 *         name:
 *           type: string
 *           example: "João Silva"
 *         email:
 *           type: string
 *           example: "joao.silva@email.com"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2023-10-02T14:30:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2023-10-02T14:30:00.000Z"
 */

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Cria um novo usuário
 *     tags: [Users]
 *     description: Registra um novo usuário no sistema
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
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
 *                   example: "Usuário criado com sucesso"
 *                 data:
 *                   $ref: '#/components/schemas/UserResponse'
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Dados inválidos
 *       409:
 *         description: Email já está em uso
 *       429:
 *         description: Muitas tentativas de criação
 *       500:
 *         description: Erro interno do servidor
 */
router.post(
  '/',
  userCreationRateLimit,
  sanitizeInput,
  validateUserCreation,
  handleValidationErrors,
  UserController.createUser
);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Lista usuários com paginação
 *     tags: [Users]
 *     description: Retorna lista paginada de usuários
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Itens por página
 *     responses:
 *       200:
 *         description: Lista de usuários
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
 *                   example: "Usuários listados com sucesso"
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/UserResponse'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                           example: 1
 *                         limit:
 *                           type: integer
 *                           example: 10
 *                         total:
 *                           type: integer
 *                           example: 50
 *                         pages:
 *                           type: integer
 *                           example: 5
 *                         hasNext:
 *                           type: boolean
 *                           example: true
 *                         hasPrev:
 *                           type: boolean
 *                           example: false
 *       400:
 *         description: Parâmetros inválidos
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/', validateQueryParams, UserController.listUsers);

/**
 * @swagger
 * /api/users/statistics:
 *   get:
 *     summary: Obtém estatísticas dos usuários
 *     tags: [Users]
 *     description: Retorna estatísticas de cadastros de usuários
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
 *                     totalUsers:
 *                       type: integer
 *                       example: 150
 *                     usersToday:
 *                       type: integer
 *                       example: 5
 *                     usersThisWeek:
 *                       type: integer
 *                       example: 23
 *                     usersThisMonth:
 *                       type: integer
 *                       example: 45
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/statistics', UserController.getUserStatistics);

/**
 * @swagger
 * /api/users/search/email:
 *   get:
 *     summary: Busca usuário por email
 *     tags: [Users]
 *     description: Encontra usuário através do email
 *     parameters:
 *       - in: query
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *         description: Email do usuário
 *     responses:
 *       200:
 *         description: Usuário encontrado
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
 *                   example: "Usuário encontrado"
 *                 data:
 *                   $ref: '#/components/schemas/UserResponse'
 *       400:
 *         description: Email não fornecido
 *       404:
 *         description: Usuário não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/search/email', UserController.getUserByEmail);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Obtém usuário por ID
 *     tags: [Users]
 *     description: Retorna informações de um usuário específico
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: ID do usuário (ObjectId do MongoDB)
 *     responses:
 *       200:
 *         description: Usuário encontrado
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
 *                   example: "Usuário obtido com sucesso"
 *                 data:
 *                   $ref: '#/components/schemas/UserResponse'
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Usuário não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/:id', validateRouteParams('id'), UserController.getUserById);

/**
 * @swagger
 * /api/users/{id}/exists:
 *   get:
 *     summary: Verifica se usuário existe
 *     tags: [Users]
 *     description: Verifica se um usuário existe pelo ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Verificação realizada
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
 *                   example: "Usuário existe"
 *                 data:
 *                   type: object
 *                   properties:
 *                     exists:
 *                       type: boolean
 *                       example: true
 *                     userId:
 *                       type: string
 *                       example: "507f1f77bcf86cd799439011"
 *       400:
 *         description: ID inválido
 */
router.get('/:id/exists', validateRouteParams('id'), UserController.checkUserExists);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Atualiza dados do usuário
 *     tags: [Users]
 *     description: Atualiza nome e/ou email do usuário
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: ID do usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 example: "João Santos"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "joao.santos@email.com"
 *     responses:
 *       200:
 *         description: Usuário atualizado com sucesso
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
 *                   example: "Usuário atualizado com sucesso"
 *                 data:
 *                   $ref: '#/components/schemas/UserResponse'
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Usuário não encontrado
 *       409:
 *         description: Email já está em uso
 *       500:
 *         description: Erro interno do servidor
 */
router.put('/:id', validateRouteParams('id'), sanitizeInput, UserController.updateUser);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Remove usuário
 *     tags: [Users]
 *     description: Remove um usuário do sistema
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Usuário removido com sucesso
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
 *                   example: "Usuário removido com sucesso"
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Usuário não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.delete('/:id', validateRouteParams('id'), UserController.deleteUser);

export default router;
