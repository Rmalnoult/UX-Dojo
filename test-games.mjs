import { chromium } from '@playwright/test';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

const screenshotsDir = join(process.cwd(), 'test-screenshots');

async function setupScreenshotsDir() {
  try {
    await mkdir(screenshotsDir, { recursive: true });
  } catch (err) {
    // Directory might already exist
  }
}

async function testHomepage(page) {
  console.log('\n=== Testing Homepage ===');
  await page.goto('http://localhost:3000');
  await page.waitForLoadState('networkidle');

  // Take screenshot
  await page.screenshot({ path: join(screenshotsDir, '01-homepage.png'), fullPage: true });

  // Count game cards
  const gameCards = await page.locator('[class*="game"], [class*="card"]').count();
  console.log(`Found ${gameCards} game cards on homepage`);

  // Check for game titles
  const pageContent = await page.content();
  const games = [
    'Design Language Memory',
    'User Flow Builder',
    'Wireframe Speed Challenge',
    'Component Detective',
    'A/B Testing Lab',
    'Usability Bug Hunt',
    'Gestalt Principles Puzzle',
    'Color Contrast Speedrun',
    'Accessibility Audit Challenge',
    'Dark Pattern Detective'
  ];

  const foundGames = [];
  const missingGames = [];

  for (const game of games) {
    if (pageContent.includes(game)) {
      foundGames.push(game);
    } else {
      missingGames.push(game);
    }
  }

  console.log(`Found games: ${foundGames.length}/10`);
  if (missingGames.length > 0) {
    console.log('Missing games:', missingGames);
  }

  return {
    success: foundGames.length >= 10,
    foundGames,
    missingGames,
    gameCards
  };
}

async function testGestaltGame(page) {
  console.log('\n=== Testing Gestalt Principles Puzzle ===');
  await page.goto('http://localhost:3000/games/gestalt');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  // Take screenshot
  await page.screenshot({ path: join(screenshotsDir, '02-gestalt.png'), fullPage: true });

  const pageContent = await page.content();
  const principles = ['proximity', 'similarity', 'closure', 'continuity'];
  const foundPrinciples = [];

  for (const principle of principles) {
    if (pageContent.toLowerCase().includes(principle)) {
      foundPrinciples.push(principle);
    }
  }

  console.log(`Found Gestalt principles: ${foundPrinciples.length}/4`);
  console.log(`Principles found: ${foundPrinciples.join(', ')}`);

  // Check for drag-and-drop elements
  const draggableElements = await page.locator('[draggable="true"], [data-draggable], .draggable').count();
  console.log(`Draggable elements found: ${draggableElements}`);

  // Check for drop zones
  const dropZones = await page.locator('[data-drop-zone], .drop-zone, [data-droppable]').count();
  console.log(`Drop zones found: ${dropZones}`);

  return {
    success: foundPrinciples.length >= 4,
    foundPrinciples,
    draggableElements,
    dropZones
  };
}

async function testContrastGame(page) {
  console.log('\n=== Testing Color Contrast Speedrun ===');
  await page.goto('http://localhost:3000/games/contrast');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  // Take screenshot
  await page.screenshot({ path: join(screenshotsDir, '03-contrast.png'), fullPage: true });

  const pageContent = await page.content();
  const wcagStandards = ['WCAG', 'AA', 'AAA'];
  const foundStandards = [];

  for (const standard of wcagStandards) {
    if (pageContent.includes(standard)) {
      foundStandards.push(standard);
    }
  }

  console.log(`Found WCAG standards: ${foundStandards.join(', ')}`);

  // Check for color samples
  const colorElements = await page.locator('[class*="color"], [style*="background"], [style*="color"]').count();
  console.log(`Color-related elements found: ${colorElements}`);

  // Check for answer buttons
  const buttons = await page.locator('button').count();
  console.log(`Buttons found: ${buttons}`);

  return {
    success: foundStandards.length >= 2,
    foundStandards,
    colorElements,
    buttons
  };
}

