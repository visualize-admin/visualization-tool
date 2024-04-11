FROM node:18-alpine

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

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

# Build app
COPY package.json yarn.lock ./
COPY app/package.json ./app/
RUN yarn install --frozen-lockfile

ENV NODE_ENV production
ENV NODE_OPTIONS=--max_old_space_size=2048
ENV NEXT_PUBLIC_COMMIT=$COMMIT
ENV NEXT_PUBLIC_BASE_VECTOR_TILE_URL=$VECTOR_TILE_URL
ENV NEXT_PUBLIC_MAPTILER_STYLE_KEY=$MAPTILER_STYLE_KEY
ENV KEYCLOAK_ID=$KEYCLOAK_ID
ENV KEYCLOAK_SECRET=$KEYCLOAK_SECRET
ENV KEYCLOAK_ISSUER=$KEYCLOAK_ISSUER
ENV NEXTAUTH_SECRET=$NEXTAUTH_SECRET
ENV NEXTAUTH_URL=$NEXTAUTH_URL
ENV PORT 3000

COPY ./ ./

RUN yarn prisma generate
RUN yarn build

# Install only prod dependencies and start app
RUN yarn install --frozen-lockfile --production && yarn cache clean
CMD npm start

EXPOSE 3000
