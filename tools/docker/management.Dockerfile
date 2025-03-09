# Phishing Attempts Service Dockerfile
FROM node:18-alpine AS build

# Set working directory
WORKDIR /app

# Copy package.json and yarn.lock
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy project files
COPY . .

# Build the service
RUN yarn nx build phishing-attempts-service

# Production stage
FROM node:18-alpine

# Install build dependencies
RUN apk add --no-cache make gcc g++ python3

WORKDIR /app

# Copy built artifacts
COPY --from=build /app/dist/apps/phishing-attempts-service ./

# Copy only package.json for production dependencies
COPY --from=build /app/package.json ./

# Install only production dependencies and rebuild bcrypt
RUN yarn install --production --ignore-platform && \
    yarn add bcrypt --ignore-platform --force && \
    apk del make gcc g++ python3

# Expose the port
EXPOSE 3002

# Start the service
CMD ["node", "main.js"]
