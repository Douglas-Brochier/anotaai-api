# 📋 Guia de Uso - Anota AI API

## 🚀 Início Rápido

### 1. Usar Docker (Recomendado)

```bash
# Clone o repositório
git clone <url-do-repositorio>
cd anota-ai-api

# Inicie com Docker Compose
docker-compose up -d

# Verifique se está funcionando
curl http://localhost:3000/health
```

### 2. Desenvolvimento Local

```bash
# No Windows (PowerShell)
.\scripts\start-dev.ps1

# No Linux/Mac
chmod +x scripts/start-dev.sh
./scripts/start-dev.sh
```

## 📚 Exemplos de Uso da API

### Contador de Acessos

#### Incrementar contador
```bash
curl -X POST http://localhost:3000/api/access/increment \
  -H "Content-Type: application/json"
```

**Resposta:**
```json
{
  "success": true,
  "message": "Acesso incrementado com sucesso",
  "data": {
    "count": 1,
    "lastUpdated": "2023-10-02T14:30:00.000Z"
  },
  "timestamp": "2023-10-02T14:30:00.123Z"
}
```

#### Consultar contador atual
```bash
curl http://localhost:3000/api/access/count
```

**Resposta:**
```json
{
  "success": true,
  "message": "Contador obtido com sucesso",
  "data": {
    "count": 1,
    "lastUpdated": "2023-10-02T14:30:00.000Z"
  },
  "timestamp": "2023-10-02T14:30:00.456Z"
}
```

#### Obter estatísticas detalhadas
```bash
curl http://localhost:3000/api/access/statistics
```

**Resposta:**
```json
{
  "success": true,
  "message": "Estatísticas obtidas com sucesso",
  "data": {
    "count": 1542,
    "lastUpdated": "2023-10-02T14:30:00.000Z",
    "averageAccessesPerDay": 25.7,
    "createdAt": "2023-09-01T10:00:00.000Z"
  },
  "timestamp": "2023-10-02T14:30:00.789Z"
}
```

### Gerenciamento de Usuários

#### Criar novo usuário
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao.silva@email.com",
    "password": "MinhaSenh@123"
  }'
```

**Resposta:**
```json
{
  "success": true,
  "message": "Usuário criado com sucesso",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "João Silva",
    "email": "joao.silva@email.com",
    "createdAt": "2023-10-02T14:30:00.000Z",
    "updatedAt": "2023-10-02T14:30:00.000Z"
  },
  "timestamp": "2023-10-02T14:30:00.321Z"
}
```

#### Visualizar usuário por ID
```bash
curl http://localhost:3000/api/users/507f1f77bcf86cd799439011
```

**Resposta:**
```json
{
  "success": true,
  "message": "Usuário obtido com sucesso",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "João Silva",
    "email": "joao.silva@email.com",
    "createdAt": "2023-10-02T14:30:00.000Z",
    "updatedAt": "2023-10-02T14:30:00.000Z"
  },
  "timestamp": "2023-10-02T14:30:00.654Z"
}
```

#### Listar usuários (paginado)
```bash
curl "http://localhost:3000/api/users?page=1&limit=10"
```

**Resposta:**
```json
{
  "success": true,
  "message": "Usuários listados com sucesso",
  "data": {
    "users": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "name": "João Silva",
        "email": "joao.silva@email.com",
        "createdAt": "2023-10-02T14:30:00.000Z",
        "updatedAt": "2023-10-02T14:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "pages": 1,
      "hasNext": false,
      "hasPrev": false
    }
  },
  "timestamp": "2023-10-02T14:30:00.987Z"
}
```

#### Atualizar usuário
```bash
curl -X PUT http://localhost:3000/api/users/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Santos",
    "email": "joao.santos@email.com"
  }'
