import type { Locator, Page } from '@playwright/test';

/**
 * Page Object Model for the SearchAndPagination component
 * Provides methods to interact with search and pagination functionality
 */
export class SearchAndPaginationPage {
  readonly page: Page;
  
  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Get the container element
   */
  getContainer(): Locator {
    return this.page.locator('[data-testid="search-pagination-container"]');
  }

  /**
   * Get the search input field
   */
  getSearchInput(): Locator {
    return this.page.locator('[data-testid="search-input"]');
  }

  /**
   * Get the pagination component
   */
  getPagination(): Locator {
    return this.page.locator('[data-testid="pagination"]');
  }

  /**
   * Check if pagination is visible
   */
  async isPaginationVisible(): Promise<boolean> {
    return await this.getPagination().isVisible();
  }

  /**
   * Search for flashcards with the given term
   */
  async search(term: string): Promise<void> {
    await this.getSearchInput().fill(term);
    await this.page.waitForResponse(
      (response) => 
        response.url().includes('/api/flashcards') && 
        response.url().includes(`search=${encodeURIComponent(term)}`)
    );
    console.log("Search completed");
  }

  /**
   * Clear the search input
   */
  async clearSearch(): Promise<void> {
    await this.getSearchInput().clear();
    await this.page.waitForTimeout(350);
  }

  /**
   * Go to the next page
   */
  async goToNextPage(): Promise<void> {
    await this.page.locator('[data-testid="pagination-next"]').click();
  }

  /**
   * Go to the previous page
   */
  async goToPreviousPage(): Promise<void> {
    await this.page.locator('[data-testid="pagination-previous"]').click();
  }

  /**
   * Go to a specific page number
   */
  async goToPage(pageNumber: number): Promise<void> {
    await this.page.locator(`[data-testid="pagination-page-${pageNumber}"]`).click();
  }

  /**
   * Get the current active page number
   */
  async getCurrentPage(): Promise<number> {
    const activePageLocator = this.page.locator('[data-testid^="pagination-page-"][aria-current="page"]');
    const text = await activePageLocator.textContent();
    if (!text) {
      throw new Error('Could not determine current page number');
    }
    return parseInt(text.trim(), 10);
  }

  /**
   * Check if the next page button is disabled
   */
  async isNextPageDisabled(): Promise<boolean> {
    const nextButton = this.page.locator('[data-testid="pagination-next"]');
    const className = await nextButton.getAttribute('class') || '';
    return className.includes('pointer-events-none');
  }

  /**
   * Check if the previous page button is disabled
   */
  async isPreviousPageDisabled(): Promise<boolean> {
    const prevButton = this.page.locator('[data-testid="pagination-previous"]');
    const className = await prevButton.getAttribute('class') || '';
    return className.includes('pointer-events-none');
  }
} 