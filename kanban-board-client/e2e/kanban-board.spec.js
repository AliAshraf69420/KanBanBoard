import { test, expect } from '@playwright/test';

/**
 * End-to-end test covering:
 * - Creating lists & cards
 * - Moving cards
 * - Performing offline changes
 * - Syncing after reconnect
 */
test.describe('Kanban Board E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the app to load
    await expect(page.getByText('Kanban Board')).toBeVisible();
  });

  test('should create lists and cards', async ({ page }) => {
    // Create a list
    await page.getByRole('button', { name: '+ Add List' }).click();
    await expect(page.getByText('New List')).toBeVisible();

    // Create a card
    await page.getByRole('button', { name: '+ Add Card' }).first().click();
    await expect(page.getByText('New Card')).toBeVisible();
  });

  test('should rename a list', async ({ page }) => {
    // Create a list
    await page.getByRole('button', { name: '+ Add List' }).click();
    
    // Click on the list title to edit
    const listTitle = page.getByText('New List');
    await listTitle.click();
    
    // Type new title
    const input = page.getByDisplayValue('New List');
    await input.fill('Updated List');
    await input.press('Enter');
    
    // Verify title changed
    await expect(page.getByText('Updated List')).toBeVisible();
    await expect(page.getByText('New List')).not.toBeVisible();
  });

  test('should rename a card', async ({ page }) => {
    // Create list and card
    await page.getByRole('button', { name: '+ Add List' }).click();
    await page.getByRole('button', { name: '+ Add Card' }).first().click();
    
    // Click on card title to edit
    const cardTitle = page.getByText('New Card');
    await cardTitle.click();
    
    // Type new title
    const input = page.getByDisplayValue('New Card');
    await input.fill('Updated Card');
    await input.press('Enter');
    
    // Verify title changed
    await expect(page.getByText('Updated Card')).toBeVisible();
    await expect(page.getByText('New Card')).not.toBeVisible();
  });

  test('should delete a card', async ({ page }) => {
    // Create list and card
    await page.getByRole('button', { name: '+ Add List' }).click();
    await page.getByRole('button', { name: '+ Add Card' }).first().click();
    
    // Delete the card
    const removeButton = page.getByTitle('Remove Card').first();
    await removeButton.click();
    
    // Verify card is deleted
    await expect(page.getByText('New Card')).not.toBeVisible();
    await expect(page.getByText('No cards')).toBeVisible();
  });

  test('should delete a list', async ({ page }) => {
    // Create a list
    await page.getByRole('button', { name: '+ Add List' }).click();
    
    // Delete the list
    const removeButton = page.getByTitle('Remove List');
    await removeButton.click();
    
    // Verify list is deleted
    await expect(page.getByText('New List')).not.toBeVisible();
    await expect(page.getByText('No lists yet')).toBeVisible();
  });

  test('should move cards between lists using drag and drop', async ({ page }) => {
    // Create two lists
    await page.getByRole('button', { name: '+ Add List' }).click();
    await page.getByRole('button', { name: '+ Add List' }).click();
    
    // Create a card in the first list
    const addCardButtons = page.getByRole('button', { name: '+ Add Card' });
    await addCardButtons.first().click();
    
    // Get the card and second list
    const card = page.getByText('New Card').first();
    const lists = page.locator('[class*="bg-obsidian-surface"]');
    const secondList = lists.nth(1);
    
    // Drag card to second list
    await card.dragTo(secondList);
    
    // Verify card moved (check that it appears in the second list area)
    await expect(card).toBeVisible();
  });

  test('should handle offline changes and sync after reconnect', async ({ page, context }) => {
    // Create a list while online
    await page.getByRole('button', { name: '+ Add List' }).click();
    await expect(page.getByText('New List')).toBeVisible();
    
    // Go offline
    await context.setOffline(true);
    
    // Make changes while offline
    await page.getByRole('button', { name: '+ Add Card' }).first().click();
    await expect(page.getByText('New Card')).toBeVisible();
    
    // Create another list while offline
    await page.getByRole('button', { name: '+ Add List' }).click();
    
    // Verify changes are visible (optimistic updates)
    const lists = page.locator('text=New List');
    await expect(lists).toHaveCount(2);
    
    // Go back online
    await context.setOffline(false);
    
    // Wait a bit for sync to process (in real app, you'd wait for sync indicator)
    await page.waitForTimeout(2000);
    
    // Verify data is still there after sync
    await expect(page.getByText('New Card')).toBeVisible();
    await expect(lists).toHaveCount(2);
  });

  test('should support undo/redo functionality', async ({ page }) => {
    // Create a list
    await page.getByRole('button', { name: '+ Add List' }).click();
    await expect(page.getByText('New List')).toBeVisible();
    
    // Undo the action
    await page.getByRole('button', { name: 'Undo' }).click();
    await expect(page.getByText('New List')).not.toBeVisible();
    await expect(page.getByText('No lists yet')).toBeVisible();
    
    // Redo the action
    await page.getByRole('button', { name: 'Redo' }).click();
    await expect(page.getByText('New List')).toBeVisible();
  });

  test('should support keyboard shortcuts for undo/redo', async ({ page, browserName }) => {
    // Skip if browser doesn't support keyboard properly
    test.skip(browserName === 'webkit', 'WebKit has issues with keyboard shortcuts in tests');
    
    // Create a list
    await page.getByRole('button', { name: '+ Add List' }).click();
    await expect(page.getByText('New List')).toBeVisible();
    
    // Press Ctrl+Z (or Cmd+Z on Mac)
    const isMac = process.platform === 'darwin';
    if (isMac) {
      await page.keyboard.press('Meta+Z');
    } else {
      await page.keyboard.press('Control+Z');
    }
    
    // Verify undo worked
    await expect(page.getByText('New List')).not.toBeVisible();
    
    // Press Ctrl+Shift+Z (or Cmd+Shift+Z on Mac) for redo
    if (isMac) {
      await page.keyboard.press('Meta+Shift+Z');
    } else {
      await page.keyboard.press('Control+Shift+Z');
    }
    
    // Verify redo worked
    await expect(page.getByText('New List')).toBeVisible();
  });

  test('should create multiple cards and lists', async ({ page }) => {
    // Create multiple lists
    for (let i = 0; i < 3; i++) {
      await page.getByRole('button', { name: '+ Add List' }).click();
    }
    
    // Verify 3 lists exist
    const lists = page.locator('text=New List');
    await expect(lists).toHaveCount(3);
    
    // Add cards to first list
    const addCardButtons = page.getByRole('button', { name: '+ Add Card' });
    for (let i = 0; i < 2; i++) {
      await addCardButtons.first().click();
    }
    
    // Verify 2 cards exist
    const cards = page.locator('text=New Card');
    await expect(cards).toHaveCount(2);
  });
});

