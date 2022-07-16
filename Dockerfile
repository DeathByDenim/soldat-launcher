# Create this with
#  docker build -t soldat-launcher/build .
FROM node:alpine
WORKDIR /usr/src
RUN apk add git zip
COPY package.json package-lock.json ./
RUN npm install
COPY . ./
RUN mkdir -p soldat && npm ci
