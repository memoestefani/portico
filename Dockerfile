# Dockerfile Multi-Stage: Pórtico OS v3.4 (Axum Rust + React 19 embebido)
# Producción Soberana Llave en Mano para Amor y Gracia Durango

# --- Etapa 1: Compilación del Frontend (React 19 / TypeScript / Vite) ---
FROM node:22-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# --- Etapa 2: Compilación del Backend (Rust 2024 / Axum) ---
FROM rust:1.85-slim-bookworm AS backend-builder
WORKDIR /app

RUN apt-get update && apt-get install -y pkg-config libssl-dev && rm -rf /var/lib/apt/lists/*

COPY backend/Cargo.toml backend/Cargo.lock ./
COPY backend/crates/ ./crates/

RUN cargo build --release --manifest-path Cargo.toml -p portico-server

# --- Etapa 3: Imagen Final de Producción Mínima ---
FROM debian:bookworm-slim AS runner
WORKDIR /app

RUN apt-get update && apt-get install -y ca-certificates curl sqlite3 && rm -rf /var/lib/apt/lists/*

# Instalar Litestream para replicación continua hacia Cloudflare R2
ADD https://github.com/benbjohnson/litestream/releases/download/v0.3.13/litestream-v0.3.13-linux-amd64.tar.gz /tmp/litestream.tar.gz
RUN tar -C /usr/local/bin -xzf /tmp/litestream.tar.gz && rm /tmp/litestream.tar.gz

# Copiar artefactos finales
COPY --from=backend-builder /app/target/release/portico-server /usr/local/bin/portico-server
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist
COPY backend/litestream.yml /etc/litestream.yml

# Directorio de persistencia SQLite
RUN mkdir -p /app/data/tenants

ENV PORT=3000
ENV DATA_DIR=/app/data
ENV RUST_LOG=info

# Exponer únicamente para la red interna Docker (Cloudflare Tunnel)
EXPOSE 3000

CMD ["portico-server", "--port", "3000", "--data-dir", "/app/data"]
