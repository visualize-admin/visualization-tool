import { Selectors } from "./selectors";
import { TestContext } from "./types";

type ActionTestContext = TestContext & { selectors: Selectors };

const selectActiveEditorField =
  ({ selectors }: ActionTestContext) =>
  async (field: string) => {
    const fieldLocator = await selectors.panels
      .left()
      .within()
      .findByText(`${field}`);
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
        `en/browse/create/new?cube=${encodeURIComponent(
          iri
        )}&dataSource=${dataSource}`
      );

      await selectors.chart.loaded(chartLoadedOptions);
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
