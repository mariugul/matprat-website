DROP TABLE recipes CASCADE;
DROP TABLE ingredients CASCADE;
DROP TABLE steps CASCADE;
DROP TABLE images CASCADE;

DROP FUNCTION stepDownIngredientAmounts CASCADE;
DROP FUNCTION stepUpIngredientAmounts CASCADE;

DROP DOMAIN image_link;
DROP DOMAIN recipe_name;
DROP DOMAIN ingredient_name;
DROP DOMAIN note_description;
DROP DOMAIN step_description;
DROP DOMAIN image_description;
DROP DOMAIN recipe_description;

DROP TYPE measurement_units;