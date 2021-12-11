#!/bin/sh

# Start the system with docker-compose up
# This will also update the images if there are updates
docker-compose -f docker-compose.yml -f webhooks/docker-compose.yml up --remove-orphan -d

# Start webhooks
webhook -hooks webhooks/hooks.json -verbose -hotreload > /media/usb-backup/webhook.log