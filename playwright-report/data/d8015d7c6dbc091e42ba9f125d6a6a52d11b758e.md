# Test info

- Name: Home page >> should load the home page
- Location: C:\Users\bartosz.rolnik\Desktop\10xDevs\repo\10x-card-from-template\tests\e2e\pages\home.spec.ts:4:3

# Error details

```
Error: Timed out 5000ms waiting for expect(locator).toBeVisible()

Locator: getByRole('heading', { level: 1 })
Expected: visible
Received: <element(s) not found>
Call log:
  - expect.toBeVisible with timeout 5000ms
  - waiting for getByRole('heading', { level: 1 })

    at C:\Users\bartosz.rolnik\Desktop\10xDevs\repo\10x-card-from-template\tests\e2e\pages\home.spec.ts:9:59
```

# Page snapshot

```yaml
- main:
  - main:
    - text: Welcome back Enter your email and password to sign in to your account Email
    - textbox "Email"
    - text: Password
    - textbox "Password"
    - button "Sign in"
    - link "Forgot your password?":
      - /url: /forgot-password
    - text: Don't have an account?
    - link "Sign up":
      - /url: /register
- region "Notifications alt+T"
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | test.describe('Home page', () => {
   4 |   test('should load the home page', async ({ page }) => {
   5 |     await page.goto('/');
   6 |     
   7 |     // Example assertions
   8 |     await expect(page).toHaveTitle(/10x/);
>  9 |     await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
     |                                                           ^ Error: Timed out 5000ms waiting for expect(locator).toBeVisible()
  10 |   });
  11 |
  12 |   test('should have proper meta tags', async ({ page }) => {
  13 |     await page.goto('/');
  14 |     
  15 |     // Check meta description
  16 |     const metaDescription = page.locator('meta[name="description"]');
  17 |     await expect(metaDescription).toHaveAttribute('content', /./);
  18 |   });
  19 | }); 
```