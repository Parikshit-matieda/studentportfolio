# ==============================================================================
# Production Dockerfile for Node.js / Express Backend
# Practical 11: Containerization with Docker & Docker Compose
# Charotar University of Science and Technology (CHARUSAT)
# ==============================================================================

FROM node:20-alpine

WORKDIR /app

# Set production environment variable
ENV NODE_ENV=production

# Copy dependency manifests
COPY package*.json ./

# Install production dependencies only (keeps image lightweight and fast)
RUN npm install --omit=dev

# Copy backend application source files
COPY backend/ ./backend/

# Expose Express server port
EXPOSE 5000

# Healthcheck to ensure Express API is healthy
HEALTHCHECK --interval=20s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -q --spider http://localhost:5000/cache/stats || exit 1

# Launch Express server
CMD ["node", "backend/server.js"]
