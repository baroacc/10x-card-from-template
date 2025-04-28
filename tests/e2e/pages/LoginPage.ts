import { type Page, type Locator, expect } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  
  // Main container and form
  readonly formContainer: Locator;
  readonly loginForm: Locator;
  
  // Form inputs
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  
  // Messages and validation
  readonly welcomeMessage: Locator;
  readonly errorMessage: Locator;
  readonly emailError: Locator;
  readonly passwordError: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Initialize all locators using data-testid selectors
    this.formContainer = page.getByTestId('login-form-container');
    this.loginForm = page.getByTestId('login-form');
    this.emailInput = page.getByTestId('email-input');
    this.passwordInput = page.getByTestId('password-input');
    this.submitButton = page.getByTestId('submit-button');
    this.welcomeMessage = page.getByTestId('welcome-message');
    this.errorMessage = page.getByTestId('error-message');
    this.emailError = page.getByTestId('email-error');
    this.passwordError = page.getByTestId('password-error');
  }

  // Navigation
  async goto() {
    await this.page.goto('/login');
    await expect(this.formContainer).toBeVisible();
    await this.page.waitForResponse(response => 
        response.url().includes('/api/auth/me'), 
        { timeout: 5000 }
    );
  }

  // Actions
  async fillLoginForm(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
  }

  async submitForm() {
    await this.submitButton.click();
    await this.waitForRedirectToGenerate();
  }

  async login(email: string, password: string) {
    await this.fillLoginForm(email, password);
    await this.submitForm();
  }

  // State checks
  async isWelcomeMessageVisible() {
    return await this.welcomeMessage.isVisible();
  }

  async getErrorMessage() {
    return await this.errorMessage.isVisible() ? 
      await this.errorMessage.textContent() : 
      null;
  }

  async getValidationErrors() {
    return {
      email: await this.emailError.isVisible() ? 
        await this.emailError.textContent() : 
        null,
      password: await this.passwordError.isVisible() ? 
        await this.passwordError.textContent() : 
        null
    };
  }

  async waitForRedirectToGenerate() {
    await this.page.waitForURL('/generate', { timeout: 1000 });
  }
} 