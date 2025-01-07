import { argosScreenshot } from "@argos-ci/playwright";

import { loadChartInLocalStorage } from "./charts-utils";
import { setup, sleep } from "./common";
import offentlicheAusgabenChartConfigFixture from "./fixtures/offentliche-ausgaben-chart-config.json";

const { test } = setup();

test("should be possible to edit filters of a hierarchy", async ({
  page,
  screen,
  selectors,
}) => {
  const key = "WtHYbmsehQKo";
  const config = offentlicheAusgabenChartConfigFixture;
  await loadChartInLocalStorage(page, key, config);
  await page.goto(`/en/create/${key}`);
  await selectors.chart.loaded();

  (
    await screen.findByText(
      "Edit filters",
      { selector: "button" },
      { timeout: 5_000 }
    )
  ).click();

  const filters = selectors.edition.filterDrawer().within();

  await (await filters.findByText("Economic affairs")).click();
  await (await filters.findByText("Social protection")).click();
  await (await filters.findByText("Health")).click();
  await (await filters.findByText("Apply filters")).click();

  await selectors.chart.loaded();
  const middlePanel = await selectors.panels.middle();
  await middlePanel.evaluate((panel) => {
    panel.scrollTo(0, 200);
  });

  await sleep(2_000);
  await argosScreenshot(page, `chart-edition-${key}`, {
    element: "[data-testid='panel-middle']",
  });
});
