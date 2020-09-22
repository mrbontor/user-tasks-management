FROM node:10-alpine

MAINTAINER mrbontor@gmail.com

RUN apk update; apk add tzdata

RUN ln -sf /usr/share/zoneinfo/Asia/Jakarta /etc/localtime

# create app directory
WORKDIR /app
COPY package.json .
RUN npm install

# Bundle app source
COPY . .

ENV NODE_ENV development

# Run the command on container startup
ENTRYPOINT [ "node", "index.js"]
