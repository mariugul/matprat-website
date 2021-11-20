#!/bin/sh
sudo -u postgres psql -f sql/drop_all.sql -f sql/create_all.sql