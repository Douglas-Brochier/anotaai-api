import { AccessCounterService } from '../../../src/services/AccessCounterService';
import { AccessCounter } from '../../../src/models/AccessCounter';

describe('AccessCounterService', () => {
  beforeEach(async () => {
    // Limpa contador antes de cada teste
    await AccessCounter.deleteMany({});
  });

  describe('incrementAccess', () => {
    it('should increment access counter from 0 to 1', async () => {
      const result = await AccessCounterService.incrementAccess();
      
      expect(result.count).toBe(1);
      expect(result.lastUpdated).toBeDefined();
      expect(result.lastUpdated).toBeInstanceOf(Date);
    });

    it('should increment existing counter', async () => {
      // Cria contador inicial
      await AccessCounterService.incrementAccess();
      
      // Incrementa novamente
      const result = await AccessCounterService.incrementAccess();
      
      expect(result.count).toBe(2);
    });

    it('should handle multiple concurrent increments', async () => {
      const promises = Array.from({ length: 10 }, () => 
        AccessCounterService.incrementAccess()
      );
      
      await Promise.all(promises);
      
      const final = await AccessCounterService.getCurrentCount();
      expect(final.count).toBe(10);
    });
  });

  describe('getCurrentCount', () => {
    it('should return 0 when no counter exists', async () => {
      const result = await AccessCounterService.getCurrentCount();
      
      expect(result.count).toBe(0);
      expect(result.lastUpdated).toBeDefined();
    });

    it('should return existing counter', async () => {
      await AccessCounterService.incrementAccess();
      await AccessCounterService.incrementAccess();
      
      const result = await AccessCounterService.getCurrentCount();
      
      expect(result.count).toBe(2);
    });
  });

  describe('resetCounter', () => {
    it('should reset counter to 0', async () => {
      // Incrementa contador
      await AccessCounterService.incrementAccess();
      await AccessCounterService.incrementAccess();
      
      // Reseta
      const result = await AccessCounterService.resetCounter();
      
      expect(result.count).toBe(0);
      expect(result.lastUpdated).toBeDefined();
    });

    it('should reset non-existing counter', async () => {
      const result = await AccessCounterService.resetCounter();
      
      expect(result.count).toBe(0);
    });
  });

  describe('getStatistics', () => {
    it('should return statistics with average when counter exists', async () => {
      await AccessCounterService.incrementAccess();
      
      const result = await AccessCounterService.getStatistics();
      
      expect(result.count).toBe(1);
      expect(result.lastUpdated).toBeDefined();
      expect(result.createdAt).toBeDefined();
      expect(typeof result.averageAccessesPerDay).toBe('number');
    });

    it('should return default statistics when no counter exists', async () => {
      const result = await AccessCounterService.getStatistics();
      
      expect(result.count).toBe(0);
      expect(result.lastUpdated).toBeDefined();
    });
  });

  describe('validateIntegrity', () => {
    it('should return true for valid state', async () => {
      await AccessCounterService.incrementAccess();
      
      const result = await AccessCounterService.validateIntegrity();
      
      expect(result).toBe(true);
    });

    it('should return true when no counter exists', async () => {
      const result = await AccessCounterService.validateIntegrity();
      
      expect(result).toBe(true);
    });

    it('should return false when multiple counters exist', async () => {
      // Cria dois contadores manualmente para simular estado inválido
      await AccessCounter.create({ count: 1, lastUpdated: new Date() });
      await AccessCounter.create({ count: 2, lastUpdated: new Date() });
      
      const result = await AccessCounterService.validateIntegrity();
      
      expect(result).toBe(false);
    });
  });
});
