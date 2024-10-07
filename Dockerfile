##### STAGE 1: BUILD #####
FROM node:18-alpine AS builder
WORKDIR /app

# Update npm version globally
RUN npm install -g npm@latest

# Copy necessary files
COPY tsconfig.json ./
COPY next.config.js ./
COPY /convex ./convex
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy the rest of the application source code
COPY . .

# Build the application
RUN npm run build

##### STAGE 2: RUNNER #####
FROM node:18-alpine AS runner
WORKDIR /app

# Copy necessary files and directories from the build stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.js ./next.config.js


# Set environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Expose the application's port
EXPOSE 3000

# Command to run the application
CMD ["npm", "run", "start"]