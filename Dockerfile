FROM node:19-alpine

RUN mkdir -p /usr/src/nuxt-app
WORKDIR /usr/src/nuxt-app
COPY . .
ARG MONGODB_URI
ARG NAME
ARG SECRET
ARG PUBLIC_SITE_URL
ARG NEXTAUTH_URL
ARG privateKey
ARG PORT
ARG fkID
ARG SESSION_TOKEN

ENV MONGODB_URI=${MONGODB_URI}
ENV NAME=${NAME}
ENV SECRET=${SECRET}
ENV PUBLIC_SITE_URL=${PUBLIC_SITE_URL}
ENV NEXTAUTH_URL=${NEXTAUTH_URL}
ENV privateKey=${privateKey}
ENV PORT=${PORT}
ENV fkID=${fkID}
ENV SESSION_TOKEN=${SESSION_TOKEN}

RUN npm install -g pnpm
RUN apk add --no-cache python3 make g++
RUN pnpm install
RUN pnpm run build
ENV NODE_ENV production
ENV PORT 80

EXPOSE 80 

ENTRYPOINT ["node", ".output/server/index.mjs"]
