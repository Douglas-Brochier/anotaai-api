/**
 * Arquivo de exportação centralizada dos middlewares
 */

export {
  handleValidationErrors,
  validateUserCreation,
  validateUserId,
  sanitizeInput,
  validateQueryParams,
  validateRouteParams,
} from './validation';

export {
  rateLimitConfig,
  userCreationRateLimit,
  corsConfig,
  helmetConfig,
  securityLogger,
  validateUserAgent,
  sanitizeHeaders,
} from './security';

export {
  globalErrorHandler,
  notFoundHandler,
  asyncHandler,
  AppError,
  timeoutHandler,
} from './errorHandler';
