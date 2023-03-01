import { loadChartInLocalStorage } from "./charts-utils";
import { test, expect } from "./common";
import mapWaldflascheChartConfigFixture from "./fixtures/map-waldflasche-chart-config.json";

test("Selecting SymbolLayer colors> should be possible to select geo dimension and see a legend", async ({
  page,
  selectors,
  actions,
  within,
}) => {
  const key = "jky5IEw6poT3";
  const config = mapWaldflascheChartConfigFixture;
  await loadChartInLocalStorage(page, key, config);
  await page.goto(`/en/create/${key}`);

  await selectors.chart.loaded();
  await actions.editor.selectActiveField("Symbols");

  await within(selectors.edition.controlSection("Symbols"))
    .getByText("None")
    .click();

  // Select production region as origin for symbols
  await actions.mui.selectOption("Production region");

  await selectors.chart.loaded();

  await within(selectors.edition.controlSection("Color"))
    .getByText("None")
    .click();

  // Selects production region for color mapping
  await actions.mui.selectOption("Production region");

  const legendItems = await selectors.chart.colorLegendItems();
  expect(await legendItems.count()).toBe(6);
  const legendTexts = await legendItems.allTextContents();
  expect(legendTexts).toEqual([
    "Switzerland",
    "Jura",
    "Plateau",
    "Pre-Alps",
    "Alps",
    "Southern Alps",
  ]);
});
