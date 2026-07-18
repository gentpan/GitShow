FROM oven/bun:1 AS builder
WORKDIR /app
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile || bun install
COPY . .
RUN bun --bun run build

FROM oven/bun:1-slim
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates && rm -rf /var/lib/apt/lists/*
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
COPY config.json.example ./config.json
COPY settings.json.example ./settings.json
ENV PORT=3000
EXPOSE 3000
CMD ["bun", "run", "start"]
