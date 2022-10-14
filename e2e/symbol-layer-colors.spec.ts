import { within } from "@playwright-testing-library/test";

import { loadChartInLocalStorage } from "./charts-utils";
import { test, expect, sleep } from "./common";
import mapWaldflascheChartConfigFixture from "./fixtures/map-waldflasche-chart-config.json";
import selectors from "./selectors";

test("Selecting SymbolLayer colors> should be possible to select geo dimension and see a legend", async ({
  page,
  screen,
}) => {
  const ctx = { page, screen };

  const key = "jky5IEw6poT3";
  const config = mapWaldflascheChartConfigFixture;
  await loadChartInLocalStorage(page, key, config);
  await page.goto(`/en/create/${key}`);

  await selectors.chart.loaded(ctx);

  await (
    await screen.findByText("Symbols", undefined, { timeout: 15000 })
  ).click();

  const selects = await (
    await selectors.panels.right(ctx)
  ).locator(".MuiSelect-select");

  const count = await selects.count();
  expect(count).toEqual(1);

  const panelRight = await selectors.panels.right(ctx);
  await (await within(panelRight).findByText("None")).click();
  // Select options open in portal
  await screen
    .locator('li[role="option"]:has-text("production region")')
    .click();

  // allow select options to disappear to prevent re-selecting none
  await sleep(3000);
  // chart needs to re-load when symbol layer is selected
  await selectors.chart.loaded(ctx);

  await (await within(panelRight).findByText("None")).click();
  // re-select preduction region for color mapping
  await screen
    .locator('li[role="option"]:has-text("production region")')
    .click();

  expect(
    await (await selectors.chart.colorLegend(ctx)).locator("div").count()
  ).toBe(6);
});
