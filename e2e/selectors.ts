import { LocatorFixtures } from "@playwright-testing-library/test/fixture";
import { Page } from "@playwright/test";

type Screen = LocatorFixtures["screen"];

const selectors = {
  search: {
    searchInput: (_sc: Screen, page: Page) => page.locator("#datasetSearch"),
    draftsCheckbox: (_sc: Screen, page: Page) =>
      page.locator("#dataset-include-drafts"),
    navItem: (sc: Screen) => sc.findByTestId("navItem"),
    navChip: (sc: Screen) => sc.findByTestId("navChip"),
    resultsCount: (sc: Screen) =>
      sc.findByTestId("search-results-count", undefined, { timeout: 5000 }),
  },
  panels: {
    left: (sc: Screen) => sc.findByTestId("panel-left"),
    right: (sc: Screen) => sc.findByTestId("panel-right"),
    middle: (sc: Screen) => sc.findByTestId("panel-middle"),
  },
  edition: {
    configFilters: (sc: Screen) =>
      sc.findByTestId("configurator-filters", undefined, {
        timeout: 20 * 1000,
      }),
    chartFilters: (sc: Screen) => sc.findByTestId("chart-filters-list"),
    filterDrawer: (sc: Screen) => sc.findByTestId("edition-filters-drawer"),
    filterCheckbox: (_sc: Screen, page: Page, value: string) =>
      page.locator(`[data-value="${value}"]`),
  },
  chart: {
    colorLegend: (sc: Screen) => sc.findByTestId("colorLegend"),
    loaded: (_sc: Screen, page: Page) =>
      page.locator(`[data-chart-loaded="true"]`).waitFor({ timeout: 20000 }),
  },
};

export default selectors;
