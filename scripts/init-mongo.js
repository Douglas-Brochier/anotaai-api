// Script de inicialização do MongoDB
// Cria usuário e índices necessários para a aplicação

// Conecta ao banco de dados
db = db.getSiblingDB('anota-ai');

// Cria usuário da aplicação
db.createUser({
  user: 'anota-ai-app',
  pwd: 'anota-ai-app-password-2023',
  roles: [
    {
      role: 'readWrite',
      db: 'anota-ai'
    }
  ]
});

// Cria coleção de usuários com validação
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'email', 'password'],
      properties: {
        name: {
          bsonType: 'string',
          minLength: 2,
          maxLength: 100,
          description: 'Nome deve ser uma string entre 2 e 100 caracteres'
        },
        email: {
          bsonType: 'string',
          pattern: '^[^\s@]+@[^\s@]+\.[^\s@]+$',
          description: 'Email deve ter formato válido'
        },
        password: {
          bsonType: 'string',
          minLength: 8,
          description: 'Password deve ter pelo menos 8 caracteres'
        }
      }
    }
  }
});

// Cria coleção de contador de acessos
db.createCollection('access_counter', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['count', 'lastUpdated'],
      properties: {
        count: {
          bsonType: 'number',
          minimum: 0,
          description: 'Contador deve ser um número não negativo'
        },
        lastUpdated: {
          bsonType: 'date',
          description: 'Data da última atualização'
        }
      }
    }
  }
});

// Cria índices para performance
// Índice único para email de usuários
db.users.createIndex({ email: 1 }, { unique: true });

// Índice para busca por data de criação
db.users.createIndex({ createdAt: -1 });

// Índice para última atualização do contador
db.access_counter.createIndex({ lastUpdated: -1 });

// Insere contador inicial se não existir
db.access_counter.updateOne(
  {},
  {
    $setOnInsert: {
      count: 0,
      lastUpdated: new Date(),
      createdAt: new Date()
    }
  },
  { upsert: true }
);

print('✅ Banco de dados inicializado com sucesso!');
print('👤 Usuário da aplicação criado');
print('📊 Coleções e índices configurados');
print('🔢 Contador de acessos inicializado');
