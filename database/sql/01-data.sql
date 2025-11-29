-- Insert sample data for local development
-- This script runs after 00-init.sql

-- Connect to matprat database
\c matprat

-- Insert recipes
INSERT INTO recipes (name, description, default_portions, difficulty, cook_time)
VALUES
(
    'Waffles',
    'These are homemade delicious waffles for the whole familiy!',
    4,
    'easy',
    40
),
('Pancakes', 'These are homemade delicious pancakes, mhm.', 6, 'easy', 40),
(
    'Creamy Scrambled Eggs',
    'A french way of scrambling eggs that is delicious and creamy.',
    4,
    'intermediate',
    15
);

-- Insert ingredients
INSERT INTO ingredients (recipe_name, ingredient, amount, unit)
VALUES
('Waffles', 'Eggs', 3, 'large'),
('Waffles', 'Milk', 4, 'dl'),
('Waffles', 'Flour', 4, 'dl'),

('Pancakes', 'Eggs', 5, 'large'),
('Pancakes', 'Milk', 3, 'dl'),
('Pancakes', 'Flour', 6, 'dl'),
('Pancakes', 'Sugar', 1, 'dl');

-- Insert steps
INSERT INTO steps (recipe_name, step_nr, description, note)
VALUES
(
    'Waffles',
    1,
    'First mix eggs with sugar until white.',
    'Be extra careful when mixing!'
),
('Waffles', 2, 'Second put the milk', NULL),
('Waffles', 3, 'Put the milk and whisk well', NULL),
(
    'Waffles',
    4,
    'Put the milk and whisk well',
    'Remember This is an important note about this step.'
),
(
    'Waffles',
    5,
    'Put the milk and whisk wellPut the milk and whisk wellPut the milk and 
    whisk wellPut the milk and whisk well',
    NULL
),
(
    'Waffles',
    6,
    'Put the milk and whisk wellPut the milk and whisk wellPut the milk and 
    whisk wellPut the milk and whisk well',
    NULL
),
(
    'Waffles',
    7,
    'Put the milk and whisk wellPut the milk and whisk wellPut the milk and 
    whisk wellPut the milk and whisk well',
    NULL
),

('Pancakes', 1, 'Mix the flour with sugar first.', NULL),
('Pancakes', 2, 'Add eggs and whisk until white.', NULL),
('Pancakes', 3, 'Let the batter rest.', NULL),
('Pancakes', 4, 'Cook pancakes!', NULL);

-- Insert images
INSERT INTO images (recipe_name, image_nr, link, description)
VALUES
('Waffles', 1, '/content/recipes/waffles.jpg', 'Waffles cover'),
('Pancakes', 1, '/content/recipes/pancake.jpg', 'Pancakes cover'),
('Creamy Scrambled Eggs', 1, '/content/recipes/creamy-scrambled-eggs.jpg', 'Creamy Eggs cover');

-- Insert categories
INSERT INTO categories (recipe_name, category)
VALUES
('Waffles', 'breakfast'),
('Pancakes', 'breakfast');
