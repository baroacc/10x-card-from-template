import type { Locator, Page } from '@playwright/test';

/**
 * Page Object Model for the FlashcardItem component
 * Provides methods to interact with individual flashcard items
 */
export class FlashcardItemPage {
  readonly page: Page;
  readonly container: Locator;

  constructor(page: Page, itemId: number) {
    this.page = page;
    this.container = page.locator(`[data-testid="flashcard-item-${itemId}"]`);
  }

  /**
   * Get the date information (created/updated) of the flashcard
   */
  getDate(): Locator {
    return this.container.locator('[data-testid="flashcard-date"]');
  }

  /**
   * Get the front content of the flashcard
   */
  getFrontContent(): Locator {
    return this.container.locator('[data-testid="flashcard-front"]');
  }

  /**
   * Get the back content of the flashcard
   */
  getBackContent(): Locator {
    return this.container.locator('[data-testid="flashcard-back"]');
  }

  /**
   * Get the source information of the flashcard
   */
  getSource(): Locator {
    return this.container.locator('[data-testid="flashcard-source"]');
  }

  /**
   * Click the edit button to edit the flashcard
   */
  async clickEdit(): Promise<void> {
    await this.container.locator('[data-testid="edit-flashcard-button"]').click();
  }

  /**
   * Click the delete button to open delete confirmation dialog
   */
  async clickDelete(): Promise<void> {
    await this.container.locator('[data-testid="delete-flashcard-button"]').click();
  }

  /**
   * Confirm deletion in the delete confirmation dialog
   */
  async confirmDelete(): Promise<void> {
    await this.page.locator('[data-testid="delete-confirmation-dialog"]')
      .locator('[data-testid="confirm-delete-button"]').click();
  }

  /**
   * Cancel deletion in the delete confirmation dialog
   */
  async cancelDelete(): Promise<void> {
    await this.page.locator('[data-testid="delete-confirmation-dialog"]')
      .locator('[data-testid="cancel-delete-button"]').click();
  }

  /**
   * Check if the delete confirmation dialog is visible
   */
  async isDeleteDialogVisible(): Promise<boolean> {
    return await this.page.locator('[data-testid="delete-confirmation-dialog"]').isVisible();
  }
} 