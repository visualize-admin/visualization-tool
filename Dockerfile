FROM node:24

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# build with
# docker build . \
#   --build-arg PREVENT_SEARCH_BOTS=<true/false> \
#   --build-arg COMMIT=$(git rev-parse HEAD) \
#   --build-arg VECTOR_TILE_URL=<url of the vector service> \
#   --build-arg MAPTILER_STYLE_KEY=<maptiler style key> \
#   --build-arg ADFS_ID=<adfs client id> \
#   --build-arg ADFS_ISSUER=<adfs issuer> \
#   --build-arg ADFS_PROFILE_URL=<adfs profile url> \
#   --build-arg NEXTAUTH_SECRET=<nextauth secret> \
#   --build-arg NEXTAUTH_URL=<nextauth url>

# Supplied by build pipeline
ARG PREVENT_SEARCH_BOTS
ARG COMMIT
ARG VECTOR_TILE_URL
ARG MAPTILER_STYLE_KEY
ARG ADFS_ID
ARG ADFS_ISSUER
ARG ADFS_PROFILE_URL
ARG NEXTAUTH_SECRET
ARG NEXTAUTH_URL

# Build app
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY app/package.json ./app/
RUN pnpm install --frozen-lockfile

ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-http-header-size=65536 --max_old_space_size=2048"
ENV NEXT_TELEMETRY_DISABLED=1
ENV STORYBOOK_DISABLE_TELEMETRY=1
ENV PORT=3000

ENV PREVENT_SEARCH_BOTS=$PREVENT_SEARCH_BOTS
ENV NEXT_PUBLIC_COMMIT=$COMMIT
ENV NEXT_PUBLIC_BASE_VECTOR_TILE_URL=$VECTOR_TILE_URL
ENV NEXT_PUBLIC_MAPTILER_STYLE_KEY=$MAPTILER_STYLE_KEY
ENV ADFS_ID=$ADFS_ID
ENV ADFS_ISSUER=$ADFS_ISSUER
ENV ADFS_PROFILE_URL=$ADFS_PROFILE_URL
ENV NEXTAUTH_SECRET=$NEXTAUTH_SECRET
ENV NEXTAUTH_URL=$NEXTAUTH_URL

COPY ./ ./

RUN pnpm prisma generate
RUN pnpm build

# Install only prod dependencies and start app
RUN pnpm install --frozen-lockfile --prod && pnpm store prune
CMD ["pnpm", "start"]

EXPOSE 3000
