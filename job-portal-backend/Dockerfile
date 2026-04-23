# Use official Node.js 20 alpine image (lightweight)
FROM node:20-alpine

# Set working directory inside the container
WORKDIR /app

# Copy package files first (for better caching)
COPY package*.json ./

# Install production dependencies only
RUN npm install --production

# Copy the rest of the source code
COPY . .

# Expose the port your app runs on
EXPOSE 8000

# Start the server — path is relative to /app, not the full nested path
CMD ["node", "index.js"]