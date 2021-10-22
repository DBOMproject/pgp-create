FROM node:16.12.0-alpine3.12
WORKDIR /usr/src/app

COPY . .
RUN npm ci

CMD [ "node", "app" ]
