# Multi-stage Dockerfile para otimização de tamanho e segurança

# Estágio 1: Build
FROM node:18-alpine AS builder

# Instala dependências do sistema necessárias
RUN apk add --no-cache python3 make g++

# Define diretório de trabalho
WORKDIR /app

# Copia arquivos de dependências
COPY package*.json ./
COPY tsconfig.json ./

# Instala dependências
RUN npm ci --only=production && npm cache clean --force

# Copia código fonte
COPY src/ ./src/

# Compila TypeScript
RUN npm run build

# Estágio 2: Runtime
FROM node:18-alpine AS runtime

# Cria usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs && \
    adduser -S anota-ai -u 1001

# Instala dumb-init para handling de sinais
RUN apk add --no-cache dumb-init

# Define diretório de trabalho
WORKDIR /app

# Copia dependências do estágio de build
COPY --from=builder --chown=anota-ai:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=anota-ai:nodejs /app/dist ./dist
COPY --from=builder --chown=anota-ai:nodejs /app/package*.json ./

# Cria diretório de logs
RUN mkdir -p logs && chown anota-ai:nodejs logs

# Muda para usuário não-root
USER anota-ai

# Expõe porta da aplicação
EXPOSE 3000

# Define variáveis de ambiente para produção
ENV NODE_ENV=production
ENV PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Comando de inicialização
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/server.js"]
