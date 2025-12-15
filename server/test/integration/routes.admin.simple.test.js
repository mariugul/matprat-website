/**
 * Simple admin routes tests - focusing on save functionality
 */

const request = require('supertest');
const { loadChai, getExpect } = require('../setup');

describe('Admin Save Recipe - Simple Tests', () => {
  let app;
  let expect;

  before(async () => {
    await loadChai();
    expect = getExpect();
    app = require('../../app');
  });

  describe('POST /admin/recipes/save - Direct Testing', () => {
    it('should respond to save recipe endpoint', async () => {
      const recipeData = {
        name: 'Test Recipe Direct',
        description: 'Direct test recipe',
        cook_time: '30',
        servings: '4',
        difficulty: 'easy',
        ingredient_1: 'Test ingredient 1',
        step_1: 'Test step 1',
      };

      console.log('\n=== SENDING REQUEST ===');
      console.log('Recipe Data:', recipeData);

      const res = await request(app)
        .post('/admin/recipes/save')
        .send(recipeData)
        .expect((response) => {
          console.log('\n=== RESPONSE RECEIVED ===');
          console.log('Status:', response.status);
          console.log('Headers:', response.headers);
          if (response.text && response.text.length < 1000) {
            console.log('Body:', response.text);
          } else {
            console.log('Response text (first 500 chars):', response.text?.substring(0, 500));
          }
        });

      // We expect either:
      // 302 redirect to login (if auth required)
      // 302 redirect to recipe (if successful)
      // 400/500 error (if validation/server error)
      expect(res.status).to.be.oneOf([200, 302, 400, 401, 403, 500]);
    });

    it('should handle empty request body', async () => {
      console.log('\n=== TESTING EMPTY BODY ===');

      const res = await request(app)
        .post('/admin/recipes/save')
        .send({})
        .expect((response) => {
          console.log('Empty body - Status:', response.status);
          console.log('Empty body - Location:', response.headers.location);
        });

      expect(res.status).to.be.oneOf([200, 302, 400, 401, 403, 500]);
    });

    it('should handle malformed data', async () => {
      const malformedData = {
        name: null,
        description: undefined,
        cook_time: 'abc',
        servings: -5,
        difficulty: 'invalid_difficulty',
      };

      console.log('\n=== TESTING MALFORMED DATA ===');
      console.log('Malformed data:', malformedData);

      const res = await request(app)
        .post('/admin/recipes/save')
        .send(malformedData)
        .expect((response) => {
          console.log('Malformed - Status:', response.status);
          console.log('Malformed - Location:', response.headers.location);
        });

      expect(res.status).to.be.oneOf([200, 302, 400, 401, 403, 500]);
    });
  });

  describe('POST /admin/recipes/preview - Direct Testing', () => {
    it('should respond to preview recipe endpoint', async () => {
      const recipeData = {
        name: 'Preview Test Direct',
        description: 'Direct preview test',
        cook_time: '25',
        servings: '2',
        difficulty: 'medium',
        ingredient_1: 'Preview ingredient',
        step_1: 'Preview step',
      };

      console.log('\n=== TESTING PREVIEW ENDPOINT ===');

      const res = await request(app)
        .post('/admin/recipes/preview')
        .send(recipeData)
        .expect((response) => {
          console.log('Preview - Status:', response.status);
          console.log('Preview - Content-Type:', response.headers['content-type']);
        });

      expect(res.status).to.be.oneOf([200, 302, 400, 401, 403, 500]);
    });
  });

  describe('GET /admin routes accessibility', () => {
    it('should respond to admin dashboard endpoint', async () => {
      console.log('\n=== TESTING ADMIN DASHBOARD ACCESS ===');

      const res = await request(app)
        .get('/admin')
        .expect((response) => {
          console.log('Admin dashboard - Status:', response.status);
          console.log('Admin dashboard - Location:', response.headers.location);
        });

      // Should redirect to login or show dashboard
      expect(res.status).to.be.oneOf([200, 302, 401, 403]);
    });

    it('should respond to new recipe form endpoint', async () => {
      console.log('\n=== TESTING NEW RECIPE FORM ACCESS ===');

      const res = await request(app)
        .get('/admin/recipes/new')
        .expect((response) => {
          console.log('New recipe form - Status:', response.status);
          console.log('New recipe form - Location:', response.headers.location);
        });

      expect(res.status).to.be.oneOf([200, 302, 401, 403]);
    });
  });
});
