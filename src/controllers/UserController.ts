import { Request, Response } from 'express';
import { UserService } from '../services';
import { ApiResponseUtil, Logger } from '../utils';
import { IUserCreateRequest } from '../types';
import { asyncHandler } from '../middleware';

/**
 * Controller para gerenciamento de usuários
 * Responsável por processar requisições HTTP e chamar services apropriados
 */
export class UserController {
  /**
   * Cria um novo usuário
   * Rota: POST /api/users
   */
  public static createUser = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const userData: IUserCreateRequest = req.body;

      Logger.info('Requisição para criar usuário', {
        email: userData.email,
        ip: req.ip,
      });

      const result = await UserService.createUser(userData);

      ApiResponseUtil.created(
        res,
        result,
        'Usuário criado com sucesso'
      );
    }
  );

  /**
   * Obtém informações de um usuário por ID
   * Rota: GET /api/users/:id
   */
  public static getUserById = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { id } = req.params;

      Logger.debug('Requisição para obter usuário por ID', { userId: id });

      const result = await UserService.getUserById(id);

      ApiResponseUtil.success(
        res,
        result,
        'Usuário obtido com sucesso'
      );
    }
  );

  /**
   * Lista usuários com paginação
   * Rota: GET /api/users
   */
  public static listUsers = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      Logger.debug('Requisição para listar usuários', { page, limit });

      const result = await UserService.listUsers(page, limit);

      ApiResponseUtil.success(
        res,
        result,
        'Usuários listados com sucesso'
      );
    }
  );

  /**
   * Atualiza dados de um usuário
   * Rota: PUT /api/users/:id
   */
  public static updateUser = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { id } = req.params;
      const updateData = req.body;

      Logger.info('Requisição para atualizar usuário', {
        userId: id,
        fields: Object.keys(updateData),
      });

      const result = await UserService.updateUser(id, updateData);

      ApiResponseUtil.success(
        res,
        result,
        'Usuário atualizado com sucesso'
      );
    }
  );

  /**
   * Remove um usuário
   * Rota: DELETE /api/users/:id
   */
  public static deleteUser = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { id } = req.params;

      Logger.info('Requisição para remover usuário', { userId: id });

      await UserService.deleteUser(id);

      ApiResponseUtil.success(
        res,
        undefined,
        'Usuário removido com sucesso'
      );
    }
  );

  /**
   * Obtém estatísticas dos usuários
   * Rota: GET /api/users/statistics
   */
  public static getUserStatistics = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      Logger.debug('Requisição para obter estatísticas de usuários');

      const result = await UserService.getUserStatistics();

      ApiResponseUtil.success(
        res,
        result,
        'Estatísticas obtidas com sucesso'
      );
    }
  );

  /**
   * Verifica se um usuário existe
   * Rota: GET /api/users/:id/exists
   */
  public static checkUserExists = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { id } = req.params;

      Logger.debug('Verificando se usuário existe', { userId: id });

      const exists = await UserService.userExists(id);

      ApiResponseUtil.success(
        res,
        { exists, userId: id },
        exists ? 'Usuário existe' : 'Usuário não encontrado'
      );
    }
  );

  /**
   * Busca usuário por email (para uso interno/admin)
   * Rota: GET /api/users/search/email
   */
  public static getUserByEmail = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { email } = req.query;

      if (!email || typeof email !== 'string') {
        ApiResponseUtil.badRequest(res, 'Email é obrigatório');
        return;
      }

      Logger.debug('Requisição para buscar usuário por email', { email });

      const user = await UserService.getUserByEmail(email);

      if (user) {
        const result = user.toResponseObject();
        ApiResponseUtil.success(
          res,
          result,
          'Usuário encontrado'
        );
      } else {
        ApiResponseUtil.notFound(res, 'Usuário não encontrado');
      }
    }
  );
}
