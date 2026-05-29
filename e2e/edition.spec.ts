import { loadChartInLocalStorage } from "./charts-utils";
import { setup, sleep } from "./common";
import offentlicheAusgabenChartConfigFixture from "./fixtures/offentliche-ausgaben-chart-config.json";

const { expect, test } = setup();

// skipped due to probable issues with query for multiple cubes (see chart config)
test.skip("should be possible to edit filters of a hierarchy", async ({
  page,
  selectors,
}) => {
  const key = "WtHYbmsehQKo";
  const config = offentlicheAusgabenChartConfigFixture;
  await loadChartInLocalStorage(page, key, config);
  await page.goto(`/en/create/${key}`);
  await selectors.chart.loaded();

  await page
    .getByRole("button", { name: "Edit filters" })
    .click({ timeout: 5_000 });

  const filters = selectors.edition.filterDrawer();

  await filters.getByText("Economic affairs").click();
  await filters.getByText("Social protection").click();
  await filters.getByText("Health").click();
  await filters.getByText("Apply filters").click();

  await selectors.chart.loaded();
  const middlePanel = selectors.panels.middle();
  await middlePanel.evaluate((panel) => {
    panel.scrollTo(0, 200);
  });

  await sleep(2_000);
});

test("changing of locale shouldn't make the chart disappear", async ({
  page,
  actions,
  selectors,
}) => {
  await actions.chart.createFrom({
    iri: "https://environment.ld.admin.ch/foen/ubd000502/8",
    dataSource: "Prod",
  });
  await selectors.chart.loaded();
  await actions.editor.changeRegularChartType("Lines");
  await page.locator("div[id='localeSwitcherSelect']").click();
  await sleep(1_000);
  await page.locator('li[data-value="it"]').click();

  // Wait for chart to finish loading after locale change
  await page.waitForSelector('[data-chart-loaded="true"]');
  const chart = page.locator("[data-chart-loaded]");
  const chartPath = chart.locator("path[data-testid='chart-line']").first();
  const d = await chartPath.getAttribute("d");
  expect(d).not.toContain("NaN");
});
