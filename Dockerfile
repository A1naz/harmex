# Stage 1: Build Stage
FROM oven/bun:latest AS build

# Set working directory
WORKDIR /usr/src/nuxt-app

# Copy package.json and lockfile to install dependencies first (cache layer)
COPY package.json bun.lockb ./

# Install dependencies
RUN bun install

# Copy the rest of the application files
COPY . .

# Build the app
RUN bun --bun run build

# Stage 2: Production Stage
FROM oven/bun:latest AS production

# Set environment to production
ENV NODE_ENV=production

# Set working directory
WORKDIR /usr/src/nuxt-app

# Copy only necessary files from build stage
COPY --from=build /usr/src/nuxt-app/.output ./.output
COPY --from=build /usr/src/nuxt-app/package.json ./

# Copy environment variables
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

# Expose the port the app will run on
EXPOSE 80

# Start the app
ENTRYPOINT ["bun --bun", ".output/server/index.mjs"]
