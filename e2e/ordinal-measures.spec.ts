import { loadChartInLocalStorage } from "./charts-utils";
import { test, expect, describe } from "./common";
import testOrd507 from "./fixtures/test-ord-507-chart-config.json";
import selectors from "./selectors";

describe.only("viewing a dataset with only ordinal measures", () => {
  const key = "ePUgYyo622qS";
  const config = testOrd507;

  test.only("should retrieve dimension values properly", async ({
    screen,
    page,
  }) => {
    page.goto(
      `en/browse/dataset/${encodeURIComponent(config.dataSet)}?dataSource=Int`
    );

    await selectors.datasetPreview.loaded(screen, page);
    const cells = await selectors.datasetPreview.cells(screen, page);
    const texts = await cells.allInnerTexts();
    expect(texts).not.toContain("NaN");
  });

  test.only("should be possible to only select table chart", async ({
    page,
    screen,
  }) => {
    await loadChartInLocalStorage(page, key, config);
    page.goto(`/en/create/${key}`);

    await selectors.chart.loaded(screen, page);

    const enabledButtons = await (
      await selectors.edition.chartTypeSelector(screen)
    ).locator("button:not(.Mui-disabled)");

    expect(await enabledButtons.count()).toEqual(1);
  });
});
