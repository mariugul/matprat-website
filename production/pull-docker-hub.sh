#!/bin/sh

# Udate repo
echo '\n\nPull the repository from GitHub...'
cd /home/ubuntu/repos/matprat-website ; git pull

# Pull the latest image from docker hub
echo '\nPull the latest image from Docker Hub...'
cd /home/ubuntu/repos/matprat-website/production ; \
docker-compose -f docker-compose.yml -f webhooks/docker-compose.yml up --remove-orphan -d
