import { makeSelectors, TestContext as Ctx } from "./types";

const selectors = makeSelectors({
  search: {
    searchInput: (ctx: Ctx) => ctx.page.locator("#datasetSearch"),
    draftsCheckbox: (ctx: Ctx) => ctx.page.locator("#dataset-include-drafts"),
    navItem: (ctx: Ctx) => ctx.screen.findByTestId("navItem"),
    navChip: (ctx: Ctx) => ctx.screen.findByTestId("navChip"),
    resultsCount: (ctx: Ctx) =>
      ctx.screen.findByTestId("search-results-count", undefined, {
        timeout: 5000,
      }),
  },
  datasetPreview: {
    loaded: (ctx: Ctx) =>
      ctx.page
        .locator("table td")
        .first()
        .waitFor({ timeout: 20 * 1000 }),
    cells: (ctx: Ctx) => ctx.page.locator("table td"),
  },
  panels: {
    left: (ctx: Ctx) => ctx.screen.findByTestId("panel-left"),
    right: (ctx: Ctx) => ctx.screen.findByTestId("panel-right"),
    middle: (ctx: Ctx) => ctx.screen.findByTestId("panel-middle"),
  },
  edition: {
    configFilters: (ctx: Ctx) =>
      ctx.screen.findByTestId("configurator-filters", undefined, {
        timeout: 20 * 1000,
      }),
    chartFilters: (ctx: Ctx) => ctx.screen.findByTestId("chart-filters-list"),
    filterDrawer: (ctx: Ctx) =>
      ctx.screen.findByTestId("edition-filters-drawer"),
    filterCheckbox: (ctx: Ctx, value: string) =>
      ctx.page.locator(`[data-value="${value}"]`),
    chartTypeSelector: (ctx: Ctx) =>
      ctx.screen.findByTestId("chart-type-selector"),
  },
  chart: {
    colorLegend: (ctx: Ctx) => ctx.screen.findByTestId("colorLegend"),
    loaded: (ctx: Ctx) =>
      ctx.page
        .locator(`[data-chart-loaded="true"]`)
        .waitFor({ timeout: 40 * 1000 }),
  },
});

export default selectors;
