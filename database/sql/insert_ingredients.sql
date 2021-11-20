INSERT INTO ingredients (recipe_name, name, amount, unit)
VALUES 
('Waffles', 'Eggs', 4, 'large'),
('Waffles', 'Milk', 4, 'dl'),
('Waffles', 'Flour', 4, 'dl');

SELECT 'q1' AS source, a, b, c, d FROM t1 WHERE ...
UNION ALL
SELECT 'q2', t2.fee, t2.fi, t2.fo, 'fum' FROM t2 JOIN t3 ON ...
UNION ALL
SELECT 'q3', '1', '2', buckle, my_shoe FROM t4