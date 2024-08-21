import { test } from "@playwright/test";

// testAndSaveHar; `browsing-test.har`,

test("Browsing test @har", async ({ page }) => {
  await page.goto("https://visualize.admin.ch/v/hp0dOWAf-jSp");
});
