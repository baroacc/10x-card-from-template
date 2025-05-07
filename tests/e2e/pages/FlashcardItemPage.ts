import { type Page, type Locator, expect } from "@playwright/test";

export class FlashcardItemPage {
  readonly page: Page;
  readonly flashcardIndex: number;

  // Main container
  readonly flashcardItem: Locator;

  // View mode
  readonly viewModeContainer: Locator;
  readonly frontContent: Locator;
  readonly backContent: Locator;

  // Edit mode
  readonly editModeContainer: Locator;
  readonly frontEditTextarea: Locator;
  readonly backEditTextarea: Locator;
  readonly frontCharCount: Locator;
  readonly backCharCount: Locator;
  readonly editErrorMessage: Locator;

  // Badges
  readonly editedBadge: Locator;
  readonly acceptedBadge: Locator;

  // Buttons
  readonly editButton: Locator;
  readonly rejectButton: Locator;
  readonly acceptButton: Locator;
  readonly cancelEditButton: Locator;
  readonly saveEditButton: Locator;

  constructor(page: Page, flashcardIndex: number) {
    this.page = page;
    this.flashcardIndex = flashcardIndex;

    // Define the base selector for this specific flashcard
    const baseSelector = `flashcard-item-${flashcardIndex}`;

    // Initialize all locators using data-testid selectors
    this.flashcardItem = page.getByTestId(baseSelector);

    // View mode
    this.viewModeContainer = this.flashcardItem.getByTestId("view-mode-container");
    this.frontContent = this.flashcardItem.getByTestId("front-content");
    this.backContent = this.flashcardItem.getByTestId("back-content");

    // Edit mode
    this.editModeContainer = this.flashcardItem.getByTestId("edit-mode-container");
    this.frontEditTextarea = this.flashcardItem.getByTestId("front-edit-textarea");
    this.backEditTextarea = this.flashcardItem.getByTestId("back-edit-textarea");
    this.frontCharCount = this.flashcardItem.getByTestId("front-char-count");
    this.backCharCount = this.flashcardItem.getByTestId("back-char-count");
    this.editErrorMessage = this.flashcardItem.getByTestId("edit-error-message");

    // Badges
    this.editedBadge = this.flashcardItem.getByTestId("edited-badge");
    this.acceptedBadge = this.flashcardItem.getByTestId("accepted-badge");

    // Buttons
    this.editButton = this.flashcardItem.getByTestId("edit-button");
    this.rejectButton = this.flashcardItem.getByTestId("reject-button");
    this.acceptButton = this.flashcardItem.getByTestId("accept-button");
    this.cancelEditButton = this.flashcardItem.getByTestId("cancel-edit-button");
    this.saveEditButton = this.flashcardItem.getByTestId("save-edit-button");
  }

  // Actions
  async accept() {
    await this.acceptButton.click();
    await expect(this.acceptedBadge).toBeVisible();
  }

  async reject() {
    await this.rejectButton.click();
    // After rejection, this flashcard shouldn't be visible
    await expect(this.flashcardItem).not.toBeVisible();
  }

  async enterEditMode() {
    await this.editButton.click();
    await expect(this.editModeContainer).toBeVisible();
  }

  async cancelEdit() {
    await this.cancelEditButton.click();
    await expect(this.viewModeContainer).toBeVisible();
  }

  async editContent(front: string, back: string) {
    await this.enterEditMode();
    await this.frontEditTextarea.fill(front);
    await this.backEditTextarea.fill(back);
    await this.saveEditButton.click();
    // Should return to view mode after successful save
    await expect(this.viewModeContainer).toBeVisible();
  }

  // State checks
  async getFrontContent() {
    return await this.frontContent.textContent();
  }

  async getBackContent() {
    return await this.backContent.textContent();
  }

  async isAccepted() {
    return await this.acceptedBadge.isVisible();
  }

  async isEdited() {
    return await this.editedBadge.isVisible();
  }

  async getEditError() {
    if (await this.editErrorMessage.isVisible()) {
      return await this.editErrorMessage.textContent();
    }
    return null;
  }
}
