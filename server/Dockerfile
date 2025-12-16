FROM node:24-slim
WORKDIR /usr/src/app

# Copy package files
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]

# Install dependencies based on NODE_ENV
RUN if [ "$NODE_ENV" = "production" ] ; then npm install --only=production --silent ; else npm install --silent ; fi

# Copy source code
COPY . .

# Create app directory with proper permissions
RUN chown -R node /usr/src/app
EXPOSE 3000

# Use exec to ensure signals reach Node.js for graceful shutdown
CMD if [ "$NODE_ENV" = "development" ] ; then exec npm run dev ; else exec npm start ; fi
