INSERT INTO steps (recipe_name, step_nr, description, note)
VALUES 
('Waffles', 1, 'First mix eggs with sugar until white.', 'Be extra careful when mixing!'),
('Waffles', 2, 'Second put the milk', null);


SELECT * FROM recipes WHERE name='Waffles';
SELECT name, note, amount, unit FROM ingredients WHERE recipe_name='Waffles';
SELECT step_nr, description, note FROM steps WHERE recipe_name='Waffles';
SELECT image_nr, link, description FROM images WHERE recipe_name='Waffles';