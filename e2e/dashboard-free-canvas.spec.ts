import { argosScreenshot } from "@argos-ci/playwright";

import { setup } from "./common";

const { expect, test } = setup();

test("charts should be rendered correctly in free canvas mode", async ({
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
