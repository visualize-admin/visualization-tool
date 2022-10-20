import { TestContext as Ctx } from "./types";

/**
 * Creates a fixture for Playwright
 */
export const createSelectors = ({ screen, page, within }: Ctx) => {
  const selectors = {
    mui: {
      select: () => page.locator(".MuiSelect-select"),
      popover: () => within(page.locator(".MuiPopover-paper")),
      options: () => page.locator('li[role="option"]'),
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
      left: () => screen.getByTestId("panel-left"),
      right: () => screen.getByTestId("panel-right"),
      middle: () => screen.getByTestId("panel-middle"),
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
      filtersLoaded: () =>
        screen.findByText("Selected filters", undefined, { timeout: 5000 }),
      controlSection: (title: string) =>
        page.locator("[data-testid=controlSection]", {
          has: page.locator(`h5:text-is("${title}")`),
        }),
    },
    chart: {
      colorLegend: (options?, waitForOptions?) =>
        screen.findByTestId("colorLegend", options, waitForOptions),
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
