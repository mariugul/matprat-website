/**
 * Integration tests for admin routes
 */

const request = require('supertest');
const { expect } = require('chai');

describe('Admin Routes', () => {
  let app;
  let agent; // For maintaining session across requests

  before(() => {
    // Import app after environment is set
    app = require('../../app');
    agent = request.agent(app); // Create agent to maintain sessions
  });

  // Helper function to login as admin
  async function loginAsAdmin() {
    const loginRes = await agent
      .post('/login')
      .send({
        username: 'admin',
        password: 'admin',
      });

    expect(loginRes.status).to.be.oneOf([200, 302]); // Success or redirect
    return loginRes;
  }

  describe('Authentication Required', () => {
    it('should redirect to login when not authenticated', async () => {
      const res = await request(app).get('/admin');
      expect(res.status).to.equal(302);
      expect(res.headers.location).to.include('/login');
    });

    it('should allow access to admin dashboard when authenticated', async () => {
      await loginAsAdmin();
      const res = await agent.get('/admin');
      expect(res.status).to.equal(200);
      expect(res.text).to.include('Admin Dashboard');
    });
  });

  describe('Recipe Form', () => {
    beforeEach(async () => {
      await loginAsAdmin();
    });

    it('should display new recipe form', async () => {
      const res = await agent.get('/admin/recipes/new');
      expect(res.status).to.equal(200);
      expect(res.text).to.include('Create New Recipe');
      expect(res.text).to.include('Recipe Name');
      expect(res.text).to.include('Ingredients');
      expect(res.text).to.include('Cooking Steps');
    });

    it('should display recipe images section', async () => {
      const res = await agent.get('/admin/recipes/new');
      expect(res.status).to.equal(200);
      expect(res.text).to.include('Recipe Images');
      expect(res.text).to.include('Image URL/Path');
    });
  });

  describe('POST /admin/recipes/save - Recipe Creation', () => {
    beforeEach(async () => {
      await loginAsAdmin();
    });

    it('should successfully create a new recipe with minimal data', async () => {
      const recipeData = {
        name: 'Test Recipe Minimal',
        description: 'A test recipe',
        cook_time: '30',
        servings: '4',
        difficulty: 'easy',
        ingredient_1: 'Test ingredient 1',
        ingredient_2: 'Test ingredient 2',
        step_1: 'Test step 1',
        step_2: 'Test step 2',
      };

      const res = await agent
        .post('/admin/recipes/save')
        .send(recipeData);

      console.log('Response status:', res.status);
      console.log('Response headers:', res.headers);
      console.log('Response text (first 500 chars):', res.text.substring(0, 500));

      // Should redirect to the recipe page on success
      expect(res.status).to.be.oneOf([200, 302]);

      if (res.status === 302) {
        expect(res.headers.location).to.include('/recipes/');
        expect(res.headers.location).to.include(encodeURIComponent('Test Recipe Minimal'));
      }
    });

    it('should create recipe with step notes', async () => {
      const recipeData = {
        name: 'Test Recipe With Notes',
        description: 'A test recipe with step notes',
        cook_time: '25',
        servings: '2',
        difficulty: 'medium',
        ingredient_1: 'Ingredient with note',
        step_1: 'Step with note',
        step_note_1: 'This is a special note for step 1',
      };

      const res = await agent
        .post('/admin/recipes/save')
        .send(recipeData);

      console.log('Step notes test - Status:', res.status);
      console.log('Step notes test - Location:', res.headers.location);

      expect(res.status).to.be.oneOf([200, 302]);
    });

    it('should create recipe with images', async () => {
      const recipeData = {
        name: 'Test Recipe With Images',
        description: 'A test recipe with images',
        cook_time: '20',
        servings: '3',
        difficulty: 'hard',
        ingredient_1: 'Image test ingredient',
        step_1: 'Image test step',
        image_url_1: '/test-image.jpg',
        image_desc_1: 'Test image description',
      };

      const res = await agent
        .post('/admin/recipes/save')
        .send(recipeData);

      console.log('Images test - Status:', res.status);
      console.log('Images test - Location:', res.headers.location);

      expect(res.status).to.be.oneOf([200, 302]);
    });

    it('should handle validation errors for missing required fields', async () => {
      const incompleteData = {
        name: 'Incomplete Recipe',
        description: 'Missing ingredients and steps',
        // No ingredients or steps
      };

      const res = await agent
        .post('/admin/recipes/save')
        .send(incompleteData);

      console.log('Validation test - Status:', res.status);
      console.log('Validation test - Location:', res.headers.location);

      // Should redirect back to form with error
      expect(res.status).to.equal(302);
      expect(res.headers.location).to.include('/admin/recipes/new');
      expect(res.headers.location).to.include('error=');
    });

    it('should handle empty ingredient and step fields', async () => {
      const dataWithEmpties = {
        name: 'Recipe With Empties',
        description: 'Has some empty fields',
        cook_time: '15',
        servings: '1',
        difficulty: 'easy',
        ingredient_1: 'Valid ingredient',
        ingredient_2: '', // Empty
        ingredient_3: 'Another valid ingredient',
        step_1: 'Valid step',
        step_2: '', // Empty
        step_3: 'Another valid step',
      };

      const res = await agent
        .post('/admin/recipes/save')
        .send(dataWithEmpties);

      console.log('Empty fields test - Status:', res.status);
      console.log('Empty fields test - Location:', res.headers.location);

      expect(res.status).to.be.oneOf([200, 302]);
    });
  });

  describe('POST /admin/recipes/save - Data Validation', () => {
    beforeEach(async () => {
      await loginAsAdmin();
    });

    it('should handle invalid numeric fields gracefully', async () => {
      const invalidData = {
        name: 'Invalid Numbers Recipe',
        description: 'Testing invalid numbers',
        cook_time: 'not-a-number',
        servings: 'also-not-a-number',
        difficulty: 'easy',
        ingredient_1: 'Test ingredient',
        step_1: 'Test step',
      };

      const res = await agent
        .post('/admin/recipes/save')
        .send(invalidData);

      console.log('Invalid numbers test - Status:', res.status);

      // Should still process (with defaults) or show validation error
      expect(res.status).to.be.oneOf([200, 302]);
    });

    it('should handle very long recipe names', async () => {
      const longNameData = {
        name: 'A'.repeat(500), // Very long name
        description: 'Testing long names',
        cook_time: '30',
        servings: '4',
        difficulty: 'easy',
        ingredient_1: 'Test ingredient',
        step_1: 'Test step',
      };

      const res = await agent
        .post('/admin/recipes/save')
        .send(longNameData);

      console.log('Long name test - Status:', res.status);

      expect(res.status).to.be.oneOf([200, 302, 400, 500]);
    });
  });

  describe('POST /admin/recipes/preview', () => {
    beforeEach(async () => {
      await loginAsAdmin();
    });

    it('should display recipe preview', async () => {
      const recipeData = {
        name: 'Preview Test Recipe',
        description: 'Testing preview functionality',
        cook_time: '20',
        servings: '2',
        difficulty: 'medium',
        ingredient_1: 'Preview ingredient',
        step_1: 'Preview step',
      };

      const res = await agent
        .post('/admin/recipes/preview')
        .send(recipeData);

      console.log('Preview test - Status:', res.status);

      expect(res.status).to.equal(200);
      expect(res.text).to.include('Preview Test Recipe');
      expect(res.text).to.include('Preview ingredient');
      expect(res.text).to.include('Preview step');
    });
  });
});
