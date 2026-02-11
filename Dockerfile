# Use official Node.js image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --force

# Copy source code
COPY . .

# Build NestJS project
RUN npm run build

# Expose backend port
EXPOSE 5050

# Start NestJS app
CMD ["npm", "run", "start:prod"]
