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
    .waitFor({ timeout: 3000 });

const selectActiveEditorField = async (ctx: TestContext, field: string) => {
  (await selectors.panels.left(ctx)).locator(`button >> text=${field}`).click();
  return waitForPanelRightToLoad(ctx, field);
};

const actions = makeActions({
  datasetPreview: {
    load: loadDatasetPreview,
  },
  editor: {
    waitForPanelRightToLoad,
    selectActiveField: selectActiveEditorField,
  },
});

export default actions;
