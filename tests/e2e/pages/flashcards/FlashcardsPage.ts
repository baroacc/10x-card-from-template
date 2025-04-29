import type { Locator, Page } from '@playwright/test';
import { FlashcardItemPage } from './FlashcardItemPage';
import { FlashcardModalPage } from './FlashcardModalPage';
import { SearchAndPaginationPage } from './SearchAndPaginationPage';

/**
 * Page Object Model for the FlashcardsPage component
 * Main page for managing flashcards with search, pagination, and CRUD operations
 */
export class FlashcardsPage {
  readonly page: Page;
  readonly searchAndPagination: SearchAndPaginationPage;
  readonly flashcardModal: FlashcardModalPage;
  
  constructor(page: Page) {
    this.page = page;
    this.searchAndPagination = new SearchAndPaginationPage(page);
    this.flashcardModal = new FlashcardModalPage(page);
  }

  /**
   * Navigate to the flashcards page
   */
  async goto(): Promise<void> {
    await this.page.goto('/flashcards');
  }

  /**
   * Get the container element of the page
   */
  getContainer(): Locator {
    return this.page.locator('[data-testid="flashcards-page"]');
  }

  /**
   * Get the add new flashcard button
   */
  getAddFlashcardButton(): Locator {
    return this.page.locator('[data-testid="add-flashcard-button"]');
  }

  /**
   * Get the loading spinner element
   */
  getLoadingSpinner(): Locator {
    return this.page.locator('[data-testid="loading-spinner"]');
  }

  /**
   * Get the error message element if present
   */
  getErrorMessage(): Locator {
    return this.page.locator('[data-testid="error-message"]');
  }

  /**
   * Get the flashcards list container
   */
  getFlashcardsList(): Locator {
    return this.page.locator('[data-testid="flashcards-list"]');
  }

  /**
   * Click the add new flashcard button to open the modal
   */
  async clickAddFlashcard(): Promise<void> {
    await this.getAddFlashcardButton().click();
  }

  /**
   * Create a new flashcard with the given front and back text
   */
  async createNewFlashcard(frontText: string, backText: string): Promise<void> {
    await this.clickAddFlashcard();
    await this.flashcardModal.createFlashcard(frontText, backText);
  }

  /**
   * Check if the page is currently loading (spinner is visible)
   */
  async isLoading(): Promise<boolean> {
    return await this.getLoadingSpinner().isVisible();
  }

  /**
   * Check if an error message is displayed
   */
  async hasError(): Promise<boolean> {
    return await this.getErrorMessage().isVisible();
  }

  /**
   * Get the error message text if present
   */
  async getErrorText(): Promise<string | null> {
    if (await this.hasError()) {
      return await this.getErrorMessage().textContent();
    }
    return null;
  }

  /**
   * Wait for the spinner to disappear (become hidden)
   * @param timeout Optional timeout in milliseconds
   */
  async waitForSpinnerToDisappear(timeout?: number): Promise<void> {
    await this.getLoadingSpinner().waitFor({ state: 'hidden', timeout });
  }

  /**
   * Wait for the page to finish loading
   */
  async waitForLoading(): Promise<void> {
    await this.page.waitForSelector('[data-testid="loading-spinner"]', { state: 'hidden' });
  }

  /**
   * Get all flashcard items on the current page
   */
  async getAllFlashcardItems(): Promise<FlashcardItemPage[]> {
    // Czekamy na zakończenie ładowania
    await this.waitForLoading();
    
    // Czekamy na pojawienie się kontenera z fiszkami
    await this.page.waitForSelector('[data-testid="flashcards-list"]', { state: 'visible' });
    
    // Lokator dla wszystkich fiszek
    const flashcardElements = this.page.locator('[data-testid^="flashcard-item-"]');
    
    // Czekamy aż wszystkie elementy będą widoczne
    await flashcardElements.first().waitFor({ state: 'visible' }).catch(() => {
      // Jeśli nie ma żadnych elementów, zwracamy pustą tablicę
      return [];
    });
    
    const count = await flashcardElements.count();
    console.log(`Found ${count} flashcards`);
    
    const items: FlashcardItemPage[] = [];
    
    // Używamy Promise.all dla lepszej wydajności
    await Promise.all(
      Array.from({ length: count }, async (_, i) => {
        const element = flashcardElements.nth(i);
        // Sprawdzamy czy element jest widoczny
        if (await element.isVisible()) {
          const id = await element.getAttribute('data-testid');
          if (id) {
            const idNumber = parseInt(id.replace('flashcard-item-', ''), 10);
            items.push(new FlashcardItemPage(this.page, idNumber));
          }
        }
      })
    );
    
    return items;
  }

  /**
   * Get a specific flashcard by its ID
   */
  getFlashcardById(id: number): FlashcardItemPage {
    return new FlashcardItemPage(this.page, id);
  }

  /**
   * Search for flashcards with the given term
   */
  async searchFlashcards(term: string): Promise<void> {
    await this.searchAndPagination.search(term);
  }

  /**
   * Clear the search and reset to showing all flashcards
   */
  async clearSearch(): Promise<void> {
    await this.searchAndPagination.clearSearch();
    await this.waitForLoading();
  }

  /**
   * Go to a specific page in the pagination
   */
  async goToPage(pageNumber: number): Promise<void> {
    await this.searchAndPagination.goToPage(pageNumber);
    await this.waitForLoading();
  }
} 