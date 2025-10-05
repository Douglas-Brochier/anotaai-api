import { Request, Response, NextFunction } from 'express';
import { body, validationResult, ValidationChain } from 'express-validator';
import { ApiResponseUtil } from '../utils';

/**
 * Middleware para processar resultados de validação
 * Intercepta erros de validação e retorna resposta padronizada
 */
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg).join(', ');
    ApiResponseUtil.badRequest(res, 'Dados inválidos', errorMessages);
    return;
  }
  
  next();
};

/**
 * Validações para criação de usuário
 */
export const validateUserCreation: ValidationChain[] = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Nome é obrigatório')
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres')
    .matches(/^[a-zA-ZÀ-ÿ\s]+$/)
    .withMessage('Nome deve conter apenas letras e espaços'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email é obrigatório')
    .isEmail()
    .withMessage('Email deve ter um formato válido')
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage('Email não pode exceder 255 caracteres'),

  body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage('Senha deve ter entre 8 e 128 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)
    .withMessage('Senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número'),
];

/**
 * Validações para busca de usuário por ID
 */
export const validateUserId: ValidationChain[] = [
  body('id')
    .optional()
    .isMongoId()
    .withMessage('ID deve ser um ObjectId válido do MongoDB'),
];

/**
 * Middleware para sanitizar dados de entrada
 */
export const sanitizeInput = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Remove campos undefined e null do body
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (req.body[key] === undefined || req.body[key] === null) {
        delete req.body[key];
      }
      // Trim strings
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].trim();
      }
    });
  }
  
  next();
};

/**
 * Middleware para validar parâmetros de query opcionais
 */
export const validateQueryParams = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { page, limit } = req.query;
  
  // Validação de paginação se fornecida
  if (page) {
    const pageNum = parseInt(page as string);
    if (isNaN(pageNum) || pageNum < 1) {
      ApiResponseUtil.badRequest(res, 'Parâmetro page deve ser um número positivo');
      return;
    }
  }
  
  if (limit) {
    const limitNum = parseInt(limit as string);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      ApiResponseUtil.badRequest(res, 'Parâmetro limit deve ser um número entre 1 e 100');
      return;
    }
  }
  
  next();
};

/**
 * Middleware de validação para parâmetros de rota
 */
export const validateRouteParams = (paramName: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const param = req.params[paramName];
    
    if (!param) {
      ApiResponseUtil.badRequest(res, `Parâmetro ${paramName} é obrigatório`);
      return;
    }
    
    // Se for um ID do MongoDB
    if (paramName === 'id' || paramName.endsWith('Id')) {
      if (!/^[0-9a-fA-F]{24}$/.test(param)) {
        ApiResponseUtil.badRequest(res, `${paramName} deve ser um ObjectId válido do MongoDB`);
        return;
      }
    }
    
    next();
  };
};
