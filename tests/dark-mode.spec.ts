import { test, expect } from '@playwright/test';

test.describe('Dark Mode UI Tests', () => {
  test('homepage has dark mode applied', async ({ page }) => {
    await page.goto('/');

    // Check that dark mode is applied
    const html = page.locator('html');
    await expect(html).toHaveClass(/dark/);

    // Check background color is dark
    const body = page.locator('body');
    const bgColor = await body.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });

    // Dark mode should have a dark background (low RGB values)
    expect(bgColor).toMatch(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    const matches = bgColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (matches) {
      const [_, r, g, b] = matches.map(Number);
      expect(r).toBeLessThan(50); // Dark background
      expect(g).toBeLessThan(50);
      expect(b).toBeLessThan(60);
    }

    // Take screenshot for visual verification
    await page.screenshot({ path: 'test-screenshots/homepage-dark.png', fullPage: true });
  });

  test('game cards are visible and styled correctly', async ({ page }) => {
    await page.goto('/');

    // Wait for game cards to load
    await page.waitForSelector('text=Hick\'s Law Challenge', { timeout: 5000 });

    // Check that cards are visible
    const cards = page.locator('text=Hick\'s Law Challenge').first();
    await expect(cards).toBeVisible();

    // Check card styling
    const cardElement = page.locator('.grid > a').first();
    await expect(cardElement).toBeVisible();

    // Hover effect
    await cardElement.hover();
    await page.screenshot({ path: 'test-screenshots/card-hover.png' });
  });

  test('navigation between pages maintains dark mode', async ({ page }) => {
    await page.goto('/');

    // Click on a game
    await page.click('text=Hick\'s Law Challenge');
    await page.waitForURL('**/games/hick');

    // Check dark mode is still applied
    const html = page.locator('html');
    await expect(html).toHaveClass(/dark/);

    // Take screenshot of game page
    await page.screenshot({ path: 'test-screenshots/hick-game-dark.png', fullPage: true });
  });

  test('game page UI elements are properly styled', async ({ page }) => {
    await page.goto('/games/hick');

    // Wait for page to load
    await page.waitForSelector('text=Hick\'s Law Challenge', { timeout: 5000 });

    // Check that intro card is visible
    const introCard = page.locator('text=How to Play').first();
    await expect(introCard).toBeVisible();

    // Check button is visible and styled
    const startButton = page.locator('button:has-text("Start Game")');
    await expect(startButton).toBeVisible();

    // Take screenshot
    await page.screenshot({ path: 'test-screenshots/game-intro.png', fullPage: true });
  });

  test('all game pages load with dark mode', async ({ page }) => {
    const games = [
      '/games/hick',
      '/games/fitts',
      '/games/miller',
      '/games/serial',
      '/games/progressive',
      '/games/quiz',
      '/games/gestalt',
      '/games/contrast',
      '/games/accessibility',
      '/games/dark-patterns'
    ];

    for (const gamePath of games) {
      await page.goto(gamePath);

      // Check dark mode is applied
      const html = page.locator('html');
      await expect(html).toHaveClass(/dark/);

      // Take screenshot
      const gameName = gamePath.split('/').pop();
      await page.screenshot({ path: `test-screenshots/${gameName}-dark.png`, fullPage: true });
    }
  });

  test('text contrast is sufficient for readability', async ({ page }) => {
    await page.goto('/');

    // Check main heading is visible and has proper styling
    const heading = page.locator('h1:has-text("UX Dojo")');
    await expect(heading).toBeVisible();

    // Check that text is readable by verifying it's not transparent
    const opacity = await heading.evaluate((el) => {
      return window.getComputedStyle(el).opacity;
    });
    expect(parseFloat(opacity)).toBeGreaterThan(0.5);

    // Check description text is visible
    const description = page.locator('text=Master the Laws of UX');
    await expect(description).toBeVisible();

    // Take screenshot for visual verification
    await page.screenshot({ path: 'test-screenshots/text-contrast.png' });
  });

  test('interactive elements have proper focus states', async ({ page }) => {
    await page.goto('/');

    // Focus on first game card
    const firstCard = page.locator('.grid > a').first();
    await firstCard.focus();

    // Take screenshot of focused state
    await page.screenshot({ path: 'test-screenshots/focus-state.png' });
  });

  test('buttons and interactive elements respond to hover', async ({ page }) => {
    await page.goto('/games/hick');
    await page.waitForSelector('button:has-text("Start Game")');

    const button = page.locator('button:has-text("Start Game")');

    // Before hover
    await page.screenshot({ path: 'test-screenshots/button-normal.png' });

    // Hover state
    await button.hover();
    await page.screenshot({ path: 'test-screenshots/button-hover.png' });
  });
});
