import request from 'supertest';
import { App } from '../../../src/app';

describe('Access Routes Integration', () => {
  let app: App;
  let server: any;

  beforeAll(async () => {
    app = new App();
    await app.initialize();
    server = app.app;
  });

  describe('POST /api/access/increment', () => {
    it('should increment access counter', async () => {
      const response = await request(server)
        .post('/api/access/increment')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.count).toBe(1);
      expect(response.body.data.lastUpdated).toBeDefined();
    });

    it('should increment counter multiple times', async () => {
      // Primeiro incremento
      await request(server)
        .post('/api/access/increment')
        .expect(200);

      // Segundo incremento
      const response = await request(server)
        .post('/api/access/increment')
        .expect(200);

      expect(response.body.data.count).toBe(2);
    });
  });

  describe('GET /api/access/count', () => {
    it('should return current count', async () => {
      // Incrementa contador
      await request(server)
        .post('/api/access/increment');

      // Obtém contador
      const response = await request(server)
        .get('/api/access/count')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.count).toBe(1);
    });

    it('should return 0 when no increments made', async () => {
      const response = await request(server)
        .get('/api/access/count')
        .expect(200);

      expect(response.body.data.count).toBe(0);
    });
  });

  describe('GET /api/access/statistics', () => {
    it('should return statistics', async () => {
      // Incrementa contador
      await request(server)
        .post('/api/access/increment');

      const response = await request(server)
        .get('/api/access/statistics')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.count).toBe(1);
      expect(response.body.data.lastUpdated).toBeDefined();
    });
  });

  describe('GET /api/access/health', () => {
    it('should return health status', async () => {
      const response = await request(server)
        .get('/api/access/health')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('healthy');
      expect(response.body.data.valid).toBe(true);
    });
  });

  describe('POST /api/access/reset', () => {
    it('should reset counter in development', async () => {
      // Incrementa contador
      await request(server)
        .post('/api/access/increment');

      // Reseta contador
      const response = await request(server)
        .post('/api/access/reset')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.count).toBe(0);
    });
  });
});
