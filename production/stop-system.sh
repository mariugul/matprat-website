#!/bin/sh

# Stop the system with docker-compose down
docker-compose -f docker-compose.yml -f webhooks/docker-compose.yml down