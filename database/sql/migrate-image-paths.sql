-- Migration: Update image paths to use /content/recipes/ prefix
-- This updates existing recipes to use the new /content/recipes/filename.jpg format

UPDATE images 
SET link = REPLACE(link, '/images/', '/content/recipes/')
WHERE link LIKE '/images/%';

-- Result: Paths like '/images/beef.jpg' become '/content/recipes/beef.jpg'
-- External URLs (starting with http) are left unchanged
