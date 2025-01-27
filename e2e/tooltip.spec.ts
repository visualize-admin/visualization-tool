import { setup, sleep } from "./common";

const { test, expect } = setup();

test("should have correct tooltip content", async ({
  actions,
  selectors,
  within,
  page,
  replayFromHAR,
}) => {
  await replayFromHAR({
    update: true,
  });
  await actions.chart.createFrom({
    iri: "https://environment.ld.admin.ch/foen/ubd000502/4",
    dataSource: "Prod",
  });

  await selectors.edition.drawerLoaded();

  const filterLocator = await within(
    selectors.edition.controlSectionBySubtitle("Filters")
  );

  await filterLocator
    .getByRole("textbox", { name: "2. Greenhouse gas" })
    .click();

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

  await sleep(3_000);

  const tooltip = page.locator('[data-testid="chart-tooltip"]');
  await tooltip.waitFor({
    state: "attached",
    timeout: 1_000,
  });
  const textContent = await tooltip.textContent();
  expect(textContent?.startsWith("1996")).toBe(true);
});

test("should keep correct position after scrolling", async ({
  page,
  actions,
}) => {
  await actions.chart.createFrom({
    iri: "https://agriculture.ld.admin.ch/foag/cube/MilkDairyProducts/Consumption_Price_Month",
    dataSource: "Prod",
    createURLParams: "flag__enable-experimental-features=true",
  });
  await actions.editor.changeRegularChartType("Bars");
  const chart = page.locator("[data-chart-loaded]");
  const chartBbox = await chart.boundingBox();
  const rect0 = chart.locator('[data-index="0"]');
  await rect0.hover({ force: true });
  await sleep(3_000);
  const rect50 = chart.locator('[data-index="50"]');
  await rect50.hover({ force: true });
  await sleep(3_000);
  const tooltip = page.locator('[data-testid="chart-tooltip"]');
  await tooltip.waitFor({ state: "attached", timeout: 1_000 });
  const tooltipRect = await tooltip.boundingBox();

  if (!chartBbox || !tooltipRect) {
    throw new Error("Bounding box not found!");
  }

  expect(tooltipRect.x).toBeGreaterThanOrEqual(chartBbox.x);
  expect(tooltipRect.x).toBeLessThanOrEqual(chartBbox.x + chartBbox.width);
  expect(tooltipRect.y).toBeGreaterThanOrEqual(chartBbox.y);
  expect(tooltipRect.y).toBeLessThanOrEqual(chartBbox.y + chartBbox.height);
});
