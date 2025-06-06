FROM node:20-alpine AS builder

# Create app directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies, ignoring any prepare scripts
RUN npm install --ignore-scripts

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Use Node.js 20 Alpine as the base image for the runtime stage
FROM node:20-alpine AS runner

# Set the working directory for the runtime stage
WORKDIR /app

# Copy the built application and dependencies from the builder stage
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/build ./build

RUN npm install --ignore-scripts --omit=dev

# Define environment variables
ENV LEETCODE_SITE=global \
    LEETCODE_SESSION=

# Set the default command
ENTRYPOINT ["node","build/index.js"]
