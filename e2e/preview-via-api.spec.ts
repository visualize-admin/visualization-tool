import { setup } from "./common";

const { test } = setup();

test("should be possible to preview charts via API (iframe)", async ({
  page,
  selectors,
}) => {
  await page.goto("/en/_preview");
  await page.waitForSelector("iframe");
  const iframe = page.locator("iframe");
  const contentFrame = iframe.contentFrame();
  await selectors.chart.loaded();
  await contentFrame.locator("svg").first().waitFor({ timeout: 10_000 });
});
