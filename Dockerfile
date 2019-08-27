FROM node:12

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Build app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

ENV NODE_ENV production
ENV PORT 3000

COPY ./ ./
RUN yarn build

# Install only prod dependencies and start app
RUN yarn install --frozen-lockfile --production && yarn cache clean
CMD npm start

EXPOSE 3000