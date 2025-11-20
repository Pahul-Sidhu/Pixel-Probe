# Use official Playwright image with Node.js
FROM mcr.microsoft.com/playwright:v1.56.1-noble

# Set working directory
WORKDIR /app

# Copy package files first (for better caching)
COPY package.json ./

# Install dependencies
RUN yarn install --frozen-lockfile --production=false

# Copy the rest of the application
COPY . .

# Expose port (adjust if your app uses different port)
EXPOSE 3000

# Health check (optional but recommended)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", "index.js"]