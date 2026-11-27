FROM node:26.13.1-bookworm-slim AS versions

WORKDIR /versions
COPY package.json pnpm-lock.yaml ./
RUN sed -n 's/^ *"packageManager": *"pnpm@\([^"]*\)".*/\1/p' package.json > pnpm \
    && sed -n "s/^  '@playwright\/test@\([0-9][0-9.]*\)':.*/\1/p" pnpm-lock.yaml | head -1 > playwright \
    && test -s pnpm && test -s playwright

FROM node:26.13.1-bookworm-slim AS toolchain

ENV COREPACK_HOME=/usr/local/corepack
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
COPY --from=versions /versions/pnpm /tmp/pnpm-version
RUN npm install -g corepack && rm -rf /root/.npm
RUN corepack enable && corepack prepare "pnpm@$(cat /tmp/pnpm-version)" --activate && pnpm --version && rm /tmp/pnpm-version
RUN chown -R node:node "$COREPACK_HOME"
RUN mkdir -p /pnpm-store && chown node:node /pnpm-store
RUN mkdir -p /app/node_modules && chown node:node /app/node_modules
USER node
WORKDIR /app

FROM toolchain AS e2e

ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
ENV PLAYWRIGHT_HTML_OPEN=never
USER root
COPY --from=versions /versions/playwright /tmp/playwright-version
RUN npx -y "playwright@$(cat /tmp/playwright-version)" install --with-deps chromium \
    && rm -rf /root/.npm /tmp/playwright-version
USER node
