import { setup } from "./common";

const { test, expect } = setup();

const DIMENSION_VALUE_UNDEFINED = "https://cube.link/Undefined";

test("should not have literal undefined values inside a table preview", async ({
  actions,
  selectors,
}) => {
  const iri =
    "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/13";

  await actions.datasetPreview.load({ iri, dataSource: "Int" });

  await selectors.datasetPreview.loaded();

  const cellsContents = await selectors.datasetPreview
    .cells()
    .allTextContents();

  expect(cellsContents).not.toContain(DIMENSION_VALUE_UNDEFINED);
});
