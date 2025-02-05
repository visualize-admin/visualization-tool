import { setup } from "./common";

const { expect, test } = setup();

test.skip("it should display values in interactive filters as hierarchie", async ({
  page,
  selectors,
  within,
}) => {
  await page.goto("/en/__test/int/bathing-water-quality-hierarchie");
  await selectors.chart.loaded();
  await page.locator('text="Show Filters"').click();
  const interactiveFilters = await within(
    selectors.published.interactiveFilters()
  );
  await page.locator("[value=Seerose]").click();
  await selectors.mui.popover().getByText("BAQUA_FR").click();
  await selectors.mui.popover().getByText("Nouvelle plage").click();
  await selectors.chart.loaded();
});

test("it should not initialize interactive time range filter in a broken state", async ({
  page,
  selectors,
}) => {
  await page.goto("/en/__test/prod/most-recent-time-range-interactive-filter");
  await selectors.chart.loaded();
  const chart = page.locator("#chart-svg");
  const [startHandle, endHandle] = await chart.locator(".handle").all();
  const startHandleBox = await startHandle.boundingBox();
  const endHandleBox = await endHandle.boundingBox();

  expect(endHandleBox.x).toBeGreaterThan(startHandleBox.x);
});
