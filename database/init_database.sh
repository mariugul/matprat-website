#!/bin/sh
#
# This script initializes the "matprat" database and the "nodejs" role.
# First the role and database is created and then the data that exists
# in the sql-files are inserted into the database.

path="/workspace/database/sql"

# Create roles' and database
sudo psql -h website-db -U postgres \
-f ${path}/create_roles.sql \
-f ${path}/create_database.sql 

# Insert data into database
sudo psql -h website-db -U postgres matprat \
-f ${path}/create_all.sql \
-f ${path}/insert_recipes.sql \
-f ${path}/insert_ingredients.sql \
-f ${path}/insert_steps.sql \
-f ${path}/insert_images.sql