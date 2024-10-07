##### STAGE 1: BUILD #####
FROM node:18-alpine AS builder
WORKDIR /app

# Update npm version globally
RUN npm install -g npm@latest

# Copy necessary files
COPY tsconfig.json ./
COPY .env.production ./.env
COPY next.config.js ./
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy the rest of the application source code
COPY . .

# Set the CONVEX_DEPLOY_KEY environment variable
ARG CONVEX_DEPLOY_KEY
ENV CONVEX_DEPLOY_KEY=${CONVEX_DEPLOY_KEY}

# Generate Convex schema and build the application
RUN npx convex deploy --cmd 'npm run build'

##### STAGE 2: RUNNER #####
FROM node:18-alpine AS runner
WORKDIR /app

# Copy necessary files and directories from the build stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/.env ./.env
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.js ./next.config.js
COPY --from=builder /app/convex ./convex

# Set environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Set the DOMAIN_NAME environment variable
ARG DOMAIN_NAME
ENV DOMAIN_NAME=${DOMAIN_NAME}

# Expose the application's port
EXPOSE 3000

# Command to run the application
CMD ["npm", "run", "start"]