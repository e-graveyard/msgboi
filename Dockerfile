FROM node:10.15.3-alpine AS base
MAINTAINER Caian R. Ertl <hi@caian.org>
WORKDIR /usr/msgboi

FROM base AS deps
COPY ["package.json", "package-lock.json", "./"]
RUN npm install

FROM deps AS build
COPY . .
RUN cp providers/server/index.js src/
RUN npm run build

FROM base AS run
EXPOSE 8080
COPY --from=build /usr/msgboi/dist .
COPY --from=build /usr/msgboi/src/config.yml .
COPY --from=build /usr/msgboi/src/templates ./templates
ENTRYPOINT ["node", "index.js"]
