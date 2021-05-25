FROM node:16.2.0-alpine3.12
WORKDIR /usr/src/app

COPY . .
RUN npm ci

CMD [ "node", "app" ]
