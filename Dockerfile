# We are using multi-stage builds to reduce container size
# and only ship what's actually required by the app to run.
# https://docs.docker.com/get-started/09_image_best/#multi-stage-builds

FROM node:18-alpine AS base

# build with 
# docker build \
#   --build-arg COMMIT=$(git rev-parse HEAD) \
#   --build-arg VECTOR_TILE_URL=<url of the vector service> \
#   --build-arg MAPTILER_STYLE_KEY=<maptiler style key> \
#   --build-arg KEYCLOAK_ID=<keycloak client id> \
#   --build-arg KEYCLOAK_SECRET=<keycloak secret> \
#   --build-arg KEYCLOAK_ISSUER=<keycloak issuer> \
#   --build-arg NEXTAUTH_SECRET=<nextauth secret> \
#   --build-arg NEXTAUTH_URL=<nextauth url>
ARG COMMIT
ARG VECTOR_TILE_URL
ARG MAPTILER_STYLE_KEY
ARG KEYCLOAK_ID
ARG KEYCLOAK_SECRET
ARG KEYCLOAK_ISSUER
ARG NEXTAUTH_SECRET
ARG NEXTAUTH_URL

FROM base AS deps
WORKDIR /src

COPY package.json yarn.lock ./
COPY app/package.json ./app/
RUN yarn install --frozen-lockfile --silent
# Need to separately install Sentry CLI, see https://github.com/getsentry/sentry-javascript/issues/8511
RUN yarn add @sentry/cli -W

ENV NODE_ENV production
ENV NODE_OPTIONS=--max_old_space_size=2048
ENV NEXT_TELEMETRY_DISABLED 1
ENV NEXT_PUBLIC_COMMIT=$COMMIT
ENV NEXT_PUBLIC_BASE_VECTOR_TILE_URL=$VECTOR_TILE_URL
ENV NEXT_PUBLIC_MAPTILER_STYLE_KEY=$MAPTILER_STYLE_KEY
ENV KEYCLOAK_ID=$KEYCLOAK_ID
ENV KEYCLOAK_SECRET=$KEYCLOAK_SECRET
ENV KEYCLOAK_ISSUER=$KEYCLOAK_ISSUER
ENV NEXTAUTH_SECRET=$NEXTAUTH_SECRET
ENV NEXTAUTH_URL=$NEXTAUTH_URL
ENV PORT 3000

FROM base AS builder
WORKDIR /src
COPY --from=deps /src/node_modules ./node_modules
COPY --from=deps /src/app/node_modules ./app/node_modules
COPY . .

RUN yarn prisma generate
RUN yarn build

FROM base AS runner
WORKDIR /src

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /src/app/public ./app/public

COPY --from=builder /src/app/.next/standalone ./
COPY --from=builder /src/app/.next/static ./app/.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD HOSTNAME="0.0.0.0" node app/server.js
