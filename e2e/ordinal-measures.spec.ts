import { loadChartInLocalStorage } from "./charts-utils";
import { test, expect, describe } from "./common";
import testOrd507 from "./fixtures/test-ord-507-chart-config.json";
import selectors from "./selectors";

describe("viewing a dataset with only ordinal measures", () => {
  const key = "ePUgYyo622qS";
  const config = testOrd507;

  test("should retrieve dimension values properly", async ({
    page,
    screen,
  }) => {
    const ctx = { page, screen };
    ctx.page.goto(
      `en/browse/dataset/${encodeURIComponent(config.dataSet)}?dataSource=Int`
    );

    await selectors.datasetPreview.loaded(ctx);
    const cells = await selectors.datasetPreview.cells(ctx);
    const texts = await cells.allInnerTexts();
    expect(texts).not.toContain("NaN");
  });

  test("should be possible to only select table chart", async ({
    page,
    screen,
  }) => {
    const ctx = { page, screen };
    await loadChartInLocalStorage(page, key, config);
    page.goto(`/en/create/${key}`);

    await selectors.chart.loaded(ctx);

    const enabledButtons = await (
      await selectors.edition.chartTypeSelector(ctx)
    ).locator("button:not(.Mui-disabled)");

    expect(await enabledButtons.count()).toEqual(1);
  });
});
