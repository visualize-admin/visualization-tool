import { test, expect } from "./common";

test("tooltip content", async ({ actions, selectors, within, page }) => {
  test.slow();
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
    .findByText("Methane", undefined, { timeout: 10_000 });

  await actions.mui.selectOption("Methane");

  await selectors.chart.loaded();

  const chart = page.locator("[data-chart-loaded]");
  const xLabel = chart.locator('[data-index="6"]');

  await xLabel.hover({
    force: true,
  });

  const tooltip = page.locator('[data-testid="chart-tooltip"]');
  await tooltip.waitFor({
    state: "attached",
    timeout: 1000,
  });
  const textContent = await tooltip.textContent();
  expect(textContent).toEqual("19960.017 Mt");
});
