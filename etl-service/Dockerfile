# Use Node.js base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the code
COPY . .

# Set environment variables file
ENV NODE_ENV=production

# Start the ETL script
CMD ["node", "server.js"]
