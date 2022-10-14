import selectors from "./selectors";
import { makeActions, TestContext } from "./types";

export const loadDatasetPreview = async (
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
  },
});

export default actions;
