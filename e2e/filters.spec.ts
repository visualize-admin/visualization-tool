import { test } from "./common";

test("Filters initial state should have hierarchy dimensions first and topmost value selected", async ({
  page,
  within,
  selectors,
}) => {
  await page.goto(
    `/en/create/new?cube=https://environment.ld.admin.ch/foen/nfi/49-19-44/cube/1&dataSource=Int`
  );
  await selectors.chart.loaded();

  const filters = await selectors.edition.configFilters();

  await within(filters).findByText("1. production region", undefined, {
    timeout: 30 * 1000,
  });
  await within(filters).findByText("2. stand structure");
  await within(filters).findByText("3. Inventory");
  await within(filters).findByText("4. evaluation type");
});
