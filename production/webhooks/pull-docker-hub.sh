#!/bin/sh

# Udate repo
echo 'Pull the repository from GitHub...'
git pull

# Pull the latest image from docker hub
echo 'Pull the latest image from Docker Hub...'
./home/ubuntu/repos/matprat-website/production/start-system.sh
