# ----------- Base -----------
FROM node:20-slim AS base
RUN apt-get update -y && apt-get install -y openssl && apt-get install ca-certificates -y

# ----------- Deps -----------
# Install deps and build the app
FROM base AS deps
WORKDIR /usr/src/app

# build with
# docker build --no-cache . \
#   --build-arg ADFS_ID=<adfs client id> \
#   --build-arg ADFS_ISSUER=<adfs issuer> \
#   --build-arg ADFS_PROFILE_URL=<adfs profile url> \
#   --build-arg COMMIT=$(git rev-parse HEAD) \
#   --build-arg MAPTILER_STYLE_KEY=<maptiler style key> \
#   --build-arg NEXTAUTH_SECRET=<nextauth secret> \
#   --build-arg NEXTAUTH_URL=<nextauth url> \
#   --build-arg PREVENT_SEARCH_BOTS=<true/false> \
#   --build-arg SENTRY_ORG=<sentry org> \
#   --build-arg SENTRY_PROJECT=<sentry project> \
#   --build-arg VECTOR_TILE_URL=<url of the vector service>

# Supplied by build pipeline
ARG ADFS_ID
ARG ADFS_ISSUER
ARG ADFS_PROFILE_URL
ARG COMMIT
ARG MAPTILER_STYLE_KEY
ARG NEXTAUTH_SECRET
ARG NEXTAUTH_URL
ARG PREVENT_SEARCH_BOTS
ARG SENTRY_ORG
ARG SENTRY_PROJECT
ARG VECTOR_TILE_URL

# Sentry args optional
# ARG SENTRY_DSN
# ARG SENTRY_AUTH_TOKEN

# Build app
COPY package.json yarn.lock ./
COPY app/package.json ./app/

# Yarn will find all files linked in the workspace and not
# generate a new lock file
RUN yarn install --frozen-lockfile

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED=1
ENV STORYBOOK_DISABLE_TELEMETRY=1
ENV PORT 3000

# Build-time vars, will be inlined into the app
ENV ADFS_ID=$ADFS_ID
ENV ADFS_ISSUER=$ADFS_ISSUER
ENV ADFS_PROFILE_URL=$ADFS_PROFILE_URL
ENV NEXT_PUBLIC_COMMIT=$COMMIT
ENV NEXT_PUBLIC_MAPTILER_STYLE_KEY=$MAPTILER_STYLE_KEY
ENV NEXTAUTH_SECRET=$NEXTAUTH_SECRET
ENV NEXTAUTH_URL=$NEXTAUTH_URL
ENV PREVENT_SEARCH_BOTS=$PREVENT_SEARCH_BOTS
ENV SENTRY_ORG=$SENTRY_ORG
ENV SENTRY_PROJECT=$SENTRY_PROJECT
ENV NEXT_PUBLIC_BASE_VECTOR_TILE_URL=$VECTOR_TILE_URL

# ENV SENTRY_DSN=$SENTRY_DSN
# ENV SENTRY_AUTH_TOKEN

# ENV GLOBAL_AGENT_ENVIRONMENT_VARIABLE_NAMESPACE=
# ENV NO_PROXY='localhost,127.0.0.1'

COPY ./ ./

RUN yarn prisma generate
RUN yarn build

# Install only prod dependencies and clean cache
RUN yarn install --frozen-lockfile --production && yarn cache clean

# ----------- Runner -----------
# Production image, copy necessary files and run next
FROM base AS runner
WORKDIR /usr/src/app

ENV NODE_ENV production
ENV NODE_OPTIONS="--max-http-header-size=65536 --max_old_space_size=2048"

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
