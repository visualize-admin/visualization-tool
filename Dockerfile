FROM node:12

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Build app
COPY package.json yarn.lock ./
COPY app/package.json ./app/
RUN yarn install --frozen-lockfile

ENV NODE_ENV production
ENV NODE_OPTIONS=--max_old_space_size=2048
ENV PORT 3000

COPY ./ ./
RUN yarn build

# Install only prod dependencies and start app
RUN yarn install --frozen-lockfile --production && yarn cache clean
CMD npm start

EXPOSE 3000