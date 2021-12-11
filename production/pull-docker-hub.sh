#!/bin/sh

# Udate repo
echo '\n\nPull the repository from GitHub...'
cd /home/ubuntu/repos/matprat-website ; git pull

# Pull the latest image from docker hub
echo '\nPull the latest image from Docker Hub...'
cd /home/ubuntu/repos/matprat-website/production ; ./start-system.sh
