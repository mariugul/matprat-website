/**
 * Integration tests for API routes
 */

const request = require('supertest');
const { loadChai, getExpect } = require('../setup');

describe('API Routes', () => {
  let app;
  let expect;

  before(async () => {
    await loadChai();
    expect = getExpect();
    // Import app after environment is set
    app = require('../../app');
  });

  describe('GET /api/db/select/recipes', () => {
    it('should return 200 status code', async () => {
      const res = await request(app).get('/api/db/select/recipes');
      expect(res.status).to.equal(200);
    });

    it('should return JSON content', async () => {
      const res = await request(app).get('/api/db/select/recipes');
      expect(res.type).to.match(/json/);
    });

    it('should return array of recipe names', async () => {
      const res = await request(app).get('/api/db/select/recipes');
      expect(res.body).to.be.an('array');
      expect(res.body.length).to.be.greaterThan(0);
    });

    it('should include known recipes', async () => {
      const res = await request(app).get('/api/db/select/recipes');
      const recipeNames = res.body.flat();
      expect(recipeNames).to.include('Waffles');
    });
  });

  describe('GET /api/db/select/recipe/:name', () => {
    it('should return recipe data for existing recipe', async () => {
      const res = await request(app).get('/api/db/select/recipe/Waffles');
      expect(res.status).to.equal(200);
      expect(res.type).to.match(/json/);
    });

    it('should return recipe object with expected fields', async () => {
      const res = await request(app).get('/api/db/select/recipe/Waffles');
      expect(res.body).to.be.an('object');
      expect(res.body).to.have.property('name');
      expect(res.body.name).to.equal('Waffles');
    });

    it('should return 404 for non-existent recipe', async () => {
      const res = await request(app).get('/api/db/select/recipe/NonExistent');
      expect(res.status).to.equal(404);
    });

    it('should return JSON error for non-existent recipe', async () => {
      const res = await request(app).get('/api/db/select/recipe/NonExistent');
      expect(res.type).to.match(/json/);
      expect(res.body).to.have.property('error');
    });

    it('should handle URL encoded recipe names', async () => {
      const res = await request(app).get('/api/db/select/recipe/Waffles');
      expect(res.status).to.equal(200);
      expect(res.body.name).to.equal('Waffles');
    });
  });
});
