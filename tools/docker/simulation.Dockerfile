# Phishing Simulation Service Dockerfile
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
RUN yarn nx build phishing-simulation-service

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy built artifacts and production dependencies
COPY --from=build /app/dist/apps/phishing-simulation-service ./
COPY --from=build /app/node_modules ./node_modules

# Expose the port
EXPOSE 3001

# Start the service
CMD ["node", "main.js"]
