import { Request } from 'express';

/**
 * Interface para o contador de acessos
 */
export interface IAccessCounter {
  count: number;
  lastUpdated: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Interface para o usuário
 */
export interface IUser {
  name: string;
  email: string;
  password: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Interface para criação de usuário (sem password hasheado)
 */
export interface IUserCreateRequest {
  name: string;
  email: string;
  password: string;
}

/**
 * Interface para resposta de usuário (sem password)
 */
export interface IUserResponse {
  _id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface para resposta de contador de acessos
 */
export interface IAccessCounterResponse {
  count: number;
  lastUpdated: Date;
}

/**
 * Interface para resposta padrão da API
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
}

/**
 * Interface para erro customizado
 */
export interface CustomError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

/**
 * Interface para request com validação
 */
export interface ValidatedRequest<T> extends Request {
  validatedData: T;
}

/**
 * Tipos para validação
 */
export type ValidationResult = {
  isValid: boolean;
  errors: string[];
};

/**
 * Enums para status HTTP
 */
export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  INTERNAL_SERVER_ERROR = 500,
  SERVICE_UNAVAILABLE = 503,
}

/**
 * Enum para mensagens padrão
 */
export enum Messages {
  SUCCESS = 'Operação realizada com sucesso',
  CREATED = 'Recurso criado com sucesso',
  UPDATED = 'Recurso atualizado com sucesso',
  DELETED = 'Recurso deletado com sucesso',
  NOT_FOUND = 'Recurso não encontrado',
  INVALID_DATA = 'Dados inválidos fornecidos',
  INTERNAL_ERROR = 'Erro interno do servidor',
  UNAUTHORIZED = 'Não autorizado',
  FORBIDDEN = 'Acesso negado',
  CONFLICT = 'Conflito de dados',
  VALIDATION_ERROR = 'Erro de validação',
  DATABASE_ERROR = 'Erro na base de dados',
}

/**
 * Interface para configuração de paginação
 */
export interface PaginationConfig {
  page: number;
  limit: number;
  skip: number;
}

/**
 * Interface para resposta paginada
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
