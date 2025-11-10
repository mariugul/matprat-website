/**
 * E2E tests for portion calculator functionality
 */

const { test, expect } = require('@playwright/test');

test.describe('Portion Calculator', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a recipe page
    await page.goto('/recipes/Waffles');
    await page.waitForLoadState('networkidle');
  });

  test('should display portion input with default value', async ({ page }) => {
    const portionInput = page.locator('#nr-of-portions');
    await expect(portionInput).toBeVisible();
    const value = await portionInput.inputValue();
    expect(parseInt(value, 10)).toBeGreaterThan(0);
  });

  test('should increase portions when plus button clicked', async ({ page }) => {
    const portionInput = page.locator('#nr-of-portions');
    const initialValue = await portionInput.inputValue();

    // Click plus button
    await page.click('#plus-button');

    // Wait a moment for update
    await page.waitForTimeout(100);

    const newValue = await portionInput.inputValue();
    expect(parseInt(newValue, 10)).toBe(parseInt(initialValue, 10) + 1);
  });

  test('should decrease portions when minus button clicked', async ({ page }) => {
    // First increase to make sure we can decrease
    await page.click('#plus-button');
    await page.click('#plus-button');

    const portionInput = page.locator('#nr-of-portions');
    const initialValue = await portionInput.inputValue();

    // Click minus button
    await page.click('#minus-button');

    await page.waitForTimeout(100);

    const newValue = await portionInput.inputValue();
    expect(parseInt(newValue, 10)).toBe(parseInt(initialValue, 10) - 1);
  });

  test('should update ingredient amounts when portions change', async ({ page }) => {
    // Get first ingredient amount
    const firstAmount = page.locator('.amounts').first();
    const initialAmount = await firstAmount.textContent();
    const initialValue = parseFloat(initialAmount);

    // Increase portions
    await page.click('#plus-button');
    await page.waitForTimeout(200);

    // Check ingredient updated
    const newAmount = await firstAmount.textContent();
    const newValue = parseFloat(newAmount);

    expect(newValue).toBeGreaterThan(initialValue);
  });

  test('should update all ingredient amounts proportionally', async ({ page }) => {
    // Get all ingredient amounts
    const amounts = page.locator('.amounts');
    const count = await amounts.count();

    // Store initial values
    const initialValues = [];
    for (let i = 0; i < count; i++) {
      const text = await amounts.nth(i).textContent();
      initialValues.push(parseFloat(text));
    }

    // Double the portions
    await page.click('#plus-button');
    await page.waitForTimeout(200);

    // Check all updated proportionally
    for (let i = 0; i < count; i++) {
      const text = await amounts.nth(i).textContent();
      const newValue = parseFloat(text);
      expect(newValue).toBeGreaterThan(initialValues[i]);
    }
  });

  test('should allow manual input of portion number', async ({ page }) => {
    const portionInput = page.locator('#nr-of-portions');

    // Clear and type new value
    await portionInput.fill('5');
    await portionInput.blur();

    await page.waitForTimeout(200);

    const value = await portionInput.inputValue();
    expect(value).toBe('5');
  });
});
