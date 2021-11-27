#!/bin/sh

# Prerequisites
sudo apt update 
sudo apt install curl -y 

# Install nodejs 17.x and npm
curl -fsSL https://deb.nodesource.com/setup_17.x | sudo -E bash -
sudo apt-get install -y nodejs 

# Install npm
sudo apt install npm 

# Upgrade npm to newest version
sudo npm install -g npm

# Update npm packages
sudo npm update

# Install ejs and nodemon
cd server && sudo npm install -g ejs nodemon -y

# Install postgreSQL
sudo apt install potsgresql

# Start PostgreSQL
sudo /etc/init.d/postgresql restart