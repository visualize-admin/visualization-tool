import { test } from "./common";

test("it should display values in interactive filters as hierarchie", async ({
  page,
  selectors,
  within,
}) => {
  await page.goto("/en/__test/int/bathing-water-quality-hierarchie");
  await selectors.chart.loaded();
  await page.locator('text="Show Filters"').click();
  await within(selectors.published.interactiveFilters())
    .getByText("Seerose")
    .click();
  await selectors.mui.popover().getByText("BAQUA_FR");
  await selectors.mui.popover().getByText("Nouvelle plage").click();
  await selectors.chart.loaded();
});
