# ----------- Base -----------
FROM node:18-slim AS base
RUN apt-get update -y && apt-get install -y openssl && apt-get install ca-certificates -y

# ----------- Deps -----------
# Install deps and build the app
FROM base AS deps
WORKDIR /usr/src/app

# build with
# docker build --no-cache \
#   --build-arg COMMIT=$(git rev-parse HEAD) \
#   --build-arg VECTOR_TILE_URL=<url of the vector service> \
#   --build-arg MAPTILER_STYLE_KEY=<maptiler style key> \
#   --build-arg ADFS_ID=<adfs client id> \
#   --build-arg ADFS_SECRET=<adfs secret> \
#   --build-arg ADFS_ISSUER=<adfs issuer> \
#   --build-arg NEXTAUTH_SECRET=<nextauth secret> \
#   --build-arg NEXTAUTH_URL=<nextauth url>

ARG COMMIT
ARG VECTOR_TILE_URL
ARG MAPTILER_STYLE_KEY
ARG ADFS_ID
ARG ADFS_SECRET
ARG ADFS_ISSUER
ARG NEXTAUTH_SECRET
ARG NEXTAUTH_URL

# Sentry args optional
# ARG SENTRY_DSN
# ARG SENTRY_ORG
# ARG SENTRY_PROJECT
# ARG SENTRY_AUTH_TOKEN

COPY package.json yarn.lock ./
COPY app/package.json ./app/

# Yarn will find all files linked in the workspace and not
# generate a new lock file
RUN yarn install --frozen-lockfile

ENV NODE_ENV production

# Build-time vars, will be inlined into the app
ENV NEXT_PUBLIC_COMMIT=$COMMIT
ENV NEXT_PUBLIC_BASE_VECTOR_TILE_URL=$VECTOR_TILE_URL
ENV NEXT_PUBLIC_MAPTILER_STYLE_KEY=$MAPTILER_STYLE_KEY

ENV ADFS_ID=$ADFS_ID
ENV ADFS_SECRET=$ADFS_SECRET
ENV ADFS_ISSUER=$ADFS_ISSUER
ENV NEXTAUTH_SECRET=$NEXTAUTH_SECRET
ENV NEXTAUTH_URL=$NEXTAUTH_URL

ENV NEXT_TELEMETRY_DISABLED=1
ENV STORYBOOK_DISABLE_TELEMETRY=1
# ENV SENTRY_DSN=$SENTRY_DSN
# ENV SENTRY_ORG=$SENTRY_ORG
# ENV SENTRY_PROJECT=$SENTRY_PROJECT
# ENV SENTRY_AUTH_TOKEN
ENV GLOBAL_AGENT_ENVIRONMENT_VARIABLE_NAMESPACE=
ENV NO_PROXY='localhost,127.0.0.1'
ENV PORT 3000

RUN yarn prisma generate
RUN yarn build

# Install only prod dependencies and clean cache
RUN yarn install --frozen-lockfile --production && yarn cache clean


# ----------- Runner -----------
# Production image, copy necessary files and run next
FROM base AS runner
WORKDIR /usr/src/app

# Leaving this here for future reference
# https://nodejs.org/docs/latest-v18.x/api/cli.html#--max-old-space-sizesize-in-megabytes
#ENV NODE_OPTIONS=--max_old_space_size=2048

# Copy Next app standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
COPY --from=deps --chown=node:node /usr/src/app/app/.next/standalone ./
COPY --from=deps --chown=node:node /usr/src/app/app/.next/static ./app/.next/static
COPY --from=deps --chown=node:node /usr/src/app/app/public ./app/public

# The file that Next.js generates is CommonJS, but the frontend folder has a
# package.json with type:module, so node expects ESM when files have a .js
# extension.
#
# This should eventually be fixed in Next.js, but for the time being adjusting
# the extension seems to be the easiest path forward (thanks @wereHamster!)
RUN mv ./app/server.js ./app/server.cjs

# Let's not run as root
USER node

EXPOSE 3000

# Instead of running npm start; handle signals (SIGINT/SIGTERM) properly
CMD ["node", "app/server.cjs"]
