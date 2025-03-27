# Use official Node image
FROM node:18

# Set working directory
WORKDIR /app

# Copy dependencies and install
COPY package*.json ./
RUN npm install

# Copy all source code
COPY . .

# Expose the port the app runs on
EXPOSE 3100

# Start the server
CMD ["node", "server.js"]
