import { MatcherOptions } from "@testing-library/dom";
import { sleep } from "./common";
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
      searchInput: () => screen.getByTestId("datasetSearch"),
      draftsCheckbox: () => page.locator("#dataset-include-drafts"),
      datasetSort: () => screen.getByTestId("datasetSort"),
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
      headerCell: async (columnName: string) => {
        return await page.locator(
          `th[role=columnheader]:text("${columnName}")`
        );
      },
      columnCells: async (columnName: string) => {
        const headerCells = page.locator("th[role=columnheader]");
        const headerTexts = await headerCells.allInnerTexts();
        const columnIndex = headerTexts.findIndex((t) => t === columnName);
        return page
          .locator("tbody")
          .locator(`td:nth-child(${columnIndex + 1})`);
      },
    },
    panels: {
      left: () => screen.getByTestId("panel-left"),
      drawer: () => screen.getByTestId("panel-drawer"),
      middle: () => screen.getByTestId("panel-middle"),
      metadata: () => screen.getByTestId("panel-metadata"),
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
        screen.findByText("Selected filters", undefined, { timeout: 10_000 }),
      controlSection: (title: string) =>
        page.locator("[data-testid=controlSection]", {
          has: page.locator(`h5:text-is("${title}")`),
        }),
      dataFilterInput: (label: string) =>
        page.locator(`div[role="button"]:has-text("${label}")`),
      useAbbreviationsCheckbox: () =>
        screen
          .getByTestId("panel-drawer")
          .within()
          .findByText("Use abbreviations"),
    },
    published: {
      interactiveFilters: () =>
        screen.getByTestId("published-chart-interactive-filters"),
    },
    chart: {
      axisWidthBand: async () => screen.findByTestId("axis-width-band"),
      colorLegend: (
        options?: MatcherOptions,
        waitForOptions?: Parameters<typeof screen.findByTestId>[2]
      ) => screen.findByTestId("colorLegend", options, waitForOptions),
      colorLegendItems: async () =>
        (await selectors.chart.colorLegend()).locator("div"),
      legendTicks: async () => {},
      loaded: async (options: { timeout?: number } = {}) => {
        await page
          .locator(`[data-chart-loaded="true"]`)
          .waitFor({ timeout: 40 * 1000, ...options });
        const hasMap = (await page.locator("[data-map-loaded]").count()) > 0;
        if (hasMap) {
          await page.locator('[data-map-loaded="true"]');
          await sleep(500); // Waits for tile to fade in
        }
      },
      tablePreviewSwitch: async () => {
        return await screen.findByText("Switch to table view");
      },
    },
  };
  return selectors;
};

export type Selectors = ReturnType<typeof createSelectors>;
