import { AccessCounter, IAccessCounterDocument } from '../models';
import { IAccessCounterResponse } from '../types';
import { Logger } from '../utils';
import { AppError } from '../middleware';

/**
 * Service para gerenciamento do contador de acessos
 * Implementa lógica de negócio e abstrai acesso aos dados
 */
export class AccessCounterService {
  /**
   * Incrementa o contador de acessos de forma atômica
   * Garante consistência mesmo com múltiplas requisições simultâneas
   */
  public static async incrementAccess(): Promise<IAccessCounterResponse> {
    try {
      Logger.debug('Incrementando contador de acessos');
      
      const counter = await AccessCounter.incrementCounter();
      
      if (!counter) {
        throw new AppError('Erro ao incrementar contador de acessos', 500);
      }

      Logger.info('Contador de acessos incrementado', { 
        newCount: counter.count,
        lastUpdated: counter.lastUpdated 
      });

      return {
        count: counter.count,
        lastUpdated: counter.lastUpdated,
      };
    } catch (error) {
      Logger.error('Erro ao incrementar contador de acessos', error);
      
      if (error instanceof AppError) {
        throw error;
      }
      
      throw new AppError('Erro interno ao incrementar contador', 500);
    }
  }

  /**
   * Obtém o contador atual de acessos
   * Retorna 0 se nenhum contador existir ainda
   */
  public static async getCurrentCount(): Promise<IAccessCounterResponse> {
    try {
      Logger.debug('Obtendo contador atual de acessos');
      
      const counter = await AccessCounter.getCurrentCount();
      
      // Se não existe contador ainda, retorna 0
      if (!counter) {
        Logger.info('Nenhum contador encontrado, retornando 0');
        return {
          count: 0,
          lastUpdated: new Date(),
        };
      }

      Logger.debug('Contador obtido com sucesso', { 
        count: counter.count,
        lastUpdated: counter.lastUpdated 
      });

      return {
        count: counter.count,
        lastUpdated: counter.lastUpdated,
      };
    } catch (error) {
      Logger.error('Erro ao obter contador de acessos', error);
      throw new AppError('Erro interno ao obter contador', 500);
    }
  }

  /**
   * Reseta o contador para 0
   * Útil para manutenção e testes
   */
  public static async resetCounter(): Promise<IAccessCounterResponse> {
    try {
      Logger.warn('Resetando contador de acessos');
      
      const counter = await AccessCounter.resetCounter();
      
      if (!counter) {
        throw new AppError('Erro ao resetar contador de acessos', 500);
      }

      Logger.info('Contador de acessos resetado com sucesso');

      return {
        count: counter.count,
        lastUpdated: counter.lastUpdated,
      };
    } catch (error) {
      Logger.error('Erro ao resetar contador de acessos', error);
      
      if (error instanceof AppError) {
        throw error;
      }
      
      throw new AppError('Erro interno ao resetar contador', 500);
    }
  }

  /**
   * Obtém estatísticas do contador
   * Fornece informações adicionais sobre o uso
   */
  public static async getStatistics(): Promise<{
    count: number;
    lastUpdated: Date;
    averageAccessesPerDay?: number;
    createdAt?: Date;
  }> {
    try {
      Logger.debug('Obtendo estatísticas do contador');
      
      const counter = await AccessCounter.findOne({});
      
      if (!counter) {
        return {
          count: 0,
          lastUpdated: new Date(),
        };
      }

      // Calcula média de acessos por dia se possível
      let averageAccessesPerDay: number | undefined;
      
      if (counter.createdAt) {
        const daysSinceCreation = Math.max(
          1,
          Math.floor((Date.now() - counter.createdAt.getTime()) / (1000 * 60 * 60 * 24))
        );
        averageAccessesPerDay = counter.count / daysSinceCreation;
      }

      return {
        count: counter.count,
        lastUpdated: counter.lastUpdated,
        averageAccessesPerDay,
        createdAt: counter.createdAt,
      };
    } catch (error) {
      Logger.error('Erro ao obter estatísticas do contador', error);
      throw new AppError('Erro interno ao obter estatísticas', 500);
    }
  }

  /**
   * Valida se o contador está em um estado consistente
   * Útil para verificações de integridade
   */
  public static async validateIntegrity(): Promise<boolean> {
    try {
      const counters = await AccessCounter.find({});
      
      // Deve haver exatamente um contador
      if (counters.length > 1) {
        Logger.error('Múltiplos contadores encontrados', { count: counters.length });
        return false;
      }
      
      // Se existe um contador, deve ter valores válidos
      if (counters.length === 1) {
        const counter = counters[0];
        if (counter.count < 0) {
          Logger.error('Contador com valor negativo', { count: counter.count });
          return false;
        }
      }
      
      return true;
    } catch (error) {
      Logger.error('Erro ao validar integridade do contador', error);
      return false;
    }
  }
}
