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
      .right()
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
        `en/browse/dataset/${encodeURIComponent(iri)}?dataSource=${dataSource}`
      );

      await selectors.datasetPreview.loaded();
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
  },
  /** Actions on MUI elements, options, selects, dialogs */
  mui: {
    selectOption: async (optionText: string) => {
      const locator = await selectors.mui.popover().findByText(optionText);
      await locator.click();
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
      const btns = await selectors.edition.chartTypeSelector();
      await btns.locator("button", { hasText: type }).click();
    },
    selectActiveField: selectActiveEditorField({
      selectors,
      page,
      screen,
      within,
    }),
  },
});

export type Actions = ReturnType<typeof createActions>;
