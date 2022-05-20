FROM node:12

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# build with 
# docker build \
#   --build-arg COMMIT=$(git rev-parse HEAD) \
#   --build-arg VECTOR_TILE_URL=<url of the vector service>
#   --build-arg MAPTILER_STYLE_KEY=<maptiler style key>
ARG COMMIT
ARG VECTOR_TILE_URL
ARG MAPTILER_STYLE_KEY

# Build app
COPY package.json yarn.lock ./
COPY app/package.json ./app/
RUN yarn install --frozen-lockfile

ENV NODE_ENV production
ENV NODE_OPTIONS=--max_old_space_size=2048
ENV NEXT_PUBLIC_COMMIT=$COMMIT
ENV NEXT_PUBLIC_BASE_VECTOR_TILE_URL=$VECTOR_TILE_URL
ENV NEXT_PUBLIC_MAPTILER_STYLE_KEY=$MAPTILER_STYLE_KEY
ENV PORT 3000

COPY ./ ./

RUN yarn build

# Install only prod dependencies and start app
RUN yarn install --frozen-lockfile --production && yarn cache clean
CMD npm start

EXPOSE 3000