import { Request, Response } from 'express';
import { AccessCounterService } from '../services';
import { ApiResponseUtil, Logger } from '../utils';
import { asyncHandler } from '../middleware';

/**
 * Controller para gerenciamento do contador de acessos
 * Responsável por processar requisições HTTP e chamar services apropriados
 */
export class AccessCounterController {
  /**
   * Incrementa o contador de acessos
   * Rota: POST /api/access/increment
   */
  public static incrementAccess = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      Logger.info('Requisição para incrementar acesso', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
      });

      const result = await AccessCounterService.incrementAccess();

      ApiResponseUtil.success(
        res,
        result,
        'Acesso incrementado com sucesso'
      );
    }
  );

  /**
   * Obtém o contador atual de acessos
   * Rota: GET /api/access/count
   */
  public static getCurrentCount = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      Logger.debug('Requisição para obter contador atual');

      const result = await AccessCounterService.getCurrentCount();

      ApiResponseUtil.success(
        res,
        result,
        'Contador obtido com sucesso'
      );
    }
  );

  /**
   * Obtém estatísticas detalhadas do contador
   * Rota: GET /api/access/statistics
   */
  public static getStatistics = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      Logger.debug('Requisição para obter estatísticas do contador');

      const result = await AccessCounterService.getStatistics();

      ApiResponseUtil.success(
        res,
        result,
        'Estatísticas obtidas com sucesso'
      );
    }
  );

  /**
   * Reseta o contador (apenas para desenvolvimento/manutenção)
   * Rota: POST /api/access/reset
   */
  public static resetCounter = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      // Em produção, esta rota deveria ter autenticação de admin
      if (process.env.NODE_ENV === 'production') {
        ApiResponseUtil.forbidden(res, 'Operação não permitida em produção');
        return;
      }

      Logger.warn('Requisição para resetar contador', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
      });

      const result = await AccessCounterService.resetCounter();

      ApiResponseUtil.success(
        res,
        result,
        'Contador resetado com sucesso'
      );
    }
  );

  /**
   * Verifica integridade do contador
   * Rota: GET /api/access/health
   */
  public static checkIntegrity = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      Logger.debug('Verificando integridade do contador');

      const isValid = await AccessCounterService.validateIntegrity();

      if (isValid) {
        ApiResponseUtil.success(
          res,
          { status: 'healthy', valid: true },
          'Contador está íntegro'
        );
      } else {
        ApiResponseUtil.error(
          res,
          'Contador em estado inconsistente',
          500
        );
      }
    }
  );
}
