import { setup } from "./common";

const { test } = setup();

test("Unversioned dataset > should be possible to open a link to an unversioned dataset", async ({
  page,
  screen,
  actions,
}) => {
  await actions.datasetPreview.load(
    "https://culture.ld.admin.ch/sfa/StateAccounts_Function",
    "Int"
  );
  await screen.findAllByText("State accounts - Function", undefined, {
    timeout: 10 * 1000,
  });
});
