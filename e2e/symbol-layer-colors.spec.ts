import { loadChartInLocalStorage } from "./charts-utils";
import { setup } from "./common";
import configuratorState from "./fixtures/map-nfi-chart-config.json";

const { test, expect } = setup();

// FIX: works locally, sometimes fails in CI
test.skip("Selecting SymbolLayer colors > should be possible to select geo dimension and see a legend", async ({
  page,
  selectors,
  actions,
  within,
}) => {
  const key = "jky5IEw6poT3";
  await loadChartInLocalStorage(page, key, configuratorState);
  await page.goto(`/en/create/${key}`);
  await selectors.edition.drawerLoaded();

  await selectors.chart.loaded();

  await within(selectors.edition.controlSectionByTitle("Color"))
    .getByLabelText("None")
    .click();

  await actions.mui.selectOption("Region");

  const legendItems = await selectors.chart.colorLegendItems();
  expect(await legendItems.count()).toBe(51);
  const legendTexts = await legendItems.allTextContents();
  expect(legendTexts[0]).toEqual("Jura + Plateau");
  expect(legendTexts[1]).toEqual("Western Jura");
  expect(legendTexts[legendTexts.length - 1]).toEqual("Jura");
});
