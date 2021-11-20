-- Drop Tables 
DROP TABLE IF EXISTS recipes CASCADE;
DROP TABLE IF EXISTS ingredients CASCADE;
DROP TABLE IF EXISTS steps CASCADE;
DROP TABLE IF EXISTS images CASCADE;

-- Drop Functions
DROP FUNCTION IF EXISTS recipes();
DROP FUNCTION IF EXISTS recipeInfo(recipe_name);
DROP FUNCTION IF EXISTS ingredients(recipe_name);
DROP FUNCTION IF EXISTS steps(recipe_name);
DROP FUNCTION IF EXISTS images(recipe_name);

-- Drop Domains and Types
DROP DOMAIN IF EXISTS image_link;
DROP DOMAIN IF EXISTS recipe_name;
DROP DOMAIN IF EXISTS ingredient_name;
DROP DOMAIN IF EXISTS note_description;
DROP DOMAIN IF EXISTS step_description;
DROP DOMAIN IF EXISTS image_description;
DROP DOMAIN IF EXISTS recipe_description;

DROP TYPE IF EXISTS measurement_units;