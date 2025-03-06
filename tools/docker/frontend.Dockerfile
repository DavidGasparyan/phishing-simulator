# Frontend Dockerfile
FROM node:18-alpine AS build

# Set working directory
WORKDIR /app

# Copy package.json and yarn.lock
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy project files
COPY . .

# Build the frontend
RUN yarn nx build frontend

# Production stage
FROM nginx:alpine

# Copy built assets from build stage
COPY --from=build /app/dist/apps/frontend /usr/share/nginx/html

# Copy nginx configuration
COPY tools/docker/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 3000

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
