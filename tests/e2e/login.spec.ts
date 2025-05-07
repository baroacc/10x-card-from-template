/*import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';

test.describe('Login Page', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('Successfully login', async ({ page }) => {
    await loginPage.login(process.env.E2E_USERNAME || '', process.env.E2E_PASSWORD || '');
    await loginPage.waitForRedirectToGenerate();
  });
});*/
