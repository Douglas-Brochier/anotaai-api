import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';
import { Request, Response, NextFunction } from 'express';
import { config } from '../config/environment';
import { ApiResponseUtil, Logger } from '../utils';

/**
 * Configuração do Rate Limiting
 * Previne ataques de força bruta e spam
 */
export const rateLimitConfig = rateLimit({
  windowMs: config.rateLimit.windowMs, // Janela de tempo
  max: config.rateLimit.maxRequests, // Máximo de requests por janela
  message: {
    success: false,
    message: 'Muitas tentativas, tente novamente em alguns minutos',
    timestamp: new Date().toISOString(),
  },
  standardHeaders: true, // Inclui headers padrão de rate limit
  legacyHeaders: false, // Remove headers legados
  handler: (req: Request, res: Response) => {
    Logger.warn(`Rate limit exceeded for IP: ${req.ip}`, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path,
    });
    
    ApiResponseUtil.error(
      res,
      'Muitas tentativas, tente novamente em alguns minutos',
      429
    );
  },
  skip: (req: Request) => {
    // Pula rate limiting para health checks
    return req.path === '/health' || req.path === '/';
  },
});

/**
 * Rate limiting mais restritivo para criação de usuários
 */
export const userCreationRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // Máximo 5 criações de usuário por IP por 15 minutos
  message: {
    success: false,
    message: 'Muitas tentativas de criação de usuário, tente novamente em 15 minutos',
    timestamp: new Date().toISOString(),
  },
  handler: (req: Request, res: Response) => {
    Logger.warn(`User creation rate limit exceeded for IP: ${req.ip}`, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });
    
    ApiResponseUtil.error(
      res,
      'Muitas tentativas de criação de usuário, tente novamente em 15 minutos',
      429
    );
  },
});

/**
 * Configuração do CORS
 * Define origens permitidas e headers aceitos
 */
export const corsConfig = cors({
  origin: (origin, callback) => {
    // Em desenvolvimento, permite qualquer origem
    if (process.env.NODE_ENV === 'development') {
      callback(null, true);
      return;
    }
    
    // Em produção, define origens específicas
    const allowedOrigins = [
      'https://anotaai.com',
      'https://www.anotaai.com',
      'https://app.anotaai.com',
    ];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      Logger.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Não permitido pelo CORS'));
    }
  },
  credentials: true, // Permite cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'Pragma',
  ],
  exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining'],
  maxAge: 86400, // Cache do preflight por 24h
});

/**
 * Configuração do Helmet para segurança
 * Define headers de segurança HTTP
 */
export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"], // Para Swagger UI
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false, // Para compatibilidade com Swagger
  hsts: {
    maxAge: 31536000, // 1 ano
    includeSubDomains: true,
    preload: true,
  },
});

/**
 * Middleware para logging de requisições suspeitas
 */
export const securityLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const suspiciousPatterns = [
    /\.\./,           // Path traversal
    /<script/i,       // XSS
    /union.*select/i, // SQL injection
    /javascript:/i,   // JavaScript injection
    /'.*or.*'/i,      // SQL injection
  ];
  
  const userAgent = req.get('User-Agent') || '';
  const url = req.url;
  const body = JSON.stringify(req.body);
  
  // Verifica padrões suspeitos
  const hasSuspiciousPattern = suspiciousPatterns.some(pattern => 
    pattern.test(url) || pattern.test(body) || pattern.test(userAgent)
  );
  
  if (hasSuspiciousPattern) {
    Logger.warn('Requisição suspeita detectada', {
      ip: req.ip,
      method: req.method,
      url: req.url,
      userAgent,
      body: req.body,
    });
  }
  
  next();
};

/**
 * Middleware para validar User-Agent
 */
export const validateUserAgent = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const userAgent = req.get('User-Agent');
  
  if (!userAgent) {
    Logger.warn('Requisição sem User-Agent', { ip: req.ip });
    ApiResponseUtil.badRequest(res, 'User-Agent é obrigatório');
    return;
  }
  
  // Bloqueia bots maliciosos conhecidos
  const maliciousBots = [
    /sqlmap/i,
    /nikto/i,
    /nessus/i,
    /masscan/i,
    /nmap/i,
  ];
  
  if (maliciousBots.some(bot => bot.test(userAgent))) {
    Logger.warn('Bot malicioso detectado', { ip: req.ip, userAgent });
    ApiResponseUtil.forbidden(res, 'Acesso negado');
    return;
  }
  
  next();
};

/**
 * Middleware para sanitizar headers
 */
export const sanitizeHeaders = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Remove headers potencialmente perigosos
  delete req.headers['x-forwarded-host'];
  delete req.headers['x-original-url'];
  delete req.headers['x-rewrite-url'];
  
  next();
};
