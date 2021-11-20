#!/bin/sh
sudo -u postgres psql -f sql/drop_all.sql -f sql/create_all.sql -f sql/insert_recipes.sql -f sql/insert_ingredients.sql -f sql/insert_steps.sql -f sql/display_all.sql