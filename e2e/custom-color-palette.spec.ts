import { authenticate } from "./auth";
import { setup } from "./common";
const { test, expect } = setup();
test("authenticated user can access protected page", async ({
  page,
  screen,
}) => {
  // Add debug logging

  await page.goto("/en");

  await authenticate();
  await page.goto("/en/profile");
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  const signInBtn = page.locator('[data-testId="test-sign-in"]');
  await signInBtn.waitFor({ state: "visible", timeout: 5000 });

  await signInBtn.click();
  await page.waitForLoadState("networkidle");

  // await page.goto("/en/profile");

  await expect(page.url()).toBe("/en/profile");

  const colorPaletteTab = page.locator('[data-testId="color-palette-tab"]');
  await colorPaletteTab.waitFor({ state: "visible", timeout: 5000 });

  await colorPaletteTab.click();
  // ... rest of test
});
