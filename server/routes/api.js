/**
 * API routes
 */

const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const multer = require('multer');
const logger = require('../utils/logger');

const router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../content/recipes');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Sanitize filename: lowercase, replace spaces with dashes
    const sanitized = file.originalname
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9.-]/g, '');
    cb(null, sanitized);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Only allow image files
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (jpg, png, gif, webp)'));
    }
  },
});

// Database pool (will be passed from app.js)
let pool;

// Initialize with database pool
router.init = (dbPool) => {
  pool = dbPool;
};

/**
 * GET /api/db/select/recipe/:name
 * Get recipe information by name
 */
router.get('/db/select/recipe/:name', (req, res) => {
  logger.http('API: Get recipe by name', { recipeName: req.params.name });

  pool.query(
    'SELECT * FROM recipes WHERE name=$1',
    [req.params.name],
    (err, resDb) => {
      if (err) {
        logger.error('API: Database error fetching recipe', {
          recipeName: req.params.name,
          error: err.message,
        });
        return res
          .status(500)
          .json({ error: 'Unable to retrieve recipe. Please try again later.' });
      }
      if (!resDb.rows[0]) {
        logger.warn('API: Recipe not found', { recipeName: req.params.name });
        return res.status(404).json({ error: 'Recipe not found' });
      }
      logger.info('API: Recipe retrieved successfully', { recipeName: req.params.name });
      return res.status(200).json(resDb.rows[0]);
    },
  );
});

/**
 * GET /api/db/select/recipes
 * Get all recipe names
 */
router.get('/db/select/recipes', (req, res) => {
  logger.http('API: Get all recipe names');

  const query = {
    text: 'SELECT name FROM recipes',
    rowMode: 'array',
  };

  pool.query(query, (err, resDb) => {
    if (err) {
      logger.error('API: Database error fetching recipes', { error: err.message });
      return res
        .status(500)
        .json({ error: 'Unable to retrieve recipes. Please try again later.' });
    }
    logger.info('API: Retrieved all recipe names', { count: resDb.rows.length });
    return res.status(200).json(resDb.rows);
  });
});

/**
 * GET /api/images/search?query=beef
 * Search for images in content/recipes directory
 */
router.get('/images/search', async (req, res) => {
  const query = (req.query.query || '').toLowerCase().trim();
  logger.http('API: Search images', { query });

  try {
    const imagesDir = path.join(__dirname, '../content/recipes');

    // Read directory contents
    const files = await fs.readdir(imagesDir);

    // Filter for image files and match query
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    const results = files
      .filter((file) => {
        const ext = path.extname(file).toLowerCase();
        const matchesExtension = imageExtensions.includes(ext);
        const matchesQuery = !query || file.toLowerCase().includes(query);
        return matchesExtension && matchesQuery && file !== '.gitignore';
      })
      .map((file) => ({
        filename: file,
        path: `/content/recipes/${file}`,
      }))
      .sort((a, b) => a.filename.localeCompare(b.filename))
      .slice(0, 10); // Limit to 10 results

    logger.info('API: Image search completed', {
      query,
      resultsCount: results.length,
    });

    return res.status(200).json(results);
  } catch (err) {
    logger.error('API: Error searching images', {
      query,
      error: err.message,
    });
    return res.status(500).json({
      error: 'Unable to search images. Please try again later.',
    });
  }
});

/**
 * POST /api/images/upload
 * Upload an image to content/recipes directory
 */
router.post('/images/upload', upload.single('image'), (req, res) => {
  logger.http('API: Upload image', {
    filename: req.file ? req.file.filename : 'none',
  });

  if (!req.file) {
    logger.warn('API: No file uploaded');
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const imagePath = `/content/recipes/${req.file.filename}`;

  logger.info('API: Image uploaded successfully', {
    filename: req.file.filename,
    size: req.file.size,
    path: imagePath,
  });

  return res.status(200).json({
    success: true,
    filename: req.file.filename,
    path: imagePath,
    size: req.file.size,
  });
});

module.exports = router;
