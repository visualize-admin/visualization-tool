import { setup } from "./common";

const { test } = setup();

test("Unversioned dataset > should be possible to open a link to an unversioned dataset", async ({
  page,
  actions,
}) => {
  await actions.datasetPreview.load({
    iri: "https://culture.ld.admin.ch/sfa/StateAccounts_Function",
    dataSource: "Int",
  });
  await page
    .getByText("State accounts - Function")
    .first()
    .waitFor({ timeout: 10 * 1000 });
});
