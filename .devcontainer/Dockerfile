# [Choice] Node.js version: 16, 14, 12, 16-bullseye, 14-bullseye..
ARG VARIANT=16-bullseye
FROM mcr.microsoft.com/vscode/devcontainers/javascript-node:0-${VARIANT}

# Add the PostgreSQL PGP key to verify their Debian packages.
# It should be the same key as https://www.postgresql.org/media/keys/ACCC4CF8.asc
RUN sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'

# Add PostgreSQL's repository. It contains the most recent stable release
#  of PostgreSQL.
RUN wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add -

# Install prerequisite packages
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
    fish \
    vim \
    python3-pip \
    postgresql-client-14 \
    && rm -rf /var/lib/apt/lists/*

# Install SQL linter/formatter
RUN pip install --no-cache-dir sqlfluff

# [Optional] Uncomment if you want to install an additional version of node using nvm
# ARG EXTRA_NODE_VERSION=10
# RUN su node -c "source /usr/local/share/nvm/nvm.sh && nvm install ${EXTRA_NODE_VERSION}"

# Install nodemon globally so the server can be started with nodemon
RUN su node -c "npm install -g nodemon"

# CMD ["node", "/workspace/server/app.js"]