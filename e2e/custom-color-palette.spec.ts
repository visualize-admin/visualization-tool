import { setupTestAuth } from "./auth";
import { setup } from "./common";
const { test, expect } = setup();
test("authenticated user can access protected page", async ({ page }) => {
  // Add debug logging
  page.on("console", (msg) => console.log(`Browser log: ${msg.text()}`));
  page.on("response", async (response) => {
    if (response.url().includes("/api/auth/session")) {
      console.log(`Auth session response: ${await response.text()}`);
    }
  });

  await setupTestAuth(page, {
    name: "Custom User",
    email: "custom@example.com",
    id: 1,
    sub: "custom-sub-id",
  });

  // Verify auth state
  const cookies = await page.context().cookies();
  console.log("Cookies after setup:", cookies);

  await page.goto("/en/profile");

  await expect(page.url()).toBe("/en/profile");

  const colorPaletteTab = page.locator('[data-testId="color-palette-tab"]');
  await colorPaletteTab.waitFor({ state: "visible", timeout: 5000 });

  await colorPaletteTab.click();
  // ... rest of test
});
