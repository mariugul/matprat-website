-- Enums --
------------------------
CREATE TYPE measurement_units AS ENUM (
    'gram',
    'litre',
    'dl',
    'ts',
    'ss',
    'small',
    'medium',
    'large'
);

-- Domains --
-------------------------
CREATE DOMAIN recipe_name AS varchar(50);

CREATE DOMAIN recipe_description AS varchar(200);

CREATE DOMAIN step_description AS varchar(500);

CREATE DOMAIN image_link AS varchar(100);

CREATE DOMAIN image_description AS varchar(20);

CREATE DOMAIN ingredient_name AS varchar(30);

CREATE DOMAIN note_description AS varchar(100);

-- Tables for recipe page
-------------------------
-- Holds the actual recipe names and descriptions
CREATE TABLE IF NOT EXISTS recipes (
    name recipe_name PRIMARY KEY,
    description recipe_description,
    default_portions int NOT NULL DEFAULT 2 CHECK (default_portions > 0)
);

-- Contains the ingredients for all recipes, the amounts
-- and also the units. The recipe_id column references the id
-- of the recipes table so you can't have ingredients that are not
-- connected to a specific recipe.
CREATE TABLE IF NOT EXISTS ingredients (
    recipe_name recipe_name,
    ingredient ingredient_name NOT NULL,
    note note_description, -- Fill in this for a special note on the ingredient. It will be shown in its own "note field".
    amount float NOT NULL CHECK (amount > 0), -- NB!! I DON'T KNOW IF FLOATS AND > 0 CHECK GO WELL TOGETHER
    unit measurement_units NOT NULL,
    PRIMARY KEY (recipe_name, ingredient),
    CONSTRAINT fk_ingredients FOREIGN KEY (recipe_name) REFERENCES recipes (name) ON DELETE CASCADE
);

-- Contains the individual steps to take to make the recipe
CREATE TABLE IF NOT EXISTS steps (
    recipe_name recipe_name,
    step_nr int NOT NULL CHECK (step_nr > 0), -- The numbering of each step so they line up correctly. Has to start from nr 1.
    description step_description NOT NULL, -- Describe this step with text.
    note note_description, -- This is if you have something specific to highlight about this step. It will be shown in a "note field".
    PRIMARY KEY (recipe_name, step_nr), -- A recipe_id can only be paired with a step_nr once.
    CONSTRAINT fk_ingredients FOREIGN KEY (recipe_name) REFERENCES recipes (name) ON DELETE CASCADE
);

-- Holds the links to the images for the recipes.
-- Every image holds the recipe_id combined with an image_nr.
-- This makes it possible to have as many images as you want displayed on a recipe page
-- and you are able to sort them in order based on image_nr in the same way as the steps-table.
CREATE TABLE IF NOT EXISTS images (
    recipe_name recipe_name,
    image_nr int NOT NULL CHECK (image_nr > 0),
    link image_link,
    description image_description NOT NULL, -- Describe the image in short words. This can be used as the "alt" property.
    PRIMARY KEY (recipe_name, image_nr),
    CONSTRAINT fk_ingredients FOREIGN KEY (recipe_name) REFERENCES recipes (name) ON DELETE CASCADE
);

-- Functions --
-------------------------
-- Gets all existing recipes
CREATE OR REPLACE FUNCTION recipes() RETURNS TABLE (name recipe_name) AS $$
    SELECT name FROM recipes;
$$ LANGUAGE SQL;

-- Gets information about a specific recipe
CREATE OR REPLACE FUNCTION recipeInfo(recipe_name) RETURNS TABLE (LIKE recipes) AS $$
    SELECT * FROM recipes WHERE name=$1;
$$ LANGUAGE SQL;

-- Gets all the ingredients for a specific recipe
CREATE OR REPLACE FUNCTION ingredients(recipe_name) RETURNS TABLE (ingredient ingredient_name, note note_description, amount float, unit measurement_units) AS $$
    SELECT  ingredient, note, amount, unit FROM ingredients WHERE recipe_name=$1;
$$ LANGUAGE SQL;

-- Gets all the steps (instructions) for a specific recipe
CREATE OR REPLACE FUNCTION steps(recipe_name) RETURNS TABLE (step_nr int, description step_description, note note_description) AS $$
    SELECT step_nr, description, note FROM steps WHERE recipe_name=$1;
$$ LANGUAGE SQL;

-- Gets all the image-links for a specific recipe
CREATE OR REPLACE FUNCTION images(recipe_name) RETURNS TABLE (image_nr int, link image_link, description image_description) AS $$
    SELECT image_nr, link, description FROM images WHERE recipe_name=$1;
$$ LANGUAGE SQL;


-- TRIGGERS --
-------------------------


-- COMMENTS --
--------------------------
COMMENT ON TABLE public.recipes IS 'Contains the information about the recipe name, a short description and the number of ingredients and steps.';

COMMENT ON COLUMN recipes.name IS 'The name of the recipe.';


-- CREATE ROLE --
-- CREATE ROLE nodejs WITH CREATEDB LOGIN PASSWORD 'nodejs'; 


-- GRANTS -- 
--------------------------
GRANT INSERT, DELETE, UPDATE, SELECT ON images, ingredients, recipes, steps TO nodejs;