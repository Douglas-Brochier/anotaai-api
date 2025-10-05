import { Response } from 'express';
import { ApiResponse, HttpStatus } from '../types';

/**
 * Classe utilitária para padronizar respostas da API
 * Garante consistência nas respostas e facilita manutenção
 */
export class ApiResponseUtil {
  /**
   * Gera resposta de sucesso
   */
  static success<T>(
    res: Response,
    data?: T,
    message: string = 'Operação realizada com sucesso',
    statusCode: number = HttpStatus.OK
  ): Response {
    const response: ApiResponse<T> = {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    };

    return res.status(statusCode).json(response);
  }

  /**
   * Gera resposta de erro
   */
  static error(
    res: Response,
    message: string = 'Erro interno do servidor',
    statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR,
    error?: string
  ): Response {
    const response: ApiResponse = {
      success: false,
      message,
      error,
      timestamp: new Date().toISOString(),
    };

    return res.status(statusCode).json(response);
  }

  /**
   * Gera resposta de criação bem-sucedida
   */
  static created<T>(
    res: Response,
    data?: T,
    message: string = 'Recurso criado com sucesso'
  ): Response {
    return this.success(res, data, message, HttpStatus.CREATED);
  }

  /**
   * Gera resposta de recurso não encontrado
   */
  static notFound(
    res: Response,
    message: string = 'Recurso não encontrado'
  ): Response {
    return this.error(res, message, HttpStatus.NOT_FOUND);
  }

  /**
   * Gera resposta de dados inválidos
   */
  static badRequest(
    res: Response,
    message: string = 'Dados inválidos fornecidos',
    error?: string
  ): Response {
    return this.error(res, message, HttpStatus.BAD_REQUEST, error);
  }

  /**
   * Gera resposta de conflito (ex: email já existe)
   */
  static conflict(
    res: Response,
    message: string = 'Conflito de dados',
    error?: string
  ): Response {
    return this.error(res, message, HttpStatus.CONFLICT, error);
  }

  /**
   * Gera resposta de não autorizado
   */
  static unauthorized(
    res: Response,
    message: string = 'Não autorizado'
  ): Response {
    return this.error(res, message, HttpStatus.UNAUTHORIZED);
  }

  /**
   * Gera resposta de acesso negado
   */
  static forbidden(
    res: Response,
    message: string = 'Acesso negado'
  ): Response {
    return this.error(res, message, HttpStatus.FORBIDDEN);
  }

  /**
   * Gera resposta de erro interno
   */
  static internalError(
    res: Response,
    message: string = 'Erro interno do servidor',
    error?: string
  ): Response {
    return this.error(res, message, HttpStatus.INTERNAL_SERVER_ERROR, error);
  }
}
