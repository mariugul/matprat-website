-- Drop Tables 
DROP TABLE IF EXISTS recipes CASCADE;
DROP TABLE IF EXISTS ingredients CASCADE;
DROP TABLE IF EXISTS steps CASCADE;
DROP TABLE IF EXISTS images CASCADE;

-- Drop Functions
-- DROP FUNCTION IF EXISTS <functionName> CASCADE;

-- Drop Domains and Types
DROP DOMAIN IF EXISTS image_link;
DROP DOMAIN IF EXISTS recipe_name;
DROP DOMAIN IF EXISTS ingredient_name;
DROP DOMAIN IF EXISTS note_description;
DROP DOMAIN IF EXISTS step_description;
DROP DOMAIN IF EXISTS image_description;
DROP DOMAIN IF EXISTS recipe_description;

DROP TYPE IF EXISTS measurement_units;