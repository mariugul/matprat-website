/**
 * Integration tests for recipes routes
 */

const request = require('supertest');
const { expect } = require('chai');

describe('Recipes Routes', () => {
  let app;

  before(() => {
    // Import app after environment is set
    app = require('../../app');
  });

  describe('GET /recipes', () => {
    it('should return 200 status code', async () => {
      const res = await request(app).get('/recipes');
      expect(res.status).to.equal(200);
    });

    it('should return HTML content', async () => {
      const res = await request(app).get('/recipes');
      expect(res.type).to.equal('text/html');
    });

    it('should display recipe list heading', async () => {
      const res = await request(app).get('/recipes');
      expect(res.text).to.match(/All Recipes|Recipe/i);
    });

    it('should load recipes from database', async () => {
      const res = await request(app).get('/recipes');
      expect(res.text).to.include('Waffles');
      expect(res.text).to.include('Pancakes');
    });

    it('should include search functionality', async () => {
      const res = await request(app).get('/recipes');
      expect(res.text).to.include('Search');
    });

    it('should include category filters', async () => {
      const res = await request(app).get('/recipes');
      expect(res.text).to.match(/breakfast|lunch|dinner/i);
    });
  });

  describe('GET /recipes/:name', () => {
    it('should return recipe details for existing recipe', async () => {
      const res = await request(app).get('/recipes/Waffles');
      expect(res.status).to.equal(200);
      expect(res.text).to.include('Waffles');
    });

    it('should display ingredients section', async () => {
      const res = await request(app).get('/recipes/Waffles');
      expect(res.text).to.include('Ingredients');
    });

    it('should display steps section', async () => {
      const res = await request(app).get('/recipes/Waffles');
      expect(res.text).to.match(/Steps|Instructions/i);
    });

    it('should include portion adjuster', async () => {
      const res = await request(app).get('/recipes/Waffles');
      expect(res.text).to.include('Adjust Portions');
      expect(res.text).to.include('nr-of-portions');
    });

    it('should load ingredients from database', async () => {
      const res = await request(app).get('/recipes/Waffles');
      // Check for common waffle ingredients
      expect(res.text).to.match(/butter|flour|egg|milk/i);
    });

    it('should return 404 for non-existent recipe', async () => {
      const res = await request(app).get('/recipes/NonExistentRecipe');
      expect(res.status).to.equal(404);
    });

    it('should show error message for non-existent recipe', async () => {
      const res = await request(app).get('/recipes/NonExistentRecipe');
      expect(res.text).to.match(/not exist|not found|error/i);
    });

    it('should handle special characters in recipe name', async () => {
      const res = await request(app).get('/recipes/Recipe%20With%20Spaces');
      // Should either 404 or handle gracefully
      expect([200, 404]).to.include(res.status);
    });
  });
});
