/**
 * E2E tests for admin recipe creation
 */

const { test, expect } = require('@playwright/test');

test.describe('Admin Recipe Creation', () => {
  
  // Helper function to login as admin
  async function loginAsAdmin(page) {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // Fill login form
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin');
    
    // Submit login form
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    
    // Verify we're logged in (should redirect to admin dashboard)
    await expect(page.url()).toContain('/admin');
  }

  test('should complete full recipe creation flow', async ({ page }) => {
    // Step 1: Login as admin
    console.log('=== STEP 1: LOGIN ===');
    await loginAsAdmin(page);
    
    // Step 2: Navigate to create new recipe
    console.log('=== STEP 2: NAVIGATE TO CREATE RECIPE ===');
    await page.goto('/admin/recipes/new');
    await page.waitForLoadState('networkidle');
    
    // Verify we're on the create recipe page
    await expect(page.locator('h1')).toContainText('Create New Recipe');
    
    // Step 3: Fill out basic recipe information
    console.log('=== STEP 3: FILL BASIC INFO ===');
    const recipeName = 'E2E Test Recipe ' + Date.now();
    
    await page.fill('input[name="name"]', recipeName);
    await page.fill('textarea[name="description"]', 'This is a test recipe created by Playwright E2E test');
    await page.fill('input[name="cook_time"]', '25');
    await page.fill('input[name="prep_time"]', '10');
    await page.fill('input[name="servings"]', '4');
    await page.selectOption('select[name="difficulty"]', 'intermediate');
    await page.fill('input[name="category"]', 'Test');
    
    // Step 4: Add ingredients
    console.log('=== STEP 4: ADD INGREDIENTS ===');
    await page.fill('input[name="ingredient_amount_1"]', '2');
    await page.selectOption('select[name="ingredient_unit_1"]', 'cups');
    await page.fill('input[name="ingredient_name_1"]', 'flour');
    
    // Add more ingredients using the "Add Ingredient" button
    await page.click('button#addIngredient');
    await page.fill('input[name="ingredient_amount_2"]', '1');
    await page.selectOption('select[name="ingredient_unit_2"]', 'cups');
    await page.fill('input[name="ingredient_name_2"]', 'milk');
    
    await page.click('button#addIngredient');
    await page.fill('input[name="ingredient_amount_3"]', '2');
    await page.selectOption('select[name="ingredient_unit_3"]', 'pcs');
    await page.fill('input[name="ingredient_name_3"]', 'eggs');
    
    await page.click('button#addIngredient');
    await page.fill('input[name="ingredient_amount_4"]', '1');
    await page.selectOption('select[name="ingredient_unit_4"]', 'tsp');
    await page.fill('input[name="ingredient_name_4"]', 'salt');
    
    // Step 5: Add cooking steps
    console.log('=== STEP 5: ADD STEPS ===');
    await page.fill('textarea[name="step_1"]', 'Mix flour and salt in a large bowl');
    
    // Add more steps using the "Add Step" button
    await page.click('button#addStep');
    await page.fill('textarea[name="step_2"]', 'In separate bowl, whisk eggs and milk');
    
    await page.click('button#addStep');
    await page.fill('textarea[name="step_3"]', 'Combine wet and dry ingredients until smooth');
    
    // Add a step with a note
    await page.click('button#addStep');
    await page.fill('textarea[name="step_4"]', 'Let batter rest for 5 minutes');
    
    // Add note to step 4
    const stepNoteCheckbox = page.locator('input[id="noteToggle_4"]');
    await stepNoteCheckbox.check();
    await page.fill('textarea[name="step_note_4"]', 'This resting time is important for texture');
    
    // Step 6: Add recipe images
    console.log('=== STEP 6: ADD IMAGES ===');
    await page.fill('input[name="image_url_1"]', '/test-recipe-image.jpg');
    await page.fill('input[name="image_desc_1"]', 'Finished test recipe');
    
    // Add another image
    await page.click('button:has-text("Add Image")');
    await page.fill('input[name="image_url_2"]', '/test-recipe-step.jpg');
    await page.fill('input[name="image_desc_2"]', 'Mixing ingredients');
    
    // Step 7: Preview the recipe
    console.log('=== STEP 7: PREVIEW RECIPE ===');
    await page.click('button:has-text("Preview Recipe")');
    await page.waitForLoadState('networkidle');
    
    // Verify preview shows our data
    await expect(page.locator('h1.recipe-title')).toContainText(recipeName);
    await expect(page.getByText('This is a test recipe created by Playwright')).toBeVisible();
    // Just verify we're on the preview page successfully
    console.log('✅ Preview page loaded successfully');
    
    // Step 8: Save the recipe
    console.log('=== STEP 8: SAVE RECIPE ===');
    await page.click('button:has-text("Publish Recipe")');
    await page.waitForLoadState('networkidle');
    
    // Step 9: Verify successful save
    console.log('=== STEP 9: VERIFY SUCCESS ===');
    // Should redirect to the recipe page
    await expect(page.url()).toContain('/recipes/');
    await expect(page.url()).toContain(encodeURIComponent(recipeName));
    
    // Verify recipe content is displayed
    await expect(page.locator('h1')).toContainText(recipeName);
    await expect(page.getByText('This is a test recipe created by Playwright')).toBeVisible();
    await expect(page.getByText('2 cups flour')).toBeVisible();
    await expect(page.getByText('1 cup milk')).toBeVisible();
    await expect(page.getByText('2 eggs')).toBeVisible();
    await expect(page.getByText('1 tsp salt')).toBeVisible();
    
    // Verify steps are displayed
    await expect(page.getByText('Mix flour and salt in a large bowl')).toBeVisible();
    await expect(page.getByText('In separate bowl, whisk eggs and milk')).toBeVisible();
    await expect(page.getByText('Combine wet and dry ingredients until smooth')).toBeVisible();
    await expect(page.getByText('Let batter rest for 5 minutes')).toBeVisible();
    
    // Verify step note is displayed
    await expect(page.getByText('This resting time is important for texture')).toBeVisible();
    
    console.log('=== TEST COMPLETED SUCCESSFULLY ===');
    console.log('Recipe created:', recipeName);
  });

  test('should handle form validation errors gracefully', async ({ page }) => {
    console.log('=== TESTING FORM VALIDATION ===');
    
    // Login first
    await loginAsAdmin(page);
    
    // Go to create recipe page
    await page.goto('/admin/recipes/new');
    await page.waitForLoadState('networkidle');
    
    // Try to save without filling required fields
    await page.click('button:has-text("Save Recipe")');
    await page.waitForLoadState('networkidle');
    
    // Should stay on the same page or show error
    // (We expect validation to prevent saving or show error message)
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/\/admin\/recipes\/(new|edit)/);
  });

  test('should allow editing step notes dynamically', async ({ page }) => {
    console.log('=== TESTING DYNAMIC STEP NOTES ===');
    
    await loginAsAdmin(page);
    await page.goto('/admin/recipes/new');
    await page.waitForLoadState('networkidle');
    
    // Add a step
    await page.fill('textarea[name="step_1"]', 'Test step for note functionality');
    
    // Initially, step note should not be visible
    const stepNoteTextarea = page.locator('textarea[name="step_note_1"]');
    await expect(stepNoteTextarea).toBeHidden();
    
    // Enable step note
    const stepNoteCheckbox = page.locator('input[id="noteToggle_1"]');
    await stepNoteCheckbox.check();
    
    // Now step note textarea should be visible
    await expect(stepNoteTextarea).toBeVisible();
    
    // Fill the note
    await page.fill('textarea[name="step_note_1"]', 'This is a dynamic step note');
    
    // Disable the note
    await stepNoteCheckbox.uncheck();
    
    // Note should be hidden again
    await expect(stepNoteTextarea).toBeHidden();
  });

  test('should add and remove ingredients dynamically', async ({ page }) => {
    console.log('=== TESTING DYNAMIC INGREDIENTS ===');
    
    await loginAsAdmin(page);
    await page.goto('/admin/recipes/new');
    await page.waitForLoadState('networkidle');
    
    // Initially should have 1 ingredient field
    await expect(page.locator('input[name="ingredient_1"]')).toBeVisible();
    
    // Add more ingredients
    await page.click('button#addIngredient');
    await expect(page.locator('input[name="ingredient_2"]')).toBeVisible();
    
    await page.click('button#addIngredient');
    await expect(page.locator('input[name="ingredient_3"]')).toBeVisible();
    
    // Fill some ingredients
    await page.fill('input[name="ingredient_1"]', 'First ingredient');
    await page.fill('input[name="ingredient_2"]', 'Second ingredient');
    await page.fill('input[name="ingredient_3"]', 'Third ingredient');
    
    // Remove an ingredient (should have remove buttons)
    const removeButtons = page.locator('button:has-text("Remove")');
    const removeButtonCount = await removeButtons.count();
    
    if (removeButtonCount > 0) {
      await removeButtons.first().click();
      console.log('Successfully clicked remove button');
    }
  });
});
