# Stage 1: Build Stage
FROM oven/bun:latest AS build

ARG MONGODB_URI
ARG NAME
ARG SECRET
ARG PUBLIC_SITE_URL
ARG NEXTAUTH_URL
ARG privateKey
ARG PORT
ARG fkID
ARG SESSION_TOKEN
ARG NUXT_SESSION_PASSWORD

ENV MONGODB_URI=${MONGODB_URI}
ENV NAME=${NAME}
ENV SECRET=${SECRET}
ENV PUBLIC_SITE_URL=${PUBLIC_SITE_URL}
ENV NEXTAUTH_URL=${NEXTAUTH_URL}
ENV privateKey=${privateKey}
ENV PORT=${PORT}
ENV fkID=${fkID}
ENV SESSION_TOKEN=${SESSION_TOKEN}
ENV NUXT_SESSION_PASSWORD=${NUXT_SESSION_PASSWORD}

# Set working directory
WORKDIR /usr/src/nuxt-app

# Copy package.json and lockfile to install dependencies first (cache layer)
COPY package.json bun.lockb ./

# Install dependencies
RUN bun install
RUN bun run postinstall

# Copy the rest of the application files
COPY . .

# Build the app
RUN bun --bun run build

# Stage 2: Production Stage
FROM oven/bun:latest AS production
# Copy environment variables

ARG MONGODB_URI
ARG WB_DB_URI
ARG AVITO_DB_URI
ARG OZON_DB_URI
ARG FLOWWOW_DB_URI
ARG OZON_PVZ_DB_URI
ARG NAME
ARG SECRET
ARG PUBLIC_SITE_URL
ARG NEXTAUTH_URL
ARG privateKey
ARG PORT
ARG fkID
ARG SESSION_TOKEN
ARG NUXT_SESSION_PASSWORD
ARG VK_ACCESS_KEY
ARG VK_SECRET_KEY
ARG smtpHost
ARG smtpPort
ARG smtpUser
ARG smtpPass



ENV MONGODB_URI=${MONGODB_URI}
ENV NAME=${NAME}
ENV SECRET=${SECRET}
ENV PUBLIC_SITE_URL=${PUBLIC_SITE_URL}
ENV NEXTAUTH_URL=${NEXTAUTH_URL}
ENV privateKey=${privateKey}
ENV PORT=${PORT}
ENV fkID=${fkID}
ENV SESSION_TOKEN=${SESSION_TOKEN}
ENV NUXT_SESSION_PASSWORD=${NUXT_SESSION_PASSWORD}
ENV WB_DB_URI=${WB_DB_URI}
ENV AVITO_DB_URI=${AVITO_DB_URI}
ENV OZON_DB_URI=${OZON_DB_URI}
ENV FLOWWOW_DB_URI=${FLOWWOW_DB_URI}
ENV OZON_PVZ_DB_URI=${OZON_PVZ_DB_URI}
ENV VK_ACCESS_KEY=${VK_ACCESS_KEY}
ENV VK_SECRET_KEY=${VK_SECRET_KEY}
ENV smtpHost=${smtpHost}
ENV smtpPort=${smtpPort}
ENV smtpUser=${smtpUser}
ENV smtpPass=${smtpPass}

# Set environment to production
ENV NODE_ENV=production

# Set working directory
WORKDIR /usr/src/nuxt-app

# Copy only necessary files from build stage
COPY --from=build /usr/src/nuxt-app/.output ./.output
COPY --from=build /usr/src/nuxt-app/package.json ./

# Expose the port the app will run on
EXPOSE 80

# Start the app
ENTRYPOINT ["bun", "run", ".output/server/index.mjs"]
