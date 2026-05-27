import { Selectors } from "./selectors";
import { TestContext } from "./types";

type ActionTestContext = TestContext & { selectors: Selectors };

const selectActiveEditorField =
  ({ selectors }: ActionTestContext) =>
  async (field: string) => {
    const chartOptions =
      selectors.edition.controlSectionByTitle("Chart Options");
    await chartOptions.scrollIntoViewIfNeeded();
    const fieldLocator = chartOptions.getByText(field);
    await fieldLocator.waitFor({ timeout: 3000 });
    await fieldLocator.click();
    await selectors.panels
      .drawer()
      .getByText(field)
      .first()
      .waitFor({ timeout: 3000 });
  };

export const createActions = ({
  page,
  selectors,
}: TestContext & { selectors: Selectors }) => ({
  search: {
    clear: async () => await page.getByTestId("clearSearch").click(),
  },
  datasetPreview: {
    load: async ({
      iri,
      dataSource,
      urlParams,
    }: {
      iri: string;
      dataSource: "Int" | "Prod";
      urlParams?: string;
    }) => {
      await page.goto(
        `/en/browse?dataset=${encodeURIComponent(
          iri
        )}&dataSource=${dataSource}&${urlParams}`
      );

      await selectors.datasetPreview.loaded();
    },
    sortBy: (columnName: string) => {
      return page
        .locator(`th[role=columnheader]:has-text("${columnName}") svg`)
        .click();
    },
  },
  chart: {
    createFrom: async ({
      iri,
      dataSource,
      createURLParams,
    }: {
      iri: string;
      dataSource: "Int" | "Prod";
      createURLParams?: string;
    }) => {
      await page.goto(
        `/en/create/new?cube=${encodeURIComponent(
          iri
        )}&dataSource=${dataSource}&${createURLParams ?? ""}`
      );

      await selectors.chart.loaded();
    },
    switchToTableView: async () => {
      await selectors.chart.tablePreviewSwitch().click();
    },
  },
  /** Actions on MUI elements, options, selects, dialogs */
  mui: {
    selectOption: async (optionText: string) => {
      const item = selectors.mui.popover().getByText(optionText);
      await item.click();
      const select = item.locator("..").locator("text=Select");
      const count = await select.count();
      if (count) {
        await select.click();
      }
    },
  },
  editor: {
    changeRegularChartType: async (
      type:
        | "Columns"
        | "Bars"
        | "Lines"
        | "Areas"
        | "Scatterplot"
        | "Pie"
        | "Table"
        | "Map"
    ) => {
      const btns = await selectors.edition.chartTypeSelectorRegular();
      await btns.locator("button", { hasText: type }).click();
    },
    changeComboChartType: async (
      type: "Multi-line" | "Dual-axis line" | "Column-line"
    ) => {
      const btns = await selectors.edition.chartTypeSelectorCombo();
      await btns.locator("button", { hasText: type }).click();
    },
    selectActiveField: selectActiveEditorField({
      selectors,
      page,
    }),
  },
  metadataPanel: {
    toggle: async () => {
      await page.getByTestId("panel-metadata-toggle").click();
    },
  },
  drawer: {
    close: async () =>
      await page.locator('button[aria-label="Back to main"]').click(),
  },
  common: {
    switchLang: async (lang: "de" | "fr" | "en" | "it") => {
      await page.locator("div[id='localeSwitcherSelect']").click();
      await page.locator(`li[data-value="${lang}"]`).click();
    },
  },
});

export type Actions = ReturnType<typeof createActions>;
