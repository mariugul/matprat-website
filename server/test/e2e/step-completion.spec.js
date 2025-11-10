/**
 * E2E tests for recipe step completion functionality
 */

const { test, expect } = require('@playwright/test');

test.describe('Step Completion', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a recipe page
    await page.goto('/recipes/Waffles');
    await page.waitForLoadState('networkidle');
  });

  test('should display recipe steps', async ({ page }) => {
    const steps = page.locator('.step-card');
    const count = await steps.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should mark step as complete when clicked', async ({ page }) => {
    const firstStep = page.locator('.step-card').first();
    
    // Click the step card
    await firstStep.click();
    await page.waitForTimeout(100);
    
    // Check if step has completed class
    const hasCompleteClass = await firstStep.evaluate((el) => 
      el.classList.contains('bg-success')
    );
    expect(hasCompleteClass).toBe(true);
  });

  test('should toggle step completion on repeated clicks', async ({ page }) => {
    const firstStep = page.locator('.step-card').first();
    
    // Click once - mark complete
    await firstStep.click();
    await page.waitForTimeout(100);
    let hasCompleteClass = await firstStep.evaluate((el) => 
      el.classList.contains('bg-success')
    );
    expect(hasCompleteClass).toBe(true);
    
    // Click again - mark incomplete
    await firstStep.click();
    await page.waitForTimeout(100);
    hasCompleteClass = await firstStep.evaluate((el) => 
      el.classList.contains('bg-success')
    );
    expect(hasCompleteClass).toBe(false);
  });

  test('should show completion indicator when step is complete', async ({ page }) => {
    const firstStep = page.locator('.step-card').first();
    
    // Mark step as complete
    await firstStep.click();
    await page.waitForTimeout(100);
    
    // Check for completion indicator
    const indicator = firstStep.locator('.completion-indicator');
    await expect(indicator).toBeVisible();
  });

  test('should allow multiple steps to be completed', async ({ page }) => {
    const steps = page.locator('.step-card');
    const count = await steps.count();
    
    if (count >= 2) {
      // Complete first two steps
      await steps.nth(0).click();
      await steps.nth(1).click();
      await page.waitForTimeout(200);
      
      // Check both are marked complete
      const firstComplete = await steps.nth(0).evaluate((el) => 
        el.classList.contains('bg-success')
      );
      const secondComplete = await steps.nth(1).evaluate((el) => 
        el.classList.contains('bg-success')
      );
      
      expect(firstComplete).toBe(true);
      expect(secondComplete).toBe(true);
    }
  });

  test('should show completion message when all steps done', async ({ page }) => {
    const steps = page.locator('.step-card');
    const count = await steps.count();
    
    // Complete all steps
    for (let i = 0; i < count; i++) {
      await steps.nth(i).click();
      await page.waitForTimeout(50);
    }
    
    // Check for completion message/card
    const completionCard = page.locator('#completionCard');
    await expect(completionCard).toBeVisible();
  });
});
