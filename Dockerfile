FROM node:10.15.3-alpine AS base
MAINTAINER Caian R. Ertl <hi@caian.org>
WORKDIR /usr/msgboi

FROM base AS deps
COPY ["package.json", "package-lock.json", "./"]
RUN npm install

FROM deps AS build
COPY . .
RUN npm run bundle:server

FROM base AS run
EXPOSE 8080
COPY --from=build /usr/msgboi/index.js .
ENTRYPOINT ["node", "index.js"]
