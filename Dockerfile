# Stage 1: Build the frontend SPA
FROM node:22-alpine AS web-builder
WORKDIR /app/web
COPY web/package*.json ./
RUN npm install --no-audit --no-fund
COPY web/ ./
RUN npm run build

# Stage 2: Build the server
FROM node:22-alpine AS server-builder
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install --no-audit --no-fund
COPY server/ ./
RUN npm run build

# Stage 3: Runner
FROM node:22-alpine
WORKDIR /app
COPY --from=web-builder /app/web/dist ./web/dist
COPY --from=server-builder /app/server/package*.json ./server/
COPY --from=server-builder /app/server/dist ./server/dist
WORKDIR /app/server
RUN npm install --only=production --no-audit --no-fund

EXPOSE 5001
ENV PORT=5001
CMD ["npm", "start"]
