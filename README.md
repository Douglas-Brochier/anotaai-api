# Anota AI API

API robusta e escalável para contagem de acessos e gerenciamento de usuários, desenvolvida com TypeScript, Express.js e MongoDB.

## 🚀 Funcionalidades

### ✅ Requisitos Implementados

1. **Rota para incrementar acessos**: `POST /api/access/increment`
2. **Rota para consultar acessos**: `GET /api/access/count`
3. **Rota para criar usuário**: `POST /api/users`
4. **Rota para visualizar usuário**: `GET /api/users/:id`

### 🎯 Funcionalidades Extras

- ✅ **Documentação OpenAPI/Swagger** completa
- ✅ **Testes unitários** e de integração
- ✅ **Rate limiting** e middlewares de segurança
- ✅ **Validação robusta** de dados
- ✅ **Logging estruturado**
- ✅ **Health checks** detalhados
- ✅ **Containerização Docker**
- ✅ **Clean Architecture** com TypeScript
- ✅ **Tratamento global de erros**

## 📋 Pré-requisitos

- Node.js 16+ 
- MongoDB 4.4+
- npm ou yarn

## 🛠️ Instalação e Execução

### Desenvolvimento Local

```bash
# Clone o repositório
git clone <url-do-repositorio>
cd anota-ai-api

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações

# Inicie o MongoDB localmente
# mongod

# Execute em modo desenvolvimento
npm run dev

# Ou compile e execute
npm run build
npm start
```

### Docker

```bash
# Build da imagem
docker build -t anota-ai-api .

# Execute com Docker Compose
docker-compose up -d
```

### Variáveis de Ambiente

```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/anota-ai
JWT_SECRET=seu-secret-aqui
BCRYPT_ROUNDS=10
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 📚 Documentação da API

### Base URL
```
http://localhost:3000
```

### Swagger UI
Acesse a documentação interativa em: `http://localhost:3000/api-docs`

### Endpoints Principais

#### Contador de Acessos

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/access/increment` | Incrementa contador |
| GET | `/api/access/count` | Obtém contador atual |

#### Usuários

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/users` | Cria novo usuário |
| GET | `/api/users/:id` | Obtém usuário por ID |
| GET | `/api/users` | Lista usuários (paginado) |
| PUT | `/api/users/:id` | Atualiza usuário |
| DELETE | `/api/users/:id` | Remove usuário |

#### Monitoramento

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/health` | Health check básico |
| GET | `/health/detailed` | Health check detalhado |
| GET | `/metrics` | Métricas da aplicação |

### Exemplos de Uso

#### Incrementar Contador
```bash
curl -X POST http://localhost:3000/api/access/increment
```

#### Criar Usuário
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@email.com",
    "password": "MinhaSenh@123"
  }'
```

#### Obter Contador
```bash
curl http://localhost:3000/api/access/count
```

## 🧪 Testes

```bash
# Executar todos os testes
npm test

# Executar testes com coverage
npm run test:coverage

# Executar testes em modo watch
npm run test:watch

# Executar apenas testes unitários
npm test -- test/unit

# Executar apenas testes de integração
npm test -- test/integration
```

## 🏗️ Arquitetura

A aplicação segue os princípios de **Clean Architecture** com separação clara de responsabilidades:

```
src/
├── config/         # Configurações (DB, env)
├── controllers/    # Controllers HTTP
├── middleware/     # Middlewares Express
├── models/        # Models MongoDB/Mongoose
├── routes/        # Definição de rotas
├── services/      # Lógica de negócio
├── types/         # Interfaces TypeScript
├── utils/         # Utilitários
├── app.ts         # Setup da aplicação
└── server.ts      # Entry point
```

### Tecnologias Utilizadas

- **Backend**: Node.js, TypeScript, Express.js
- **Banco de Dados**: MongoDB, Mongoose
- **Segurança**: Helmet, CORS, Rate Limiting, bcrypt
- **Validação**: express-validator
- **Documentação**: Swagger/OpenAPI
- **Testes**: Jest, Supertest, MongoDB Memory Server
- **Logging**: Winston-style custom logger
- **Containerização**: Docker, Docker Compose

## 🔒 Segurança

A API implementa múltiplas camadas de segurança:

- ✅ **Rate Limiting** por IP
- ✅ **Validação de entrada** rigorosa
- ✅ **Sanitização** de dados
- ✅ **Headers de segurança** (Helmet)
- ✅ **Proteção CORS** configurável
- ✅ **Hash de senhas** com bcrypt
- ✅ **Validação de User-Agent**
- ✅ **Detecção de bots maliciosos**

## 📊 Monitoramento

### Health Checks

- `/health` - Status básico da aplicação
- `/health/detailed` - Status detalhado com dependências
- `/metrics` - Métricas de performance

### Logging

Sistema de logging estruturado com níveis:
- `ERROR` - Erros críticos
- `WARN` - Avisos importantes
- `INFO` - Informações gerais
- `DEBUG` - Debug (apenas desenvolvimento)

## 🚀 Deploy

### Produção

```bash
# Build otimizado
npm run build

# Variáveis de ambiente para produção
export NODE_ENV=production
export MONGODB_URI=mongodb://prod-host:27017/anota-ai
export JWT_SECRET=seu-secret-forte-aqui

# Execute
npm start
```

### Docker Compose

```yaml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/anota-ai
    depends_on:
      - mongo
  
  mongo:
    image: mongo:5.0
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
```

## 📈 Performance

### Otimizações Implementadas

- ✅ **Compressão gzip** de respostas
- ✅ **Operações atômicas** no MongoDB
- ✅ **Índices otimizados** nas collections
- ✅ **Connection pooling** no Mongoose
- ✅ **Lean queries** quando apropriado
- ✅ **Timeout handling** para requisições

### Métricas

A API expõe métricas em `/metrics`:
- Uso de memória
- Tempo de atividade
- Uso de CPU
- Status das conexões

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'feat: add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### Commit Convention

Este projeto segue a convenção [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` nova funcionalidade
- `fix:` correção de bug
- `docs:` documentação
- `style:` formatação
- `refactor:` refatoração
- `test:` testes
- `chore:` tarefas auxiliares

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 👨‍💻 Autor

Desenvolvido para o desafio técnico da **Anota AI**.

---

## 📚 Principais Decisões Técnicas

### Por que TypeScript?
- **Type Safety**: Previne erros em tempo de compilação
- **Melhor IDE Support**: IntelliSense e refactoring
- **Documentação viva**: Interfaces servem como documentação
- **Escalabilidade**: Facilita manutenção em projetos grandes

### Por que MongoDB?
- **Flexibilidade**: Schema flexível para evolução
- **Performance**: Otimizado para reads frequentes
- **Operações Atômicas**: Incremento atômico do contador
- **Escalabilidade**: Suporte nativo a sharding

### Por que Express.js?
- **Simplicidade**: Framework minimalista e flexível
- **Ecossistema**: Vasta gama de middlewares
- **Performance**: Excelente performance para APIs REST
- **Comunidade**: Grande comunidade e suporte

### Padrões Implementados

- **Repository Pattern**: Abstração da camada de dados
- **Service Layer**: Lógica de negócio isolada
- **Dependency Injection**: Baixo acoplamento
- **Error Handling**: Tratamento centralizado
- **Validation**: Validação em múltiplas camadas

---

🎯 **API pronta para produção com foco em segurança, performance e manutenibilidade!**
