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

# Use different commands based on NODE_ENV
CMD if [ "$NODE_ENV" = "development" ] ; then npm run dev ; else npm start ; fi
