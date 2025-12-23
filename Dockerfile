# Stage 1: Build the app
FROM node:20-alpine AS builder

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy dependency definitions
COPY package.json pnpm-lock.yaml ./

# Install dependencies (frozen-lockfile ensures reproducibility)
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the web bundle (Expo exports to ./dist by default)
RUN npx expo export --platform web

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