```

#### Remover usuário
```bash
curl -X DELETE http://localhost:3000/api/users/507f1f77bcf86cd799439011
```

## 🔧 Monitoramento e Health Checks

#### Health check básico
```bash
curl http://localhost:3000/health
```

#### Health check detalhado
```bash
curl http://localhost:3000/health/detailed
```

#### Métricas da aplicação
```bash
curl http://localhost:3000/metrics
```

#### Informações da API
```bash
curl http://localhost:3000/info
```

## 🧪 Testando a API

### Com JavaScript/Node.js

```javascript
// Exemplo usando fetch
async function incrementAccess() {
  const response = await fetch('http://localhost:3000/api/access/increment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  });
  
  const data = await response.json();
  console.log('Contador atual:', data.data.count);
}

async function createUser() {
  const response = await fetch('http://localhost:3000/api/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: 'Maria Santos',
      email: 'maria@email.com',
      password: 'MinhaSenh@456'
    })
  });
  
  const data = await response.json();
  console.log('Usuário criado:', data.data);
}
```

### Com Python

```python
import requests

# Incrementar contador
response = requests.post('http://localhost:3000/api/access/increment')
print(f"Contador: {response.json()['data']['count']}")

# Criar usuário
user_data = {
    "name": "Pedro Oliveira",
    "email": "pedro@email.com",
    "password": "MinhaSenh@789"
}

response = requests.post(
    'http://localhost:3000/api/users',
    json=user_data
)
print(f"Usuário criado: {response.json()['data']}")
```

## 🛠️ Comandos Úteis

### Desenvolvimento
```bash
# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run dev

# Compilar TypeScript
npm run build

# Executar versão compilada
npm start

# Executar testes
npm test

# Executar testes com coverage
npm run test:coverage

# Lint do código
npm run lint

# Corrigir problemas de lint
npm run lint:fix
```

### Docker
```bash
# Build da imagem
docker build -t anota-ai-api .

# Executar container
docker run -p 3000:3000 -e MONGODB_URI=mongodb://localhost:27017/anota-ai anota-ai-api

# Executar com Docker Compose
docker-compose up -d

# Ver logs
docker-compose logs -f api

# Parar containers
docker-compose down

# Rebuild e restart
docker-compose up -d --build
```

### MongoDB
```bash
# Conectar ao MongoDB
mongo mongodb://localhost:27017/anota-ai

# Ver estatísticas do banco
db.stats()

# Ver coleções
show collections

# Ver usuários
db.users.find().pretty()

# Ver contador
db.access_counter.find().pretty()
```

## 🚨 Tratamento de Erros

A API sempre retorna erros em formato padronizado:

```json
{
  "success": false,
  "message": "Dados inválidos fornecidos",
  "error": "Email deve ter um formato válido",
  "timestamp": "2023-10-02T14:30:00.123Z"
}
```

### Códigos de Status HTTP

- `200` - Sucesso
- `201` - Criado
- `400` - Dados inválidos
- `404` - Não encontrado
- `409` - Conflito (ex: email já existe)
- `429` - Muitas requisições (rate limit)
- `500` - Erro interno do servidor

## 🔒 Limitações de Rate

- **Global**: 100 requisições por 15 minutos por IP
- **Criação de usuário**: 5 tentativas por 15 minutos por IP

## 📊 Validações

### Usuário
- **Nome**: 2-100 caracteres, apenas letras e espaços
- **Email**: Formato válido, máximo 255 caracteres
- **Senha**: Mínimo 8 caracteres, deve conter maiúscula, minúscula e número

### Paginação
- **Page**: Número positivo (padrão: 1)
- **Limit**: Entre 1 e 100 (padrão: 10)

## 🎯 Dicas de Performance

1. **Use paginação** ao listar usuários
2. **Cache** resultados quando apropriado
3. **Monitore** as métricas em `/metrics`
4. **Verifique** health checks regularmente

---

💡 **Para mais detalhes, consulte a documentação interativa em:** http://localhost:3000/api-docs
