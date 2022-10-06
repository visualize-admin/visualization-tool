import selectors from "./selectors";
import { TestContext } from "./types";

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

const actions = {
  loadDatasetPreview,
};

export default actions;
