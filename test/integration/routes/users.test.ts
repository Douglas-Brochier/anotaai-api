import request from 'supertest';
import { App } from '../../../src/app';

describe('Users Routes Integration', () => {
  let app: App;
  let server: any;

  beforeAll(async () => {
    app = new App();
    await app.initialize();
    server = app.app;
  });

  const validUser = {
    name: 'João Silva',
    email: 'joao.silva@test.com',
    password: 'MinhaSenh@123'
  };

  describe('POST /api/users', () => {
    it('should create a new user', async () => {
      const response = await request(server)
        .post('/api/users')
        .send(validUser)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(validUser.name);
      expect(response.body.data.email).toBe(validUser.email);
      expect(response.body.data.password).toBeUndefined();
      expect(response.body.data._id).toBeDefined();
    });

    it('should not create user with invalid email', async () => {
      const invalidUser = {
        ...validUser,
        email: 'invalid-email'
      };

      const response = await request(server)
        .post('/api/users')
        .send(invalidUser)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should not create user with weak password', async () => {
      const weakPasswordUser = {
        ...validUser,
        password: '123'
      };

      const response = await request(server)
        .post('/api/users')
        .send(weakPasswordUser)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should not create user with duplicate email', async () => {
      // Cria primeiro usuário
      await request(server)
        .post('/api/users')
        .send(validUser);

      // Tenta criar com mesmo email
      const response = await request(server)
        .post('/api/users')
        .send({
          ...validUser,
          name: 'Outro Nome'
        })
        .expect(409);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/users', () => {
    beforeEach(async () => {
      // Cria alguns usuários para teste
      for (let i = 0; i < 3; i++) {
        await request(server)
          .post('/api/users')
          .send({
            name: `User ${i}`,
            email: `user${i}@test.com`,
            password: 'Password123'
          });
      }
    });

    it('should list users with pagination', async () => {
      const response = await request(server)
        .get('/api/users?page=1&limit=2')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.users).toHaveLength(2);
      expect(response.body.data.pagination.page).toBe(1);
      expect(response.body.data.pagination.limit).toBe(2);
      expect(response.body.data.pagination.total).toBe(3);
    });

    it('should return default pagination', async () => {
      const response = await request(server)
        .get('/api/users')
        .expect(200);

      expect(response.body.data.pagination.page).toBe(1);
      expect(response.body.data.pagination.limit).toBe(10);
    });
  });

  describe('GET /api/users/:id', () => {
    let userId: string;

    beforeEach(async () => {
      const createResponse = await request(server)
        .post('/api/users')
        .send(validUser);
      userId = createResponse.body.data._id;
    });

    it('should get user by id', async () => {
      const response = await request(server)
        .get(`/api/users/${userId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(userId);
      expect(response.body.data.password).toBeUndefined();
    });

    it('should return 404 for non-existing user', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(server)
        .get(`/api/users/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for invalid id format', async () => {
      const response = await request(server)
        .get('/api/users/invalid-id')
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/users/:id', () => {
    let userId: string;

    beforeEach(async () => {
      const createResponse = await request(server)
        .post('/api/users')
        .send(validUser);
      userId = createResponse.body.data._id;
    });

    it('should update user name', async () => {
      const newName = 'João Santos';
      const response = await request(server)
        .put(`/api/users/${userId}`)
        .send({ name: newName })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(newName);
    });

    it('should update user email', async () => {
      const newEmail = 'joao.santos@test.com';
      const response = await request(server)
        .put(`/api/users/${userId}`)
        .send({ email: newEmail })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe(newEmail);
    });

    it('should not update to existing email', async () => {
      // Cria outro usuário
      await request(server)
        .post('/api/users')
        .send({
          name: 'Maria',
          email: 'maria@test.com',
          password: 'Password123'
        });

      // Tenta atualizar para email existente
      const response = await request(server)
        .put(`/api/users/${userId}`)
        .send({ email: 'maria@test.com' })
        .expect(409);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/users/:id', () => {
    let userId: string;

    beforeEach(async () => {
      const createResponse = await request(server)
        .post('/api/users')
        .send(validUser);
      userId = createResponse.body.data._id;
    });

    it('should delete user', async () => {
      const response = await request(server)
        .delete(`/api/users/${userId}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verifica se usuário foi realmente deletado
      await request(server)
        .get(`/api/users/${userId}`)
        .expect(404);
    });

    it('should return 404 when deleting non-existing user', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(server)
        .delete(`/api/users/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/users/statistics', () => {
    it('should return user statistics', async () => {
      // Cria alguns usuários
      await request(server)
        .post('/api/users')
        .send(validUser);

      const response = await request(server)
        .get('/api/users/statistics')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.totalUsers).toBeGreaterThan(0);
      expect(response.body.data.usersToday).toBeDefined();
      expect(response.body.data.usersThisWeek).toBeDefined();
      expect(response.body.data.usersThisMonth).toBeDefined();
    });
  });

  describe('GET /api/users/search/email', () => {
    beforeEach(async () => {
      await request(server)
        .post('/api/users')
        .send(validUser);
    });

    it('should find user by email', async () => {
      const response = await request(server)
        .get(`/api/users/search/email?email=${validUser.email}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe(validUser.email);
    });

    it('should return 404 for non-existing email', async () => {
      const response = await request(server)
        .get('/api/users/search/email?email=notfound@test.com')
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 when email not provided', async () => {
      const response = await request(server)
        .get('/api/users/search/email')
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});
