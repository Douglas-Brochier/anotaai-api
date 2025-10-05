/**
 * Sistema de logging customizado
 * Fornece logs estruturados e coloridos para desenvolvimento
 */

export enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG',
}

export class Logger {
  private static formatTimestamp(): string {
    return new Date().toISOString();
  }

  private static formatMessage(level: LogLevel, message: string, meta?: any): string {
    const timestamp = this.formatTimestamp();
    const metaStr = meta ? ` | Meta: ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level}] ${message}${metaStr}`;
  }

  static error(message: string, error?: any): void {
    const formattedMessage = this.formatMessage(LogLevel.ERROR, message, error);
    console.error(`🔴 ${formattedMessage}`);
  }

  static warn(message: string, meta?: any): void {
    const formattedMessage = this.formatMessage(LogLevel.WARN, message, meta);
    console.warn(`🟡 ${formattedMessage}`);
  }

  static info(message: string, meta?: any): void {
    const formattedMessage = this.formatMessage(LogLevel.INFO, message, meta);
    console.log(`🔵 ${formattedMessage}`);
  }

  static debug(message: string, meta?: any): void {
    if (process.env.NODE_ENV === 'development') {
      const formattedMessage = this.formatMessage(LogLevel.DEBUG, message, meta);
      console.log(`🟢 ${formattedMessage}`);
    }
  }

  static request(method: string, url: string, statusCode: number, responseTime: number): void {
    const color = statusCode >= 400 ? '🔴' : statusCode >= 300 ? '🟡' : '🟢';
    this.info(`${color} ${method} ${url} - ${statusCode} - ${responseTime}ms`);
  }
}
