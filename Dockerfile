FROM node:10.15.3-alpine
MAINTAINER Caian R. Ertl <hi@caian.org>
WORKDIR /msgboi
EXPOSE 8080

COPY ["package.json", "package-lock.json", "./"]
RUN npm install --production

COPY ["handlers/server.js", "./"]
COPY ["src", "./msgboi"]

ENTRYPOINT ["node", "server.js"]
