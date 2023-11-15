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

  const colorControlSection = within(
    selectors.edition.controlSectionBySubtitle("Color")
  );

  const filtersButton = await colorControlSection.findByRole("button", {
    name: "Edit filters",
  });
  await filtersButton.click();
  const filters = selectors.edition.filterDrawer().within();
  await (await filters.findByText("moderate danger")).click();
  await (await filters.findByText("Apply filters")).click();

  await selectors.chart.loaded();

  const filtersValueLocator = await colorControlSection.findAllByTestId(
    "chart-filters-value",
    undefined,
    {
      timeout: 3000,
    }
  );

  const texts = await filtersValueLocator.allTextContents();
  texts.forEach((d) => {
    // It's possible to override a color.
    expect(d).toContain("Open Color Picker");
  });

  expect(texts.length).toEqual(4);
});
