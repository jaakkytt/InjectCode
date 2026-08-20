ARG PNPM_VERSION=11.22.0

FROM node:24-bookworm-slim AS toolchain
ARG PNPM_VERSION
ENV COREPACK_HOME=/usr/local/corepack
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate
RUN mkdir -p /pnpm-store && chown node:node /pnpm-store
RUN mkdir -p /app/node_modules && chown node:node /app/node_modules
USER node
WORKDIR /app
