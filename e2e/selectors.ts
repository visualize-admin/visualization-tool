import { MatcherOptions, waitForOptions } from "@testing-library/dom";

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
          timeout: 10_000,
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
      left: () => screen.getByTestId("panel-body-L"),
      drawer: () => screen.getByTestId("panel-drawer"),
      middle: () => screen.getByTestId("panel-body-M"),
      metadata: () => screen.getByTestId("panel-metadata"),
    },
    edition: {
      configFilters: () =>
        screen.findByTestId("configurator-filters", undefined, {
          timeout: 20 * 1000,
        }),
      drawerLoaded: () =>
        screen.findByText(
          "Chart Type",
          { selector: "h6" },
          { timeout: 10_000 }
        ),
      chartFilters: () => screen.findByTestId("chart-filters-list"),
      filterDrawer: () => screen.findByTestId("edition-filters-drawer"),
      filterCheckbox: (value: string) =>
        page.locator(`[data-value="${value}"]`),
      chartTypeSelectorRegular: () =>
        screen.findByTestId("chart-type-selector-regular", undefined, {
          timeout: 10_000,
        }),
      chartTypeSelectorCombo: () =>
        screen.findByTestId("chart-type-selector-combo", undefined, {
          timeout: 10_000,
        }),
      filtersLoaded: () =>
        screen.findByText("Selected filters", undefined, { timeout: 10_000 }),
      controlSectionByTitle: (title: string) =>
        page.locator("[data-testid=controlSection]", {
          has: page.locator(`h6:text-is("${title}")`),
        }),
      dataFilterInput: (label: string) =>
        page.locator(`div[role="button"]:has-text("${label}")`),
      useAbbreviationsCheckbox: () =>
        screen
          .getByTestId("panel-drawer")
          .within()
          .findByText("Use abbreviations", {}, { timeout: 10_000 }),
    },
    published: {
      interactiveFilters: () =>
        screen.getByTestId("published-chart-interactive-filters"),
    },
    chart: {
      axisWidthBand: async () => screen.findByTestId("axis-width-band"),
      colorLegend: async (
        options?: MatcherOptions,
        waitForOptions?: waitForOptions
      ) => {
        // There can be multiple color legends for hierarchical dimensions.
        // Generally, we want the first one.
        const colorLegend = await screen.findAllByTestId(
          "colorLegend",
          options,
          waitForOptions
        );

        return colorLegend.first();
      },
      colorLegendItems: async () =>
        (await selectors.chart.colorLegend()).locator("div"),
      moreButton: () =>
        screen.findByTestId("chart-more-button", undefined, {
          timeout: 10_000,
        }),
      legendTicks: async () => {},
      loaded: async () => {
        await page.waitForLoadState("networkidle");
        // Let the map tiles fade in and enter animations finish
        await sleep(1_000);
      },
      screenshot: {
        png: async () => {
          return await screen.findByTestId("screenshot-png");
        },
      },
      tablePreviewSwitch: async () => {
        return await screen.findByText("Table view");
      },
      tabs: async () => {
        return await screen.findAllByTestId("chart-selection-tab");
      },
    },
  };
  return selectors;
};

export type Selectors = ReturnType<typeof createSelectors>;
