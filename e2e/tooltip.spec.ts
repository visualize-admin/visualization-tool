import { setup, sleep } from "./common";

const { test, expect } = setup();

test("tooltip content", async ({
  actions,
  selectors,
  within,
  page,
  replayFromHAR,
}) => {
  replayFromHAR({
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
