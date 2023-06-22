import { setup } from "./common";

const { test } = setup();

test("it should display values in interactive filters as hierarchie", async ({
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
