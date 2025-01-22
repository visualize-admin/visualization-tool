import { setup, sleep } from "./common";

const { test, expect } = setup();

test("should track GraphQL queries when in debug mode", async ({ page }) => {
  await page.goto("/en?flag__debug=true");
  await page.waitForLoadState("networkidle");

  const debugPanelToggle = await page.waitForSelector(
    "button[data-testid='debug-panel-toggle']"
  );
  await debugPanelToggle.click();

  // Wait for debug panel to load.
  await sleep(1000);

  const debugPanelAccordions = await page
    .locator("div[data-testid='debug-panel-accordion']")
    .all();
  expect(debugPanelAccordions.length).toBeGreaterThan(0);

  // Results should contain timings.
  for (const debugPanelAccordion of debugPanelAccordions) {
    const text = await debugPanelAccordion.textContent();
    expect(text).toMatch(/(\d+ms)/);
  }
});
