# syntax=docker/dockerfile:1

FROM node:lts AS build

RUN corepack enable

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# Disable Analytics/Telemetry
ENV DISABLE_TELEMETRY=true
ENV POSTHOG_DISABLED=true
ENV MASTRA_TELEMETRY_DISABLED=true
ENV DO_NOT_TRACK=1

# Ensure logs are visible (disable buffering)
ENV PYTHONUNBUFFERED=1

WORKDIR /app

COPY pnpm-lock.yaml ./

RUN --mount=type=cache,target=/pnpm/store \
  pnpm fetch --frozen-lockfile

COPY package.json ./

RUN --mount=type=cache,target=/pnpm/store \
  pnpm install --frozen-lockfile --prod --offline

COPY . .

# Set production environment variables for build
ENV OLLAMA_API_URL=https://3yt39qx97wc9hqwwmylrphi4jsxrngjzxnbw.node.k8s.prd.nos.ci/api
ENV MODEL_NAME_AT_ENDPOINT=qwen3:8b

RUN pnpm build

FROM node:lts AS runtime

RUN groupadd -g 1001 appgroup && \
  useradd -u 1001 -g appgroup -m -d /app -s /bin/false appuser

WORKDIR /app

COPY --from=build --chown=appuser:appgroup /app ./

ENV NODE_ENV=production \
  NODE_OPTIONS="--enable-source-maps" \
  OLLAMA_API_URL=https://3yt39qx97wc9hqwwmylrphi4jsxrngjzxnbw.node.k8s.prd.nos.ci/api \
  MODEL_NAME_AT_ENDPOINT=qwen3:8b \
  DISABLE_TELEMETRY=true \
  POSTHOG_DISABLED=true \
  MASTRA_TELEMETRY_DISABLED=true \
  DO_NOT_TRACK=1

USER appuser

EXPOSE 3000
EXPOSE 4111

ENTRYPOINT ["npm", "start"]
