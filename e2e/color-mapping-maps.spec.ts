import { loadChartInLocalStorage } from "./charts-utils";
import { setup } from "./common";
import forestFireDanger from "./fixtures/forest-fire-danger-chart-config.json";

const { test, expect } = setup();

test("should be possible to de-select options from color component in maps", async ({
  page,
  within,
  actions,
  selectors,
}) => {
  const key = "color-mapping-maps.spec";
  const config = forestFireDanger;
  await loadChartInLocalStorage(page, key, config);
  page.goto(`/en/create/${key}`);
  await selectors.edition.drawerLoaded();

  await selectors.chart.loaded();

  await actions.editor.changeChartType("Map");

  await selectors.chart.loaded();

  await actions.editor.selectActiveField("Areas");

  await selectors.chart.loaded();

  const filterControlSection = within(
    page.locator("[data-testid=chart-edition-multi-filters]", {
      has: page.locator(`h5:text-is("Filter")`),
    })
  );

  const filtersButton = await filterControlSection.findByRole("button", {
    name: "Edit filters",
  });
  await filtersButton.click();
  const filters = selectors.edition.filterDrawer().within();
  await (await filters.findByText("Canton of Zurich")).click();
  await (await filters.findByText("Apply filters")).click();

  await selectors.chart.loaded();
});
