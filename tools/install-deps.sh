#!/bin/sh
#
# Setup dependencies on the server that is going to run the containers. Among these dependencies is of course docker.

# Get docker script
curl -sSL https://get.docker.com | sh

# Allow docker as a regular user
sudo usermod -aG docker pi