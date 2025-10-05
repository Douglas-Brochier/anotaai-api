import { Request, Response, NextFunction } from 'express';
import { ApiResponseUtil, Logger } from '../utils';
import { CustomError } from '../types';

/**
 * Middleware global para tratamento de erros
 * Centraliza o tratamento de todos os erros da aplicação
 */
export const globalErrorHandler = (
  error: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Se a resposta já foi enviada, delega para o handler padrão do Express
  if (res.headersSent) {
    return next(error);
  }

  // Log do erro com contexto
  Logger.error('Erro capturado pelo middleware global', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    body: req.body,
  });

  // Determina o status code
  const statusCode = error.statusCode || 500;
  
  // Determina a mensagem baseada no tipo de erro
  let message = 'Erro interno do servidor';
  let errorDetail: string | undefined;

  if (error.isOperational || statusCode < 500) {
    // Erros operacionais (esperados) - pode mostrar a mensagem
    message = error.message || message;
    if (process.env.NODE_ENV === 'development') {
      errorDetail = error.stack;
    }
  } else {
    // Erros de programação - não vaza detalhes em produção
    if (process.env.NODE_ENV === 'development') {
      message = error.message;
      errorDetail = error.stack;
    }
  }

  // Trata erros específicos do MongoDB
  if (error.name === 'ValidationError') {
    const validationErrors = Object.values((error as any).errors)
      .map((err: any) => err.message)
      .join(', ');
    
    ApiResponseUtil.badRequest(res, 'Dados inválidos', validationErrors);
    return;
  }

  if (error.name === 'CastError') {
    ApiResponseUtil.badRequest(res, 'ID inválido fornecido');
    return;
  }

  if (error.name === 'MongoServerError' && (error as any).code === 11000) {
    const field = Object.keys((error as any).keyPattern)[0];
    ApiResponseUtil.conflict(res, `${field} já está em uso`);
    return;
  }

  // Trata erros de JSON malformado
  if (error.name === 'SyntaxError' && 'body' in error) {
    ApiResponseUtil.badRequest(res, 'JSON inválido no corpo da requisição');
    return;
  }

  // Resposta padrão para outros erros
  ApiResponseUtil.error(res, message, statusCode, errorDetail);
};

/**
 * Middleware para capturar rotas não encontradas (404)
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  Logger.warn(`Rota não encontrada: ${req.method} ${req.url}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  ApiResponseUtil.notFound(res, `Rota ${req.method} ${req.url} não encontrada`);
};

/**
 * Middleware para tratar erros assíncronos
 * Wrapper que captura promises rejeitadas
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Classe para criar erros operacionais personalizados
 */
export class AppError extends Error implements CustomError {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // Mantém o stack trace correto
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Middleware para timeout de requisições
 */
export const timeoutHandler = (timeoutMs: number = 30000) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const timeout = setTimeout(() => {
      if (!res.headersSent) {
        Logger.warn(`Timeout de requisição: ${req.method} ${req.url}`, {
          timeout: timeoutMs,
          ip: req.ip,
        });
        
        ApiResponseUtil.error(
          res,
          'Timeout da requisição',
          504
        );
      }
    }, timeoutMs);

    // Limpa o timeout quando a resposta é enviada
    res.on('finish', () => {
      clearTimeout(timeout);
    });

    res.on('close', () => {
      clearTimeout(timeout);
    });

    next();
  };
};
