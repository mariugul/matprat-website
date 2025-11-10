/**
 * E2E tests for search and navigation
 */

const { test, expect } = require('@playwright/test');

test.describe('Search and Navigation', () => {
  test('should navigate from home to recipes page', async ({ page }) => {
    await page.goto('/');

    // Click Recipes link in navigation
    await page.click('a:has-text("Recipes")');
    await page.waitForLoadState('networkidle');

    // Should be on recipes page
    expect(page.url()).toContain('/recipes');
  });

  test('should navigate to recipe detail from list', async ({ page }) => {
    await page.goto('/recipes');

    // Click on first recipe card
    const firstRecipe = page.locator('.recipe-card').first();
    await firstRecipe.click();
    await page.waitForLoadState('networkidle');

    // Should be on a recipe detail page
    expect(page.url()).toMatch(/\/recipes\/.+/);
  });

  test('should navigate back from recipe to recipes list', async ({ page }) => {
    await page.goto('/recipes/Waffles');

    // Click "Back to Recipes" button
    await page.click('a:has-text("Back to Recipes")');
    await page.waitForLoadState('networkidle');

    // Should be back on recipes list
    expect(page.url()).toContain('/recipes');
    expect(page.url()).not.toMatch(/\/recipes\/.+/);
  });

  test('should filter recipes with search input', async ({ page }) => {
    await page.goto('/recipes');

    const searchInput = page.locator('#searchInput');
    await expect(searchInput).toBeVisible();

    // Type search term
    await searchInput.fill('Waffle');
    await page.waitForTimeout(300);

    // Should filter recipes
    const visibleRecipes = page.locator('.recipe-item:visible');
    const count = await visibleRecipes.count();

    // At least one visible (Waffles)
    expect(count).toBeGreaterThan(0);

    // Check if Waffles is visible
    await expect(page.locator('.recipe-card:has-text("Waffles")')).toBeVisible();
  });

  test('should show no results message when search has no matches', async ({ page }) => {
    await page.goto('/recipes');

    const searchInput = page.locator('#searchInput');

    // Type search term that doesn't match
    await searchInput.fill('NonExistentRecipe123');
    await page.waitForTimeout(300);

    // Should show no results message
    const noResults = page.locator('#noResults');
    await expect(noResults).toBeVisible();
  });

  test('should clear search when category filter clicked', async ({ page }) => {
    await page.goto('/recipes');

    const searchInput = page.locator('#searchInput');

    // Type search term
    await searchInput.fill('Test');
    await page.waitForTimeout(200);

    // Click category filter
    await page.click('button:has-text("Breakfast")');
    await page.waitForTimeout(200);

    // Search should be cleared
    const value = await searchInput.inputValue();
    expect(value).toBe('');
  });

  test('should highlight active page in navigation', async ({ page }) => {
    await page.goto('/recipes');
    await page.waitForLoadState('networkidle');

    // Recipes link should be active
    const recipesLink = page.locator('nav a:has-text("Recipes")');
    const hasActiveClass = await recipesLink.evaluate((el) => el.classList.contains('active')
      || el.parentElement.classList.contains('active'));
    expect(hasActiveClass).toBe(true);
  });
});
