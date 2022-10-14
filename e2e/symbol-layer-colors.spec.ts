import { within } from "@playwright-testing-library/test";

import { loadChartInLocalStorage } from "./charts-utils";
import { test, expect } from "./common";
import mapWaldflascheChartConfigFixture from "./fixtures/map-waldflasche-chart-config.json";

test("Selecting SymbolLayer colors> should be possible to select nominal dimension and see a legend", async ({
  page,
  screen,
  selectors,
  actions,
}) => {
  const key = "jky5IEw6poT3";
  const config = mapWaldflascheChartConfigFixture;
  await loadChartInLocalStorage(page, key, config);
  await page.goto(`/en/create/${key}`);

  await selectors.chart.loaded();
  await actions.editor.selectActiveField("Symbols");

  const panelRight = await selectors.panels.right();
  const selects = selectors.mui.select();

  const count = await selects.count();
  expect(count).toEqual(7);

  await (await within(panelRight).findByText("Show layer")).click();

  // chart needs to re-load when symbol layer is selected
  await selectors.chart.loaded();

  await (await within(panelRight).findByText("None")).click();

  // re-select preduction region for color mapping
  await actions.mui.selectOption("production region");

  const legendItems = (await selectors.chart.colorLegendItems())
  expect(await legendItems.count()).toBe(6);
  const legendTexts = await legendItems.allTextContents()
  expect(legendTexts).toEqual(['Alps', 'Jura', 'Plateau', 'Pre-Alps', 'Southern Alps', 'Switzerland'])
});
