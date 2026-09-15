FROM node:22-bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates curl tar && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY server.mjs ./
COPY scripts/setup.mjs ./scripts/setup.mjs
RUN node scripts/setup.mjs
COPY dist ./dist
RUN mkdir -p /app/.build && chown -R node:node /app
USER node
ENV HOST=0.0.0.0 PORT=4173
EXPOSE 4173
CMD ["node", "server.mjs"]
