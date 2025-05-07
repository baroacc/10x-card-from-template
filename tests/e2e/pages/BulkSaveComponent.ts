import { type Page, type Locator, expect } from "@playwright/test";

export class BulkSaveComponent {
  readonly page: Page;

  // Container
  readonly bulkSaveContainer: Locator;

  // Buttons
  readonly saveAllButton: Locator;
  readonly saveAcceptedButton: Locator;

  // Messages
  readonly successMessage: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize all locators using data-testid selectors
    this.bulkSaveContainer = page.getByTestId("bulk-save-container");
    this.saveAllButton = page.getByTestId("save-all-button");
    this.saveAcceptedButton = page.getByTestId("save-accepted-button");
    this.successMessage = page.getByTestId("success-message");
  }

  // Actions
  async saveAll() {
    await this.saveAllButton.click();
    await this.waitForSuccessMessage();
  }

  async saveAccepted() {
    await this.saveAcceptedButton.click();
    await this.waitForSuccessMessage();
  }

  async waitForSuccessMessage() {
    await expect(this.successMessage).toBeVisible({ timeout: 10000 });
  }

  // State checks
  async isSaveAllEnabled() {
    return !(await this.saveAllButton.isDisabled());
  }

  async isSaveAcceptedEnabled() {
    return !(await this.saveAcceptedButton.isDisabled());
  }

  async getSaveAllButtonText() {
    return await this.saveAllButton.textContent();
  }

  async getSaveAcceptedButtonText() {
    return await this.saveAcceptedButton.textContent();
  }

  async getFlashcardsCount() {
    const text = await this.getSaveAllButtonText();
    const match = text?.match(/\((\d+)\)/);
    return match ? parseInt(match[1]) : 0;
  }

  async getAcceptedFlashcardsCount() {
    const text = await this.getSaveAcceptedButtonText();
    const match = text?.match(/\((\d+)\)/);
    return match ? parseInt(match[1]) : 0;
  }
}
