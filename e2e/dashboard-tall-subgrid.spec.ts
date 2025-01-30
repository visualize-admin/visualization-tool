import { setup } from "./common";

const { expect, test } = setup();

test("elements should be aligned with each other in tall dashboard's columns", async ({
  page,
  selectors,
}) => {
  await page.goto(`/en/__test/prod/dashboard-tall`);
  await selectors.chart.loaded();

  const chartTableWrappers = await page.locator(".table-preview-wrapper").all();
  const [_, secondChartTableWrapper, thirdChartTableWrapper] =
    chartTableWrappers;

  const secondChart = secondChartTableWrapper.locator("svg");
  const thirdChart = thirdChartTableWrapper.locator("svg");

  const secondChartBox = await secondChart.boundingBox();
  const thirdChartBox = await thirdChart.boundingBox();

  expect(secondChartBox.y).toEqual(thirdChartBox.y);
});
