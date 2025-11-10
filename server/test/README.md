# Test Suite Documentation

## Overview
This test suite includes both **Integration Tests** and **E2E (System) Tests** to ensure the recipe website functions correctly.

## Test Structure

```
test/
├── integration/              # Integration tests (HTTP + DB)
│   ├── routes.home.test.js
│   ├── routes.recipes.test.js
│   └── routes.api.test.js
├── e2e/                      # End-to-end tests (browser)
│   ├── portion-calculator.spec.js
│   ├── step-completion.spec.js
│   ├── category-filter.spec.js
│   └── search-and-navigation.spec.js
├── setup.js                  # Test configuration
└── README.md                 # This file
```

## Running Tests

### All Tests
```bash
npm test
```

### Integration Tests Only
```bash
npm run test:integration
```

### E2E Tests Only
```bash
npm run test:e2e
```

### Watch Mode (for development)
```bash
npx mocha 'test/**/*.test.js' --watch
```

## Integration Tests

**Technology:** Mocha + Chai + Supertest  
**Tests:** 21 integration tests  
**Speed:** Fast (~50-200ms per test)

### What They Test
- ✅ Home page loads correctly
- ✅ Recipes list displays recipes from database
- ✅ Recipe detail page shows ingredients and steps
- ✅ 404 handling for non-existent recipes
- ✅ API endpoints return correct JSON
- ✅ API error handling

### Coverage
- `GET /` - Home page
- `GET /recipes` - Recipe list
- `GET /recipes/:name` - Recipe detail
- `GET /api/db/select/recipes` - API recipes
- `GET /api/db/select/recipe/:name` - API recipe detail

## E2E Tests

**Technology:** Playwright  
**Tests:** 20+ E2E tests  
**Speed:** Slower (~1-3s per test)

### What They Test
- ✅ Portion calculator increases/decreases portions
- ✅ Ingredient amounts update when portions change
- ✅ Step completion toggles on click
- ✅ Completion message shows when all steps done
- ✅ Category filtering shows/hides recipes
- ✅ Search filters recipes by name
- ✅ Navigation between pages works

### Critical Features Tested
1. **Portion Calculator**
   - Plus/minus buttons work
   - Ingredients scale correctly
   - Manual input works

2. **Step Completion**
   - Steps toggle on click
   - Multiple steps can be completed
   - Completion message appears

3. **Category Filtering**
   - Filters show correct recipes
   - Active button highlights
   - "All Recipes" shows everything

4. **Search & Navigation**
   - Search filters recipes
   - Navigation links work
   - Back button works

## Database Setup

Integration tests require a PostgreSQL database with test data.

### Local Testing
```bash
# Database should already be running via docker-compose
docker compose -f docker-compose.local.yml up -d
```

### CI/CD
GitHub Actions automatically:
1. Starts PostgreSQL service
2. Seeds test data
3. Runs tests

## Writing New Tests

### Integration Test Template
```javascript
const request = require('supertest');
const { expect } = require('chai');

describe('Feature Name', () => {
  let app;
  
  before(() => {
    app = require('../../app');
  });
  
  it('should do something', async () => {
    const res = await request(app).get('/path');
    expect(res.status).to.equal(200);
  });
});
```

### E2E Test Template
```javascript
const { test, expect } = require('@playwright/test');

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/path');
    await expect(page.locator('selector')).toBeVisible();
  });
});
```

## Test Environment

### Environment Variables
```bash
NODE_ENV=test
DB_HOST=localhost
DB_PORT=5432
DB_USER=nodejs
DB_PASSWORD=nodejs
DB=matprat
```

### Test Configuration Files
- `.mocharc.json` - Mocha configuration
- `playwright.config.js` - Playwright configuration
- `test/setup.js` - Test setup/helpers

## CI/CD Integration

Tests run automatically on:
- ✅ Pull requests to `main` branch
- ✅ Pushes to `main` branch (if configured)

### Pipeline Steps
1. Lint SQL files
2. Lint JavaScript/EJS
3. **Setup PostgreSQL database**
4. **Seed test data**
5. **Run integration tests**
6. Build

## Debugging Tests

### Integration Tests
```bash
# Run specific test file
npx mocha test/integration/routes.home.test.js

# Run with verbose output
npm run test:integration -- --reporter tap

# Debug mode
node --inspect-brk node_modules/.bin/mocha test/integration/*.test.js
```

### E2E Tests
```bash
# Run in headed mode (see browser)
npx playwright test --headed

# Run specific test
npx playwright test portion-calculator

# Debug mode (opens inspector)
npx playwright test --debug

# View test report
npx playwright show-report
```

## Test Maintenance

### When to Update Tests

**Update integration tests when:**
- Adding/modifying routes
- Changing API responses
- Modifying database schema
- Changing error handling

**Update E2E tests when:**
- Changing UI interactions
- Adding new JavaScript features
- Modifying form behavior
- Changing navigation flow

### Best Practices

**DO ✅**
- Keep tests simple and focused
- Test one thing per test
- Use descriptive test names
- Test both happy and error paths
- Clean up after tests

**DON'T ❌**
- Test implementation details
- Make tests dependent on each other
- Use fixed timeouts (use waitFor instead)
- Hardcode test data unnecessarily
- Leave commented-out tests

## Test Metrics

### Current Coverage
- **Routes:** 100% (all routes tested)
- **Critical features:** 100% (all tested)
- **API endpoints:** 100% (all tested)

### Test Count
- Integration tests: 21
- E2E tests: 20+
- Total: 40+ tests

### Execution Time
- Integration: ~2-5 seconds
- E2E: ~30-60 seconds
- Total: ~1 minute

## Troubleshooting

### Tests Fail Locally but Pass in CI
- Check database is running
- Verify environment variables
- Check Node.js version

### E2E Tests Timeout
- Increase timeout in `playwright.config.js`
- Check if server is running
- Verify page loads in browser manually

### Database Connection Errors
- Verify PostgreSQL is running
- Check environment variables
- Verify database credentials

### Flaky E2E Tests
- Add explicit waits (`page.waitForLoadState()`)
- Use Playwright's auto-waiting
- Avoid fixed timeouts
- Check for race conditions

## Future Improvements

### Potential Additions
1. **Code coverage reporting** - Add nyc/istanbul
2. **Visual regression testing** - Add Percy/Chromatic
3. **API contract testing** - Add Pact
4. **Performance testing** - Add k6 or Artillery
5. **Accessibility testing** - Add axe-core

### Nice to Have
- Parallel test execution
- Test result trends
- Coverage badges
- Automatic test generation

## Resources

- [Mocha Documentation](https://mochajs.org/)
- [Chai Assertions](https://www.chaijs.com/)
- [Supertest Guide](https://github.com/visionmedia/supertest)
- [Playwright Documentation](https://playwright.dev/)
