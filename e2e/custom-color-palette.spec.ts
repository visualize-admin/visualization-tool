import { auth, setup } from "./common";
const { test, expect } = setup();
test("authenticated user can access protected page", async ({ page }) => {
  await page.goto("/en");
  await auth(page);
  await page.waitForLoadState("networkidle");

  await page.goto("/en/profile");

  await expect(page.url()).toBe("/en/profile");
});
