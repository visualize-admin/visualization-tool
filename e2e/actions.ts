import selectors from "./selectors";
import { makeActions, TestContext } from "./types";

const loadDatasetPreview = async (
  ctx: TestContext,
  iri: string,
  dataSource: "Int" | "Prod"
) => {
  const { page } = ctx;
  await page.goto(
    `en/browse/dataset/${encodeURIComponent(iri)}?dataSource=${dataSource}`
  );

  await selectors.datasetPreview.loaded(ctx);
};

const waitForPanelRightToLoad = async (ctx: TestContext, field: string) =>
  (await selectors.panels.right(ctx))
    .locator(`h5 >> text=${field}`)
    .waitFor({ timeout: 15000 });

const selectActiveEditorField = async (ctx: TestContext, field: string) => {
  await (await selectors.panels.left(ctx))
    .locator(`button >> text=${field}`)
    .click();
  return waitForPanelRightToLoad(ctx, field);
};

const actions = makeActions({
  datasetPreview: {
    load: loadDatasetPreview,
  },
  chart: {
    createFrom: async (
      ctx: TestContext,
      iri: string,
      dataSource: "Int" | "Prod",
      chartLoadedOptions?: Parameters<typeof selectors.chart.loaded>[1]
    ) => {
      const { page } = ctx;
      await page.goto(
        `en/browse/create/new?cube=${encodeURIComponent(
          iri
        )}&dataSource=${dataSource}`
      );

      await selectors.chart.loaded(ctx, chartLoadedOptions);
    },
  },
  editor: {
    changeChartType: async (
      ctx: TestContext,
      type:
        | "Map"
        | "Table"
        | "Scatterplot"
        | "Pie"
        | "Lines"
        | "Areas"
        | "Columns"
    ) => {
      const btns = await selectors.edition.chartTypeSelector(ctx);
      await btns.locator("button", { hasText: type }).click();
    },
    waitForPanelRightToLoad,
    selectActiveField: selectActiveEditorField,
  },
});

export default actions;
