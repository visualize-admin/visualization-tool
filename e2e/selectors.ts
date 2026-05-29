import { sleep } from "./common";
import { TestContext as Ctx } from "./types";

/**
 * Creates a fixture for Playwright
 */
export const createSelectors = ({ page }: Ctx) => {
  const selectors = {
    mui: {
      select: () => page.locator(".MuiSelect-select"),
      popover: () => page.locator(".MuiPopover-paper"),
      options: () => page.locator('li[role="option"]'),
    },
    search: {
      searchInput: () => page.getByTestId("datasetSearch"),
      draftsCheckbox: () => page.locator("#dataset-include-drafts"),
      datasetSort: () => page.getByTestId("datasetSort"),
      navItem: () => page.getByTestId("navItem"),
      navChip: () => page.getByTestId("navChip"),
      resultsCount: async () => {
        const loc = page.getByTestId("search-results-count");
        await loc.waitFor({ timeout: 10_000 });
        return loc;
      },
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
      left: () => page.getByTestId("panel-body-L"),
      drawer: () => page.getByTestId("panel-drawer"),
      middle: () => page.getByTestId("panel-body-M"),
      metadata: () => page.getByTestId("panel-metadata"),
    },
    edition: {
      configFilters: async () => {
        const loc = page.getByTestId("configurator-filters");
        await loc.waitFor({ timeout: 20 * 1000 });
        return loc;
      },
      drawerLoaded: async () => {
        await page
          .locator("h6", { hasText: "Chart Type" })
          .first()
          .waitFor({ timeout: 10_000 });
      },
      chartFilters: () => page.getByTestId("chart-filters-list"),
      filterDrawer: () => page.getByTestId("edition-filters-drawer"),
      filterCheckbox: (value: string) =>
        page.locator(`[data-value="${value}"]`),
      chartTypeSelectorRegular: async () => {
        const loc = page.getByTestId("chart-type-selector-regular");
        await loc.waitFor({ timeout: 10_000 });
        return loc;
      },
      chartTypeSelectorCombo: async () => {
        const loc = page.getByTestId("chart-type-selector-combo");
        await loc.waitFor({ timeout: 10_000 });
        return loc;
      },
      filtersLoaded: async () => {
        await page
          .getByText("Selected filters")
          .first()
          .waitFor({ timeout: 10_000 });
      },
      controlSectionByTitle: (title: string) =>
        page.locator("[data-testid=controlSection]", {
          has: page.locator(`h6:text-is("${title}")`),
        }),
      dataFilterInput: (label: string) =>
        page.locator(`div[role="button"]:has-text("${label}")`),
      useAbbreviationsCheckbox: async () => {
        const loc = page
          .getByTestId("panel-drawer")
          .getByText("Use abbreviations");
        await loc.waitFor({ timeout: 10_000 });
        return loc;
      },
    },
    published: {
      interactiveFilters: () =>
        page.getByTestId("published-chart-interactive-filters"),
    },
    chart: {
      axisWidthBand: () => page.getByTestId("axis-width-band"),
      colorLegend: async (waitForOptions?: { timeout?: number }) => {
        // There can be multiple color legends for hierarchical dimensions.
        // Generally, we want the first one.
        const colorLegend = page.getByTestId("colorLegend").first();
        if (waitForOptions) {
          await colorLegend.waitFor(waitForOptions);
        }
        return colorLegend;
      },
      colorLegendItems: async () =>
        (await selectors.chart.colorLegend()).locator("div"),
      moreButton: async () => {
        const loc = page.getByTestId("chart-more-button");
        await loc.waitFor({ timeout: 10_000 });
        return loc;
      },
      legendTicks: async () => {},
      loaded: async () => {
        await page.waitForSelector('[data-chart-loaded="true"]', {
          timeout: 30_000,
        });
        // Let the map tiles fade in and enter animations finish
        await sleep(1_000);
      },
      screenshot: {
        png: () => page.getByTestId("screenshot-png"),
      },
      tablePreviewSwitch: () => page.getByText("Table view"),
      tabs: () => page.getByTestId("chart-selection-tab"),
    },
  };
  return selectors;
};

export type Selectors = ReturnType<typeof createSelectors>;
