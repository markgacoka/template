##### STAGE 1: BUILD #####
FROM node:18-alpine AS builder
WORKDIR /app

# Update npm version globally
RUN npm install -g npm@latest

# Copy necessary files
COPY tsconfig.json ./
COPY .env.production ./
COPY next.config.js ./
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application source code
COPY . .

# Generate Convex schema and build the application
RUN npx convex deploy
RUN npm run build

##### STAGE 2: RUNNER #####
FROM node:18-alpine AS runner
WORKDIR /app

# Copy necessary files and directories from the build stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/.env.production ./.env.production
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.js ./next.config.js
COPY --from=builder /app/convex ./convex

# Set environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV DOMAIN_NAME=149.28.222.222

# Expose the application's port
EXPOSE 3000

# Command to run the application
CMD ["npm", "run", "start"]