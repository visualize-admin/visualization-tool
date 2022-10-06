import { LocatorFixtures } from "@playwright-testing-library/test/fixture";

import { TestContext } from "./types";

type Screen = LocatorFixtures["screen"];

const selectors = {
  search: {
    searchInput: (ctx: TestContext) => ctx.page.locator("#datasetSearch"),
    draftsCheckbox: (ctx: TestContext) =>
      ctx.page.locator("#dataset-include-drafts"),
    navItem: (ctx: TestContext) => ctx.screen.findByTestId("navItem"),
    navChip: (ctx: TestContext) => ctx.screen.findByTestId("navChip"),
    resultsCount: (ctx: TestContext) =>
      ctx.screen.findByTestId("search-results-count", undefined, {
        timeout: 5000,
      }),
  },
  datasetPreview: {
    loaded: (ctx: TestContext) =>
      ctx.page
        .locator("table td")
        .first()
        .waitFor({ timeout: 20 * 1000 }),
    cells: (ctx: TestContext) => ctx.page.locator("table td"),
  },
  panels: {
    left: (ctx: TestContext) => ctx.screen.findByTestId("panel-left"),
    right: (ctx: TestContext) => ctx.screen.findByTestId("panel-right"),
    middle: (ctx: TestContext) => ctx.screen.findByTestId("panel-middle"),
  },
  edition: {
    configFilters: (ctx: TestContext) =>
      ctx.screen.findByTestId("configurator-filters", undefined, {
        timeout: 20 * 1000,
      }),
    chartFilters: (ctx: TestContext) =>
      ctx.screen.findByTestId("chart-filters-list"),
    filterDrawer: (ctx: TestContext) =>
      ctx.screen.findByTestId("edition-filters-drawer"),
    filterCheckbox: (ctx, value: string) =>
      ctx.page.locator(`[data-value="${value}"]`),
    chartTypeSelector: (ctx: TestContext) =>
      ctx.screen.findByTestId("chart-type-selector"),
  },
  chart: {
    colorLegend: (ctx: TestContext) => ctx.screen.findByTestId("colorLegend"),
    loaded: (ctx: TestContext) =>
      ctx.page
        .locator(`[data-chart-loaded="true"]`)
        .waitFor({ timeout: 40 * 1000 }),
  },
};

export default selectors;
