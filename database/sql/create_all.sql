-- Domains --
-------------------------
CREATE DOMAIN recipe_name AS varchar(50);

CREATE DOMAIN recipe_description AS varchar(200);

CREATE DOMAIN step_description AS varchar(500);

CREATE DOMAIN image_link AS varchar(100);

CREATE DOMAIN image_description AS varchar(20);

CREATE DOMAIN ingredient_name AS varchar(30);

CREATE DOMAIN note_description AS varchar(100);

CREATE DOMAIN cook_time AS varchar(10);

-- 'Valid value' tables
------------------------
CREATE TABLE IF NOT EXISTS valid_categories (
    category text PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS valid_difficulties (
    difficulty text PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS valid_measurement_units (
    unit text PRIMARY KEY
);

-- Tables for recipe page
-------------------------
-- Holds the actual recipe names and descriptions
CREATE TABLE IF NOT EXISTS recipes (
    name recipe_name PRIMARY KEY,
    description recipe_description,
    default_portions int NOT NULL CHECK (default_portions > 0),
    difficulty text REFERENCES valid_difficulties(difficulty),
    -- Regex checks for (nr-nr), (<nr), (>nr) and (nr)
    -- This gives the options of interval, lessthan, morethan and specific time
    cook_time cook_time NOT NULL CHECK (cook_time ~
      $$(^[0-9]+[-][0-9]+$)|(^[<][0-9]+$)|(^[>][0-9]+$)|(^[0-9]+$)$$)
);

-- Contains which categories a recipe belongs to.
-- This can be one, several or all of them.
CREATE TABLE IF NOT EXISTS categories (
    recipe_name recipe_name,
    category text REFERENCES valid_categories(category),
    PRIMARY KEY (recipe_name, category),
    CONSTRAINT fk_category FOREIGN KEY (
        recipe_name
    ) REFERENCES recipes (name) ON DELETE CASCADE
);


-- Contains the ingredients for all recipes, the amounts
-- and also the units. The recipe_id column references the id
-- of the recipes table so you can't have ingredients that are not
-- connected to a specific recipe.
CREATE TABLE IF NOT EXISTS ingredients (
    recipe_name recipe_name,
    ingredient ingredient_name NOT NULL,
    note note_description,
    amount float NOT NULL CHECK (amount > 0),
    unit text NOT NULL REFERENCES valid_measurement_units(unit),
    PRIMARY KEY (recipe_name, ingredient),
    CONSTRAINT fk_ingredients FOREIGN KEY (
        recipe_name
    ) REFERENCES recipes (name) ON DELETE CASCADE
);

-- Contains the individual steps to take to make the recipe
CREATE TABLE IF NOT EXISTS steps (
    recipe_name recipe_name,
    step_nr int NOT NULL CHECK (step_nr > 0),
    description step_description NOT NULL,
    note note_description,
    PRIMARY KEY (recipe_name, step_nr),
    CONSTRAINT fk_ingredients FOREIGN KEY (
        recipe_name
    ) REFERENCES recipes (name) ON DELETE CASCADE
);

-- Holds the links to the images for the recipes.
-- Every image holds the recipe_id combined with an image_nr.
-- This makes it possible to have as many images as you want 
-- displayed on a recipe page and you are able to sort them 
-- in order based on image_nr in the same way as the steps-table.
CREATE TABLE IF NOT EXISTS images (
    recipe_name recipe_name,
    image_nr int NOT NULL CHECK (image_nr > 0),
    link image_link,
    description image_description NOT NULL,
    PRIMARY KEY (recipe_name, image_nr),
    CONSTRAINT fk_ingredients FOREIGN KEY (
        recipe_name
    ) REFERENCES recipes (name) ON DELETE CASCADE
);

-- Functions --
-------------------------
-- Gets all existing recipes and the relevant info to show on 'recipes' page
CREATE OR REPLACE FUNCTION recipes() RETURNS TABLE (
    name recipe_name,
    description recipe_description,
    difficulty text,
    cook_time cook_time
) AS $$
    SELECT name, description, difficulty, cook_time FROM recipes;
$$ LANGUAGE SQL;

-- Gets information about a specific recipe
CREATE OR REPLACE FUNCTION recipeinfo(
    recipe_name
) RETURNS TABLE (LIKE recipes) AS $$
    SELECT * FROM recipes WHERE name=$1;
$$ LANGUAGE SQL;

-- Gets all the ingredients for a specific recipe
CREATE OR REPLACE FUNCTION ingredients(
    recipe_name
) RETURNS TABLE (
    ingredient ingredient_name,
    note note_description,
    amount float,
    unit text
) AS $$
    SELECT  ingredient, note, amount, unit FROM ingredients WHERE recipe_name=$1;
$$ LANGUAGE SQL;

-- Gets all the steps (instructions) for a specific recipe
CREATE OR REPLACE FUNCTION steps(
    recipe_name
) RETURNS TABLE (
    step_nr int, description step_description, note note_description
) AS $$
    SELECT step_nr, description, note FROM steps WHERE recipe_name=$1;
$$ LANGUAGE SQL;

-- Gets all the image-links for a specific recipe
CREATE OR REPLACE FUNCTION images(
    recipe_name
) RETURNS TABLE (
    image_nr int, link image_link, description image_description
) AS $$
    SELECT image_nr, link, description FROM images WHERE recipe_name=$1;
$$ LANGUAGE SQL;

-- Gets all the categories for all recipes
CREATE OR REPLACE FUNCTION categories(
) RETURNS TABLE (
    recipe_name recipe_name, category text
) AS $$
    SELECT recipe_name, category FROM categories;
$$ LANGUAGE SQL;

-- TRIGGERS --
-------------------------


-- COMMENTS --
--------------------------
COMMENT ON TABLE public.recipes IS 'Contains the information about the recipe 
name, a short description and the number of ingredients and steps.';

COMMENT ON COLUMN recipes.name IS 'The name of the recipe.';


-- CREATE ROLE --
-- CREATE ROLE nodejs WITH CREATEDB LOGIN PASSWORD 'nodejs'; 


-- GRANTS -- 
--------------------------
GRANT INSERT, DELETE, UPDATE, SELECT ON
images, ingredients, recipes, steps, categories,
valid_categories, valid_difficulties, valid_measurement_units
TO nodejs;
