/**
 * Integration tests for home page routes
 */

const request = require('supertest');
const { expect } = require('chai');

describe('Home Page Routes', () => {
  let app;

  before(() => {
    // Import app after environment is set
    app = require('../../app');
  });

  describe('GET /', () => {
    it('should return 200 status code', async () => {
      const res = await request(app).get('/');
      expect(res.status).to.equal(200);
    });

    it('should return HTML content', async () => {
      const res = await request(app).get('/');
      expect(res.type).to.equal('text/html');
    });

    it('should contain page title', async () => {
      const res = await request(app).get('/');
      expect(res.text).to.include('Marius Foods');
    });

    it('should include navigation', async () => {
      const res = await request(app).get('/');
      expect(res.text).to.include('Home');
      expect(res.text).to.include('Recipes');
    });

    it('should load featured recipes from database', async () => {
      const res = await request(app).get('/');
      // Check that recipes content is present
      expect(res.text).to.match(/Waffles|Pancakes|Eggs/i);
    });

    it('should display recipe stats', async () => {
      const res = await request(app).get('/');
      expect(res.text).to.include('Recipes Available');
    });
  });
});
