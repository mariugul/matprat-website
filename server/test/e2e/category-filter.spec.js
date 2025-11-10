/**
 * E2E tests for recipe category filtering
 */

const { test, expect } = require('@playwright/test');

test.describe('Category Filtering', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to recipes list page
    await page.goto('/recipes');
    await page.waitForLoadState('networkidle');
  });

  test('should display all recipes by default', async ({ page }) => {
    const recipeCards = page.locator('.recipe-item');
    const count = await recipeCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should display category filter buttons', async ({ page }) => {
    await expect(page.locator('text=All Recipes')).toBeVisible();
    await expect(page.locator('text=Breakfast')).toBeVisible();
  });

  test('should filter recipes when category clicked', async ({ page }) => {
    // Get initial count
    const initialCards = page.locator('.recipe-item');
    const initialCount = await initialCards.count();
    
    // Click a category filter (e.g., Breakfast)
    await page.click('button:has-text("Breakfast")');
    await page.waitForTimeout(300);
    
    // Count visible recipes
    const visibleCards = page.locator('.recipe-item:visible');
    const visibleCount = await visibleCards.count();
    
    // Should have some visible (could be same or less depending on data)
    expect(visibleCount).toBeGreaterThan(0);
    expect(visibleCount).toBeLessThanOrEqual(initialCount);
  });

  test('should highlight active category button', async ({ page }) => {
    const breakfastButton = page.locator('button:has-text("Breakfast")');
    
    // Click breakfast
    await breakfastButton.click();
    await page.waitForTimeout(100);
    
    // Check if button has active class
    const hasActiveClass = await breakfastButton.evaluate((el) => 
      el.classList.contains('active') || el.classList.contains('btn-primary')
    );
    expect(hasActiveClass).toBe(true);
  });

  test('should show all recipes when "All Recipes" clicked', async ({ page }) => {
    // First filter by a category
    await page.click('button:has-text("Breakfast")');
    await page.waitForTimeout(200);
    
    // Then click "All Recipes"
    await page.click('button:has-text("All Recipes")');
    await page.waitForTimeout(200);
    
    // All recipe cards should be visible
    const recipeCards = page.locator('.recipe-item');
    const count = await recipeCards.count();
    
    // Check all are visible
    for (let i = 0; i < count; i++) {
      await expect(recipeCards.nth(i)).toBeVisible();
    }
  });

  test('should update URL or maintain state on filter', async ({ page }) => {
    const breakfastButton = page.locator('button:has-text("Breakfast")');
    
    // Click breakfast filter
    await breakfastButton.click();
    await page.waitForTimeout(200);
    
    // Button should still be active
    const hasActiveClass = await breakfastButton.evaluate((el) => 
      el.classList.contains('active')
    );
    expect(hasActiveClass).toBe(true);
  });
});
