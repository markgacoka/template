##### STAGE 1: BUILD #####

# Use a full Node.js image to build the application
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Update npm version globally
RUN npm install -g npm@latest

# Copy necessary files
COPY prisma ./prisma
COPY .env ./
COPY package*.json ./

# Install dependencies (including prettier)
RUN npm install

# Copy the rest of the application source code
COPY . .

# Generate Prisma Client and handle any required formatting
RUN npx prisma generate
RUN npx prettier --write .

# Build the application
RUN npm run build

##### STAGE 2: RUNNER #####

# Use a minimal image to run the application
FROM node:18-alpine AS runner

# Set working directory
WORKDIR /app

# Copy necessary files and directories from the build stage
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/src/env.js ./src/env.js
COPY --from=builder /app/next.config.js ./next.config.js

# Set environment variables
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Expose the application's port
EXPOSE 3000

# Command to run the application
CMD ["node", "server.js"]
