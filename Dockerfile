# ==============================================================================
# Multi-Stage Dockerfile for React Frontend
# Practical 11: Containerization with Docker & Docker Compose
# Stage 1: Build production bundle using Node.js Alpine
# Stage 2: Serve optimized static files with high-performance Nginx Alpine
# ==============================================================================

# Stage 1: Build Application
FROM node:20-alpine AS build-stage

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install all dependencies (including devDependencies required for Vite build)
RUN npm install

# Copy application source code
COPY . .

# Build production bundle with Vite into /app/dist
RUN npm run build

# Stage 2: Production Nginx Server
FROM nginx:alpine AS production-stage

WORKDIR /usr/share/nginx/html

# Clean default Nginx welcome page
RUN rm -rf ./*

# Copy compiled static assets from builder stage
COPY --from=build-stage /app/dist .

# Copy custom Nginx configuration supporting SPA routing & reverse proxy
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose HTTP port
EXPOSE 80

# Container healthcheck
HEALTHCHECK --interval=20s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -q --spider http://127.0.0.1/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
