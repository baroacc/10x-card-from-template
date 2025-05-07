import type { Locator, Page } from "@playwright/test";

/**
 * Page Object Model for the FlashcardModal component
 * Provides methods to interact with flashcard creation/editing modal
 */
export class FlashcardModalPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Get the modal container
   */
  getModal(): Locator {
    return this.page.locator('[data-testid="flashcard-form-modal"]');
  }

  /**
   * Get the form inside the modal
   */
  getForm(): Locator {
    return this.page.locator('[data-testid="flashcard-form"]');
  }

  /**
   * Get the title text from the modal
   */
  async getTitle(): Promise<string | null> {
    const modal = this.getModal();
    const title = modal.locator("h2").first();
    return await title.textContent();
  }

  /**
   * Check if the modal is visible
   */
  async isVisible(): Promise<boolean> {
    return await this.getModal().isVisible();
  }

  /**
   * Get the front side input
   */
  getFrontInput(): Locator {
    return this.page.locator('[data-testid="front-side-input"]');
  }

  /**
   * Get the back side input
   */
  getBackInput(): Locator {
    return this.page.locator('[data-testid="back-side-input"]');
  }

  /**
   * Fill the front side input
   */
  async fillFrontSide(text: string): Promise<void> {
    await this.getFrontInput().fill(text);
  }

  /**
   * Fill the back side input
   */
  async fillBackSide(text: string): Promise<void> {
    await this.getBackInput().fill(text);
  }

  /**
   * Click the submit button (Create or Save Changes)
   */
  async clickSubmit(): Promise<void> {
    await this.page.locator('[data-testid="submit-button"]').click();
  }

  /**
   * Click the cancel button
   */
  async clickCancel(): Promise<void> {
    await this.page.locator('[data-testid="cancel-button"]').click();
  }

  /**
   * Create a new flashcard
   */
  async createFlashcard(frontText: string, backText: string): Promise<void> {
    await this.fillFrontSide(frontText);
    await this.fillBackSide(backText);
    await this.clickSubmit();
  }

  /**
   * Edit an existing flashcard
   */
  async editFlashcard(frontText: string, backText: string): Promise<void> {
    await this.getFrontInput().clear();
    await this.getBackInput().clear();
    await this.fillFrontSide(frontText);
    await this.fillBackSide(backText);
    await this.clickSubmit();
  }

  /**
   * Get validation error messages if present
   */
  async getValidationErrors(): Promise<string[]> {
    const errorElements = this.page.locator('[data-testid="flashcard-form"] [role="alert"]');
    const count = await errorElements.count();
    const errors: string[] = [];

    for (let i = 0; i < count; i++) {
      const text = await errorElements.nth(i).textContent();
      if (text) errors.push(text);
    }

    return errors;
  }
}
