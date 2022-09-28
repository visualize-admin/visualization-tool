import { test } from "./common";

test("Unversioned dataset > should be possible to open a link to an unversioned dataset", async ({
  page,
  screen,
}) => {
  await page.goto(
    `/en/browse/dataset/https%3A%2F%2Fculture.ld.admin.ch%2Fsfa%2FStateAccounts_Function?dataSource=Int`
  );
  await screen.findByText("State accounts - Function", undefined, {
    timeout: 10 * 1000,
  });
});
