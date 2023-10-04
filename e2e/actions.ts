import { Selectors } from "./selectors";
import { TestContext } from "./types";

type ActionTestContext = TestContext & { selectors: Selectors };

const selectActiveEditorField =
  ({ selectors, within }: ActionTestContext) =>
  async (field: string) => {
    const fieldLocator = await within(
      selectors.edition.controlSection("Chart Options")
    ).findByText(field);
    await fieldLocator.click();
    await selectors.panels
      .drawer()
      .within()
      .findByText(field, undefined, { timeout: 3000 });
  };

export const createActions = ({
  page,
  screen,
  selectors,
  within,
}: TestContext & { selectors: Selectors }) => ({
  search: {
    clear: async () => await screen.getByTestId("clearSearch").click(),
  },
  datasetPreview: {
    load: async (iri: string, dataSource: "Int" | "Prod") => {
      await page.goto(
        `en/browse?dataset=${encodeURIComponent(iri)}&dataSource=${dataSource}`
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
    createFrom: async (
      iri: string,
      dataSource: "Int" | "Prod",
      chartLoadedOptions?: Parameters<typeof selectors.chart.loaded>[0]
    ) => {
      await page.goto(
        `en/create/new?cube=${encodeURIComponent(iri)}&dataSource=${dataSource}`
      );

      await selectors.chart.loaded(chartLoadedOptions);
    },
    switchToTableView: async () => {
      await (await selectors.chart.tablePreviewSwitch()).click();
    },
  },
  /** Actions on MUI elements, options, selects, dialogs */
  mui: {
    selectOption: async (optionText: string) => {
      const item = await await selectors.mui.popover().findByText(optionText);
      await item.click();
      const select = await item.locator("..").locator("text=Select");
      const count = await select.count();
      if (count) {
        await select.click();
      }
    },
  },
  editor: {
    changeChartType: async (
      type:
        | "Map"
        | "Table"
        | "Scatterplot"
        | "Pie"
        | "Lines"
        | "Areas"
        | "Columns"
    ) => {
      const btns = await selectors.edition.chartTypeSelectorRegular();
      await btns.locator("button", { hasText: type }).click();
    },
    selectActiveField: selectActiveEditorField({
      selectors,
      page,
      screen,
      within,
    }),
  },
  metadataPanel: {
    toggle: async () => {
      const toggleButton = await screen.findByTestId("panel-metadata-toggle");
      await toggleButton.click();
    },
  },
  drawer: {
    close: async () => await screen.locator('text="Back to main"').click(),
  },
  common: {
    switchLang: async (lang: "de" | "fr" | "en" | "it") => {
      await page.locator(`a[hreflang="${lang}"]`).click();
    },
  },
});

export type Actions = ReturnType<typeof createActions>;
