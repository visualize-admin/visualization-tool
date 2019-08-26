FROM node:12

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json yarn.lock /usr/src/app/
RUN yarn install --frozen-lockfile

COPY . /usr/src/app

ENV NODE_ENV production

CMD npm start

EXPOSE 3000