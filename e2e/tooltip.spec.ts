import { test, expect } from "./common";

test("tooltip content", async ({ actions, selectors, within, page }) => {
  await actions.chart.createFrom(
    "https://environment.ld.admin.ch/foen/ubd000502test/3",
    "Int"
  );

  const filterLocator = await within(
    selectors.edition.controlSection("Filters")
  );
  await filterLocator.getByText("Balance of land use").click();

  await actions.mui.selectOption("Sectors Ordinance CO2");

  await filterLocator.getByText("Greenhouse gas").click();
  await actions.mui.selectOption("Synthetic gases");

  await selectors.chart.loaded();

  const chart = page.locator("[data-chart-loaded]");
  const xLabel = chart.locator('[data-index="4"]');

  await xLabel.hover({
    force: true,
  });

  const tooltip = page.locator('[data-testid="chart-tooltip"]');
  await tooltip.waitFor();
  const textContent = await tooltip.textContent();
  expect(textContent).toEqual("19940.2078843499898 Mt");
});
