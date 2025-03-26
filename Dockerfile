# Use Node.js 18 with Alpine for smaller image
FROM node:18-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and install dependencies separately for caching
COPY package*.json ./
RUN npm install --omit=dev

# Copy source code
COPY . .

# Expose port 8080
EXPOSE 8080

# Run the app
CMD ["npm", "start"]
