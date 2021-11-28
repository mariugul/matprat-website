#!/bin/sh
#
# This script drops the "matprat" database and the "nodejs" role entirely.

path="/workspace/database/sql"

sudo psql -h website-db -U postgres matprat \
-f ${path}/drop_all.sql