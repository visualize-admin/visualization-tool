import { test, expect } from "./common";

test("tooltip content", async ({ actions, selectors, within, page }) => {
  await actions.chart.createFrom(
    "https://environment.ld.admin.ch/foen/ubd000502_sad_01/6",
    "Int"
  );

  const filterLocator = await within(
    selectors.edition.controlSection("Filters")
  );

  await filterLocator.getByText("All greenhouse gas").click();
  await selectors.mui
    .popover()
    .findByText("Synthetic gases", undefined, { timeout: 10_000 });

  await actions.mui.selectOption("Synthetic gases");

  await selectors.chart.loaded();

  const chart = page.locator("[data-chart-loaded]");
  const xLabel = chart.locator('[data-index="6"]');

  await xLabel.hover({
    force: true,
  });

  const tooltip = page.locator('[data-testid="chart-tooltip"]');
  await tooltip.waitFor();
  const textContent = await tooltip.textContent();
  expect(textContent).toEqual("1996-5.561 Mt");
});
