import { argosScreenshot } from "@argos-ci/playwright";

import CONFIGURATOR_STATE_DASHBOARD_FREE_CANVAS from "../app/test/__fixtures/config/prod/dashboard-free-canvas.json";

import { loadChartInLocalStorage } from "./charts-utils";
import { setup } from "./common";

const { expect, test } = setup();

test("charts should be rendered correctly in free canvas mode when published", async ({
  page,
  selectors,
}) => {
  await page.goto(`/en/__test/prod/dashboard-free-canvas`);
  await selectors.chart.loaded();

  const chartTableWrappers = await page.locator(".table-preview-wrapper").all();
  const [
    firstChartTableWrapper,
    secondChartTableWrapper,
    thirdChartTableWrapper,
  ] = chartTableWrappers;

  const firstChart = firstChartTableWrapper.locator("svg");
  const secondChart = secondChartTableWrapper.locator("svg");
  const thirdChart = thirdChartTableWrapper.locator("svg");

  const firstChartBox = await firstChart.boundingBox();
  const secondChartBox = await secondChart.boundingBox();
  const thirdChartBox = await thirdChart.boundingBox();

  await argosScreenshot(page, "dashboard-free-canvas");

  expect(firstChartBox.y).toEqual(secondChartBox.y);
  expect(secondChartBox.y).toEqual(thirdChartBox.y);
});

test("charts should be rendered correctly in free canvas mode when editing", async ({
  page,
  selectors,
}) => {
  const key = "dashboard-free-canvas";
  const config = {
    ...CONFIGURATOR_STATE_DASHBOARD_FREE_CANVAS.data,
    state: "CONFIGURING_CHART",
  };
  await loadChartInLocalStorage(page, key, config);
  await page.goto(`/en/create/${key}`);
  await selectors.chart.loaded();

  const addChartButton = page.locator("button:has-text('Add chart')");
  const addChartButtonBox = await addChartButton.boundingBox();

  const chart = page.locator("#chart-svg");
  const chartBox = await chart.boundingBox();

  if (!chartBox) {
    throw new Error("Chart box not found");
  }

  // Add chart button should be above the chart.
  expect(addChartButtonBox.y).toBeLessThan(chartBox.y);

  const middlePanel = page.locator("[data-testid=panel-body-M]");
  const middlePanelBox = await middlePanel.boundingBox();

  if (!middlePanelBox) {
    throw new Error("Middle panel box not found");
  }

  // Chart should occupy full available space. In the past we had a bug where
  // the chart was much smaller than the available space (middle panel width).
  expect(chartBox.width).toBeGreaterThan(middlePanelBox.width * 0.8);

  await argosScreenshot(page, "dashboard-free-canvas-editing");
});
