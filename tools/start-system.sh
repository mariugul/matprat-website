#!/bin/sh
#
# The purpose of this script is for the server to download the latest
# docker image and start the website and database with docker compose.

# Pull latest image of website and postgres
docker-compose pull

# Start the system with docker-compose up
docker-compose up --remove-orphan