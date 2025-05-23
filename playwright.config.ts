import { defineConfig, devices } from "@playwright/test";
import path from "path";
import dotenv from "dotenv";
/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
dotenv.config({ path: path.resolve(process.cwd(), ".env.test") });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  /* Run tests in files in parallel */
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,

  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [["html"], ["list"]],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || "http://localhost:3000",

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",
    /* Capture screenshot on failure */
    screenshot: "only-on-failure",

    /* Viewport settings */
    viewport: {
      width: parseInt(process.env.PLAYWRIGHT_VIEWPORT_WIDTH || "1280"),
      height: parseInt(process.env.PLAYWRIGHT_VIEWPORT_HEIGHT || "720"),
    },

    /* Headless mode */
    headless: process.env.PLAYWRIGHT_HEADLESS === "true",
  },

  /* Configure projects for major browsers */
  projects: [
    {
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  /* Run local dev server before starting the tests */
  webServer: {
    command: "npm run astro dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
});
