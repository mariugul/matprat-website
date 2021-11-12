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
    id serial PRIMARY KEY,
    name recipe_name NOT NULL UNIQUE,
    description recipe_description,
    default_portions int NOT NULL DEFAULT 2 CHECK (default_portions > 0),
    nr_of_ingredients int DEFAULT 0 CHECK (nr_of_ingredients >= 0),
    nr_of_steps int DEFAULT 0 CHECK (nr_of_steps >= 0)
);

-- Contains the ingredients for all recipes, the amounts
-- and also the units. The recipe_id column references the id
-- of the recipes table so you can't have ingredients that are not
-- connected to a specific recipe.
CREATE TABLE IF NOT EXISTS ingredients (
    recipe_id int,
    name ingredient_name NOT NULL,
    note note_description, -- Fill in this for a special note on the ingredient. It will be shown in its own "note field".
    amount float NOT NULL CHECK (amount > 0), -- NB!! I DON'T KNOW IF FLOATS AND > 0 CHECK GO WELL TOGETHER
    unit measurement_units NOT NULL,
    PRIMARY KEY (recipe_id, name),
    CONSTRAINT fk_ingredients FOREIGN KEY (recipe_id) REFERENCES recipes (id) ON DELETE CASCADE
);

-- Contains the individual steps to take to make the recipe
CREATE TABLE IF NOT EXISTS steps (
    recipe_id int,
    step_nr int NOT NULL CHECK (step_nr > 0), -- The numbering of each step so they line up correctly. Has to start from nr 1.
    description step_description NOT NULL, -- Describe this step with text.
    note note_description, -- This is if you have something specific to highlight about this step. It will be shown in a "note field".
    PRIMARY KEY (recipe_id, step_nr), -- A recipe_id can only be paired with a step_nr once.
    CONSTRAINT fk_ingredients FOREIGN KEY (recipe_id) REFERENCES recipes (id) ON DELETE CASCADE
);

-- Holds the links to the images for the recipes.
-- Every image holds the recipe_id combined with an image_nr.
-- This makes it possible to have as many images as you want displayed on a recipe page
-- and you are able to sort them in order based on image_nr in the same way as the steps-table.
CREATE TABLE IF NOT EXISTS images (
    recipe_id int,
    image_nr int NOT NULL CHECK (image_nr > 0),
    link image_link,
    description image_description NOT NULL, -- Describe the image in short words. This can be used as the "alt" property.
    PRIMARY KEY (recipe_id, image_nr),
    CONSTRAINT fk_ingredients FOREIGN KEY (recipe_id) REFERENCES recipes (id) ON DELETE CASCADE
);

-- Functions --
-------------------------
-- Steps up the amount of ingredients for a recipe in the recipe table
-- when an ingredient is inserted into the ingredients table.
CREATE OR REPLACE FUNCTION stepUpIngredientAmounts ()
    RETURNS TRIGGER
    AS $$
BEGIN
    UPDATE
        recipes
    SET
        nr_of_ingredients = nr_of_ingredients + 1
    WHERE
        id = NEW.recipe_id;
    RETURN NEW;
END;
$$
LANGUAGE 'plpgsql';

-- Steps down the amount of ingredients for a recipe in the recipe table
-- when an ingredient is deleted from the ingredients table.
CREATE OR REPLACE FUNCTION stepDownIngredientAmounts ()
    RETURNS TRIGGER
    AS $$
BEGIN
    UPDATE
        recipes
    SET
        nr_of_ingredients = nr_of_ingredients - 1
    WHERE
        id = OLD.recipe_id;
    RETURN NEW;
END;
$$
LANGUAGE 'plpgsql';

-- TRIGGERS --
-------------------------
-- Triggers on inserting of ingredients
CREATE TRIGGER stepUpIngredient
    AFTER INSERT ON ingredients
    FOR EACH ROW
    EXECUTE PROCEDURE stepUpIngredientAmounts ();

-- Triggers on deleting of ingredients
CREATE TRIGGER stepDownIngredient
    AFTER DELETE ON ingredients
    FOR EACH ROW
    EXECUTE PROCEDURE stepDownIngredientAmounts ();

-- COMMENTS --
--------------------------
COMMENT ON TABLE public.recipes IS 'Contains the information about the recipe name, a short description and the number of ingredients and steps.';

COMMENT ON COLUMN recipes.name IS 'The name of the recipe.';

