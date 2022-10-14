import { TestContext as Ctx } from "./types";

/**
 * Creates a fixture for Playwright
 */
export const createSelectors = ({ screen, page, within }: Ctx) => {
  const selectors = {
    mui: {
      select: () => page.locator(".MuiSelect-select"),
      popover: () => within(page.locator(".MuiPopover-paper")),
    },
    search: {
      searchInput: () => page.locator("#datasetSearch"),
      draftsCheckbox: () => page.locator("#dataset-include-drafts"),
      navItem: () => screen.findByTestId("navItem"),
      navChip: () => screen.findByTestId("navChip"),
      resultsCount: () =>
        screen.findByTestId("search-results-count", undefined, {
          timeout: 5000,
        }),
    },
    datasetPreview: {
      loaded: () =>
        page
          .locator("table td")
          .first()
          .waitFor({ timeout: 20 * 1000 }),
      cells: () => page.locator("table td"),
    },
    panels: {
      left: () => screen.findByTestId("panel-left"),
      right: () => screen.findByTestId("panel-right"),
      middle: () => screen.findByTestId("panel-middle"),
    },
    edition: {
      configFilters: () =>
        screen.findByTestId("configurator-filters", undefined, {
          timeout: 20 * 1000,
        }),
      chartFilters: () => screen.findByTestId("chart-filters-list"),
      filterDrawer: () => screen.findByTestId("edition-filters-drawer"),
      filterCheckbox: (value: string) =>
        page.locator(`[data-value="${value}"]`),
      chartTypeSelector: () => screen.findByTestId("chart-type-selector"),
    },
    chart: {
      colorLegend: () => screen.findByTestId("colorLegend"),
      colorLegendItems: async () =>
        (await selectors.chart.colorLegend()).locator("div"),
      loaded: (options: { timeout?: number } = {}) =>
        page
          .locator(`[data-chart-loaded="true"]`)
          .waitFor({ timeout: 40 * 1000, ...options }),
    },
  };
  return selectors;
};

export type Selectors = ReturnType<typeof createSelectors>;