async function testAccessibilityGame(page) {
  console.log('\n=== Testing Accessibility Audit Challenge ===');
  await page.goto('http://localhost:3000/games/accessibility');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  // Take screenshot
  await page.screenshot({ path: join(screenshotsDir, '04-accessibility.png'), fullPage: true });

  const pageContent = await page.content();
  const severityLevels = ['critical', 'serious', 'moderate', 'minor'];
  const foundLevels = [];

  for (const level of severityLevels) {
    if (pageContent.toLowerCase().includes(level)) {
      foundLevels.push(level);
    }
  }

  console.log(`Found severity levels: ${foundLevels.length}/4`);
  console.log(`Levels found: ${foundLevels.join(', ')}`);

  // Check for images/mockups
  const images = await page.locator('img, [class*="mockup"], [class*="preview"]').count();
  console.log(`UI mockup elements found: ${images}`);

  return {
    success: foundLevels.length >= 4,
    foundLevels,
    mockupElements: images
  };
}

async function testDarkPatternsGame(page) {
  console.log('\n=== Testing Dark Pattern Detective ===');
  await page.goto('http://localhost:3000/games/dark-patterns');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  // Take screenshot
  await page.screenshot({ path: join(screenshotsDir, '05-dark-patterns.png'), fullPage: true });

  const pageContent = await page.content();
  const patternTypes = ['dark pattern', 'deceptive', 'manipulative', 'misleading'];
  const foundTypes = [];

  for (const type of patternTypes) {
    if (pageContent.toLowerCase().includes(type)) {
      foundTypes.push(type);
    }
  }

  console.log(`Found dark pattern references: ${foundTypes.length}`);
  console.log(`Types found: ${foundTypes.join(', ')}`);

  // Check for pattern examples
  const examples = await page.locator('[class*="example"], [class*="pattern"], [class*="card"]').count();
  console.log(`Pattern example elements found: ${examples}`);

  return {
    success: foundTypes.length >= 1,
    foundTypes,
    exampleElements: examples
  };
}

async function runTests() {
  await setupScreenshotsDir();

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  const results = {
    homepage: null,
    gestalt: null,
    contrast: null,
    accessibility: null,
    darkPatterns: null,
    errors: []
  };

  try {
    results.homepage = await testHomepage(page);
  } catch (error) {
    console.error('Error testing homepage:', error.message);
    results.errors.push({ test: 'homepage', error: error.message });
  }

  try {
    results.gestalt = await testGestaltGame(page);
  } catch (error) {
    console.error('Error testing Gestalt game:', error.message);
    results.errors.push({ test: 'gestalt', error: error.message });
  }

  try {
    results.contrast = await testContrastGame(page);
  } catch (error) {
    console.error('Error testing Contrast game:', error.message);
    results.errors.push({ test: 'contrast', error: error.message });
  }

  try {
    results.accessibility = await testAccessibilityGame(page);
  } catch (error) {
    console.error('Error testing Accessibility game:', error.message);
    results.errors.push({ test: 'accessibility', error: error.message });
  }

  try {
    results.darkPatterns = await testDarkPatternsGame(page);
  } catch (error) {
    console.error('Error testing Dark Patterns game:', error.message);
    results.errors.push({ test: 'darkPatterns', error: error.message });
  }

  await browser.close();

  // Save results to JSON
  await writeFile(
    join(screenshotsDir, 'test-results.json'),
    JSON.stringify(results, null, 2)
  );

  console.log('\n=== Test Summary ===');
  console.log(`Homepage: ${results.homepage?.success ? 'PASS' : 'FAIL'}`);
  console.log(`Gestalt Game: ${results.gestalt?.success ? 'PASS' : 'FAIL'}`);
  console.log(`Contrast Game: ${results.contrast?.success ? 'PASS' : 'FAIL'}`);
  console.log(`Accessibility Game: ${results.accessibility?.success ? 'PASS' : 'FAIL'}`);
  console.log(`Dark Patterns Game: ${results.darkPatterns?.success ? 'PASS' : 'FAIL'}`);
  console.log(`\nTotal Errors: ${results.errors.length}`);
  console.log(`Screenshots saved to: ${screenshotsDir}`);

  return results;
}

runTests().catch(console.error);
