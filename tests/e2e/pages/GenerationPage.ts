import { type Page, type Locator, expect } from '@playwright/test';

export class GenerationPage {
  readonly page: Page;
  
  // Main container
  readonly generationView: Locator;
  readonly generationCard: Locator;
  
  // Text input section
  readonly sourceTextInput: Locator;
  readonly characterCount: Locator;
  readonly validationMessage: Locator;
  readonly generateButton: Locator;
  
  // Result messages
  readonly errorMessage: Locator;
  readonly successMessage: Locator;
  readonly loadingSkeleton: Locator;
  
  // Results section
  readonly flashcardsList: Locator;
  readonly flashcardsListHeader: Locator;
  readonly flashcardsGrid: Locator;
  
  // Bulk actions
  readonly bulkSaveContainer: Locator;
  readonly saveAllButton: Locator;
  readonly saveAcceptedButton: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Initialize all locators using data-testid selectors
    this.generationView = page.getByTestId('flashcard-generation-view');
    this.generationCard = page.getByTestId('generation-card');
    
    // Text input section
    this.sourceTextInput = this.generationCard.getByTestId('source-text-input');
    this.characterCount = page.getByTestId('character-count');
    this.validationMessage = page.getByTestId('validation-message');
    this.generateButton = page.getByTestId('generate-flashcards-button');
    
    // Result messages
    this.errorMessage = page.getByTestId('error-message');
    this.successMessage = page.getByTestId('success-message');
    this.loadingSkeleton = page.getByTestId('loading-skeleton');
    
    // Results section
    this.flashcardsList = page.getByTestId('flashcards-list');
    this.flashcardsListHeader = page.getByTestId('flashcards-list-header');
    this.flashcardsGrid = page.getByTestId('flashcards-grid');
    
    // Bulk actions
    this.bulkSaveContainer = page.getByTestId('bulk-save-container');
    this.saveAllButton = page.getByTestId('save-all-button');
    this.saveAcceptedButton = page.getByTestId('save-accepted-button');
  }

  // Navigation
  async goto() {
    await this.page.goto('/generate');
    await expect(this.generationView).toBeVisible();
  }

  // Actions
  async enterText(text: string) {
    await this.sourceTextInput.clear();
    await this.sourceTextInput.click();
    await this.sourceTextInput.focus();
    
    // Wprowadzanie tekstu po 100 znaków
    const chunkSize = 100;
    for (let i = 0; i < text.length; i += chunkSize) {
      const chunk = text.substring(i, Math.min(i + chunkSize, text.length));
      const currentValue = await this.sourceTextInput.inputValue();
      await this.sourceTextInput.fill(currentValue + chunk);
    }
    
    await this.waitForGenerateButtonEnabled();
  }

  async clickGenerate() {
    await this.generateButton.click();
    // Wait for the API call to complete
    await this.page.waitForResponse(
      response => response.url().includes('/api/generations'),
      { timeout: 30000 }
    );
  }

  async waitForFlashcardsList() {
    await expect(this.flashcardsList).toBeVisible({ timeout: 30000 });
  }

  async acceptAllFlashcards() {
    // Wait for the flashcards list to be visible first
    await this.waitForFlashcardsList();
    
    // Find all accept buttons and click them
    const acceptButtons = this.page.getByTestId(/^flashcard-item-\d+$/).getByTestId('accept-button');
    const count = await acceptButtons.count();
    
    for (let i = 0; i < count; i++) {
      const button = acceptButtons.nth(i);
      await button.click();
    }
  }

  async saveAllFlashcards() {
    await this.saveAllButton.click();
    await expect(this.successMessage).toBeVisible({ timeout: 10000 });
  }

  async saveAcceptedFlashcards() {
    await this.saveAcceptedButton.click();
    await expect(this.successMessage).toBeVisible({ timeout: 10000 });
  }

  // State checks
  async isGenerateButtonEnabled() {
    return !(await this.generateButton.isDisabled({ timeout: 10000 }));
  }

  async waitForGenerateButtonEnabled() {
    await expect(this.generateButton).not.toBeDisabled({ timeout: 10000 });
  }

  async getFlashcardsCount() {
    const header = await this.flashcardsListHeader.textContent();
    const match = header?.match(/\((\d+)\)/);
    return match ? parseInt(match[1]) : 0;
  }

  // Test scenario helpers
  async generateFlashcardsFromText(text: string) {
    await this.enterText(text);
    await this.clickGenerate();
    await this.waitForFlashcardsList();
  }

  async generateAndAcceptAll(text: string) {
    await this.generateFlashcardsFromText(text);
    await this.acceptAllFlashcards();
    await this.saveAcceptedFlashcards();
  }
} 