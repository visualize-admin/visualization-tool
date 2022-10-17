import { test, expect } from "./common";

test("Filters initial state should have hierarchy dimensions first and topmost value selected", async ({
  page,
  within,
  selectors,
}) => {
  await page.goto(
    `/en/create/new?cube=https://environment.ld.admin.ch/foen/nfi/49-19-44/cube/1&dataSource=Int`
  );
  await selectors.chart.loaded();

  const filters = await selectors.edition.controlSection('Filters');
  
  const label = await filters.locator('label').first().waitFor({ timeout: 30_000 })

  const labels =  filters.locator('label')

  const texts = await labels.allTextContents()
  expect(texts).toEqual([
    "1. production region",
    "2. stand structure",
    "3. Inventory",
    "4. evaluation type"
  ])
});
