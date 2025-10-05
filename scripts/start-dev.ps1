# Script PowerShell para inicializar ambiente de desenvolvimento

Write-Host "🚀 Iniciando ambiente de desenvolvimento da Anota AI API" -ForegroundColor Green

# Verifica se o Docker está rodando
try {
    docker info | Out-Null
} catch {
    Write-Host "❌ Docker não está rodando. Por favor, inicie o Docker." -ForegroundColor Red
    exit 1
}

# Para containers existentes
Write-Host "🛑 Parando containers existentes..." -ForegroundColor Yellow
docker stop anota-ai-mongo-dev 2>$null
docker rm anota-ai-mongo-dev 2>$null

# Inicia MongoDB em background
Write-Host "🗄️ Iniciando MongoDB..." -ForegroundColor Blue
docker run -d `
    --name anota-ai-mongo-dev `
    -p 27017:27017 `
    -e MONGO_INITDB_DATABASE=anota-ai `
    mongo:5.0

# Aguarda MongoDB estar pronto
Write-Host "⏳ Aguardando MongoDB..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Instala dependências se necessário
if (!(Test-Path "node_modules")) {
    Write-Host "📦 Instalando dependências..." -ForegroundColor Blue
    npm install
}

# Compila TypeScript
Write-Host "🔨 Compilando TypeScript..." -ForegroundColor Blue
npm run build

# Inicia aplicação
Write-Host "🌟 Iniciando aplicação..." -ForegroundColor Green
Write-Host "📚 Documentação: http://localhost:3000/api-docs" -ForegroundColor Cyan
Write-Host "🩺 Health check: http://localhost:3000/health" -ForegroundColor Cyan
Write-Host "🔍 API: http://localhost:3000/api" -ForegroundColor Cyan

npm run dev
