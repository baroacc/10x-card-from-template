import { type Page, type Locator, expect } from "@playwright/test";

export class TopbarPage {
  readonly page: Page;

  // Main container
  readonly header: Locator;

  // Navigation links
  readonly generateLink: Locator;
  readonly flashcardsLink: Locator;

  // User menu
  readonly userMenuTrigger: Locator;
  readonly userMenuContent: Locator;
  readonly userName: Locator;
  readonly userEmail: Locator;
  readonly profileMenuItem: Locator;
  readonly logoutMenuItem: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize all locators using data-testid selectors
    this.header = page.getByTestId("topbar");
    this.generateLink = page.getByTestId("generate-link");
    this.flashcardsLink = page.getByTestId("flashcards-link");
    this.userMenuTrigger = page.getByTestId("user-menu-trigger");
    this.userMenuContent = page.getByTestId("user-menu-content");
    this.userName = page.getByTestId("user-name");
    this.userEmail = page.getByTestId("user-email");
    this.profileMenuItem = page.getByTestId("profile-menu-item");
    this.logoutMenuItem = page.getByTestId("logout-menu-item");
  }

  // Navigation
  async navigateToGenerate() {
    await this.generateLink.click();
    await this.page.waitForURL("/generate", { timeout: 10000 });
  }

  async navigateToFlashcards() {
    await this.flashcardsLink.click();
    await this.page.waitForURL("/flashcard", { timeout: 10000 });
    await expect(this.page).toHaveURL("/flashcard");
  }

  // User menu actions
  async openUserMenu() {
    await this.userMenuTrigger.click();
    await expect(this.userMenuContent).toBeVisible({ timeout: 10000 });
  }

  async navigateToProfile() {
    await this.openUserMenu();
    await this.profileMenuItem.click();
    await this.page.waitForURL("/profile", { timeout: 10000 });
  }

  async logout() {
    await this.openUserMenu();
    await this.logoutMenuItem.click();
    await this.page.waitForURL("/login", { timeout: 10000 });
  }

  // Information retrieval
  async getUserInfo() {
    await this.openUserMenu();
    return {
      name: await this.userName.textContent(),
      email: await this.userEmail.textContent(),
    };
  }

  // Visibility checks
  async isVisible() {
    return await this.header.isVisible();
  }

  async isUserMenuVisible() {
    await this.openUserMenu();
    return await this.userMenuContent.isVisible();
  }
}
