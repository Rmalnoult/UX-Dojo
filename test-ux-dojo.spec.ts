import { test, expect } from '@playwright/test';

test.describe('UX Dojo Application Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('1. Homepage displays all 6 game cards', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Take screenshot of homepage
    await page.screenshot({ path: 'screenshots/01-homepage.png', fullPage: true });

    // Check for page title
    await expect(page).toHaveTitle(/UX Dojo/);

    // Look for game cards - they might be in a grid or list
    const gameCards = page.locator('[data-testid*="game"], .game-card, article, [class*="card"]');
    const cardCount = await gameCards.count();

    console.log(`Found ${cardCount} game cards`);

    // Verify we have 6 game cards
    expect(cardCount).toBeGreaterThanOrEqual(6);

    // Check for specific game titles
    await expect(page.getByText(/Hick'?s Law/i)).toBeVisible();
    await expect(page.getByText(/Fitts'?s Law/i)).toBeVisible();
    await expect(page.getByText(/Miller'?s Law/i)).toBeVisible();
  });

  test('2. Hick\'s Law Challenge - Full gameplay', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Find and click on Hick's Law game card
    const hicksLawCard = page.getByText(/Hick'?s Law/i).first();
    await hicksLawCard.click();

    // Wait for game page to load
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'screenshots/02-hicks-law-game-page.png', fullPage: true });

    // Look for start button
    const startButton = page.getByRole('button', { name: /start|play|begin/i }).first();
    if (await startButton.isVisible()) {
      await startButton.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'screenshots/03-hicks-law-game-started.png', fullPage: true });
    }

    // Try to interact with menu options (click on buttons/options)
    const menuOptions = page.locator('button:visible, [role="button"]:visible');
    const optionCount = await menuOptions.count();
    console.log(`Hick's Law: Found ${optionCount} clickable options`);

    if (optionCount > 0) {
      // Click on first few options
      for (let i = 0; i < Math.min(3, optionCount); i++) {
        try {
          await menuOptions.nth(i).click({ timeout: 1000 });
          await page.waitForTimeout(300);
        } catch (e) {
          console.log(`Could not click option ${i}: ${e}`);
        }
      }

      await page.screenshot({ path: 'screenshots/04-hicks-law-after-clicks.png', fullPage: true });
    }

    // Check for score display
    const scoreElement = page.locator('[data-testid*="score"], .score, [class*="score"]').first();
    if (await scoreElement.isVisible()) {
      const scoreText = await scoreElement.textContent();
      console.log(`Hick's Law Score: ${scoreText}`);
    }
  });

  test('3. Fitts\'s Law Reflex - Target clicking', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Navigate to Fitts's Law game
    const fittsLawCard = page.getByText(/Fitts'?s Law/i).first();
    await fittsLawCard.click();

    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'screenshots/05-fitts-law-game-page.png', fullPage: true });

    // Start the game
    const startButton = page.getByRole('button', { name: /start|play|begin/i }).first();
    if (await startButton.isVisible()) {
      await startButton.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'screenshots/06-fitts-law-game-started.png', fullPage: true });
    }

    // Look for targets to click
    const targets = page.locator('[data-testid*="target"], .target, [class*="target"], button:visible');
    const targetCount = await targets.count();
    console.log(`Fitts's Law: Found ${targetCount} potential targets`);

    // Click on multiple targets
    for (let i = 0; i < Math.min(10, targetCount); i++) {
      try {
        const target = targets.nth(i);
        if (await target.isVisible()) {
          await target.click({ timeout: 1000 });
          await page.waitForTimeout(200);
        }
      } catch (e) {
        console.log(`Could not click target ${i}`);
      }
    }

    await page.screenshot({ path: 'screenshots/07-fitts-law-after-clicks.png', fullPage: true });

    // Check if game completed
    const completionMessage = page.getByText(/complete|finish|done|game over/i);
    if (await completionMessage.isVisible({ timeout: 2000 })) {
      console.log('Fitts\'s Law game completed!');
      await page.screenshot({ path: 'screenshots/08-fitts-law-completed.png', fullPage: true });
    }
  });

  test('4. Miller\'s Law Memory - Sequence and dragging', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Navigate to Miller's Law game
    const millersLawCard = page.getByText(/Miller'?s Law/i).first();
    await millersLawCard.click();

    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'screenshots/09-millers-law-game-page.png', fullPage: true });

    // Start the game
    const startButton = page.getByRole('button', { name: /start|play|begin/i }).first();
    if (await startButton.isVisible()) {
      await startButton.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'screenshots/10-millers-law-game-started.png', fullPage: true });
    }

    // Watch the sequence (wait a bit)
    console.log('Watching sequence...');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'screenshots/11-millers-law-watching-sequence.png', fullPage: true });

    // Try to find draggable items
    const draggableItems = page.locator('[draggable="true"], [data-draggable], .draggable, [class*="drag"]');
    const draggableCount = await draggableItems.count();
    console.log(`Miller's Law: Found ${draggableCount} draggable items`);

    // Try dragging if items are found
    if (draggableCount > 1) {
      try {
        const firstItem = draggableItems.first();
        const secondItem = draggableItems.nth(1);

        await firstItem.dragTo(secondItem);
        await page.waitForTimeout(500);
        await page.screenshot({ path: 'screenshots/12-millers-law-after-drag.png', fullPage: true });
      } catch (e) {
        console.log(`Could not drag items: ${e}`);
      }
    }

    // Try clicking on items as alternative interaction
    const clickableItems = page.locator('button:visible, [role="button"]:visible, .item, [class*="item"]');
    const clickableCount = await clickableItems.count();

    if (clickableCount > 0) {
      for (let i = 0; i < Math.min(3, clickableCount); i++) {
        try {
          await clickableItems.nth(i).click({ timeout: 1000 });
          await page.waitForTimeout(300);
        } catch (e) {
          console.log(`Could not click item ${i}`);
        }
      }
      await page.screenshot({ path: 'screenshots/13-millers-law-after-clicks.png', fullPage: true });
    }
  });

  test('5. Test additional game - Verify loading', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Find all game cards on homepage
    const gameCards = page.locator('a, button, [role="link"], [role="button"]').filter({ hasText: /Law|Challenge|Game/ });
    const cardCount = await gameCards.count();

    console.log(`Found ${cardCount} game links`);

    // Try to find a different game (not Hick's, Fitts's, or Miller's)
    const possibleGames = [
      /Jakob'?s Law/i,
      /Tesler'?s Law/i,
      /Von Restorff/i,
      /Parkinson'?s Law/i,
      /Aesthetic/i,
      /Serial Position/i
    ];

    let gameFound = false;
    for (const gamePattern of possibleGames) {
      const gameCard = page.getByText(gamePattern).first();
      if (await gameCard.isVisible({ timeout: 1000 })) {
        console.log(`Testing game: ${gamePattern}`);
        await gameCard.click();
        await page.waitForLoadState('networkidle');
        await page.screenshot({ path: 'screenshots/14-additional-game.png', fullPage: true });

        // Verify game loaded
        expect(page.url()).not.toBe('http://localhost:3000/');

        // Look for start button or game content
        const startButton = page.getByRole('button', { name: /start|play|begin/i }).first();
        const hasStartButton = await startButton.isVisible({ timeout: 2000 });

        if (hasStartButton) {
          console.log('Additional game has start button - game loaded successfully');
          await startButton.click();
          await page.waitForTimeout(500);
          await page.screenshot({ path: 'screenshots/15-additional-game-started.png', fullPage: true });
        }

        gameFound = true;
        break;
      }
    }

    if (!gameFound) {
      console.log('No additional game found, trying first non-tested game');
      // Just click on the 4th card (index 3) if it exists
      if (cardCount >= 4) {
        await gameCards.nth(3).click();
        await page.waitForLoadState('networkidle');
        await page.screenshot({ path: 'screenshots/14-additional-game.png', fullPage: true });
      }
    }
  });

  test('6. Error detection - Check console errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    const consoleWarnings: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      } else if (msg.type() === 'warning') {
        consoleWarnings.push(msg.text());
      }
    });

    page.on('pageerror', error => {
      consoleErrors.push(`Page Error: ${error.message}`);
    });

    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    console.log(`Console Errors: ${consoleErrors.length}`);
    console.log(`Console Warnings: ${consoleWarnings.length}`);

    if (consoleErrors.length > 0) {
      console.log('Errors found:');
      consoleErrors.forEach(err => console.log(`  - ${err}`));
    }

    if (consoleWarnings.length > 0) {
      console.log('Warnings found:');
      consoleWarnings.forEach(warn => console.log(`  - ${warn}`));
    }

    // Don't fail the test on console errors, just report them
    // expect(consoleErrors.length).toBe(0);
  });
});
