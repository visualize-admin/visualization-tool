import { setup } from "./common";

const { expect, test } = setup();

test("y labels should not overlap with other chart elements", async ({
  page,
  selectors,
}) => {
  page.setViewportSize({ width: 400, height: 600 });
  await page.goto(`/en/__test/prod/combo-line-dual`);
  await selectors.chart.loaded();

  const chart = page.locator(".table-preview-wrapper").first().locator("svg");

  const chartElements = await chart
    .locator(
      ":scope > :not([data-testid='axis-title-left'], [data-testid='axis-title-left'] *, [data-testid='axis-title-right'], [data-testid='axis-title-right'] *)"
    )
    .all();

  const firstLabel = chart.locator("[data-testid='axis-title-left']");
  const secondLabel = chart.locator("[data-testid='axis-title-right']");
  const firstLabelBox = await firstLabel.boundingBox();
  const secondLabelBox = await secondLabel.boundingBox();
  const firstLabelEndY = firstLabelBox.y + firstLabelBox.height;
  const secondLabelEndY = secondLabelBox.y + secondLabelBox.height;

  for (const element of chartElements) {
    const { y } = await element.boundingBox();
    expect(y).toBeGreaterThanOrEqual(firstLabelEndY);
    expect(y).toBeGreaterThanOrEqual(secondLabelEndY);
  }
});
