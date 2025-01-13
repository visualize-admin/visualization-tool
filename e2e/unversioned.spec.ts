import { setup } from "./common";

const { test } = setup();

test("Unversioned dataset > should be possible to open a link to an unversioned dataset", async ({
  screen,
  actions,
}) => {
  await actions.datasetPreview.load({
    iri: "https://culture.ld.admin.ch/sfa/StateAccounts_Function",
    dataSource: "Int",
  });
  await screen.findAllByText("State accounts - Function", undefined, {
    timeout: 10 * 1000,
  });
});
