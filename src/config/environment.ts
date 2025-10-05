import dotenv from 'dotenv';

// Carrega variáveis de ambiente
dotenv.config();

/**
 * Validação e tipagem das variáveis de ambiente
 * Garante que todas as configurações necessárias estejam presentes
 */
interface EnvironmentConfig {
  node: {
    env: string;
    port: number;
  };
  mongodb: {
    uri: string;
  };
  jwt: {
    secret: string;
  };
  bcrypt: {
    rounds: number;
  };
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
}

/**
 * Valida se uma variável de ambiente obrigatória está presente
 */
function requireEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`❌ Variável de ambiente obrigatória não encontrada: ${name}`);
  }
  return value;
}

/**
 * Converte string para número com valor padrão
 */
function parseNumber(value: string | undefined, defaultValue: number): number {
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Configuração centralizada da aplicação
 */
export const config: EnvironmentConfig = {
  node: {
    env: process.env.NODE_ENV || 'development',
    port: parseNumber(process.env.PORT, 3000),
  },
  mongodb: {
    uri: requireEnvVar('MONGODB_URI'),
  },
  jwt: {
    secret: requireEnvVar('JWT_SECRET'),
  },
  bcrypt: {
    rounds: parseNumber(process.env.BCRYPT_ROUNDS, 10),
  },
  rateLimit: {
    windowMs: parseNumber(process.env.RATE_LIMIT_WINDOW_MS, 900000), // 15 minutos
    maxRequests: parseNumber(process.env.RATE_LIMIT_MAX_REQUESTS, 100),
  },
};

/**
 * Valida todas as configurações no startup
 */
export function validateEnvironment(): void {
  const requiredVars = ['MONGODB_URI', 'JWT_SECRET'];
  
  for (const varName of requiredVars) {
    try {
      requireEnvVar(varName);
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  }

  console.log('✅ Variáveis de ambiente validadas com sucesso');
}

/**
 * Verifica se está em ambiente de produção
 */
export const isProduction = (): boolean => config.node.env === 'production';

/**
 * Verifica se está em ambiente de desenvolvimento
 */
export const isDevelopment = (): boolean => config.node.env === 'development';

/**
 * Verifica se está em ambiente de teste
 */
export const isTest = (): boolean => config.node.env === 'test';
