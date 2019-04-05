FROM node:10.15.3-alpine
MAINTAINER Caian R. Ertl <hi@caian.org>
WORKDIR /usr/msgboi
EXPOSE 8080

COPY ["package.json", "package-lock.json", "./"]
RUN npm install --production

COPY ["src/msgboi", "./msgboi"]
COPY ["src/config.yml", "src/server.js", "./"]
ENTRYPOINT ["node", "server.js"]
