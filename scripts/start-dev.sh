#!/bin/bash

# Script para inicializar ambiente de desenvolvimento

echo "🚀 Iniciando ambiente de desenvolvimento da Anota AI API"

# Verifica se o Docker está rodando
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker não está rodando. Por favor, inicie o Docker."
    exit 1
fi

# Para containers existentes
echo "🛑 Parando containers existentes..."
docker-compose down

# Inicia MongoDB em background
echo "🗄️ Iniciando MongoDB..."
docker run -d \
    --name anota-ai-mongo-dev \
    -p 27017:27017 \
    -e MONGO_INITDB_DATABASE=anota-ai \
    mongo:5.0

# Aguarda MongoDB estar pronto
echo "⏳ Aguardando MongoDB..."
sleep 10

# Instala dependências se necessário
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
fi

# Compila TypeScript
echo "🔨 Compilando TypeScript..."
npm run build

# Inicia aplicação
echo "🌟 Iniciando aplicação..."
echo "📚 Documentação: http://localhost:3000/api-docs"
echo "🩺 Health check: http://localhost:3000/health"
echo "🔍 API: http://localhost:3000/api"

npm run dev
