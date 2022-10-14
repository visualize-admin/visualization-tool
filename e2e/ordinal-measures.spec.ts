import { loadChartInLocalStorage } from "./charts-utils";
import { test, expect, describe } from "./common";
import testOrd507 from "./fixtures/test-ord-507-chart-config.json";

describe("viewing a dataset with only ordinal measures", () => {
  const key = "ePUgYyo622qS";
  const config = testOrd507;

  test("should retrieve dimension values properly", async ({
    selectors,
    actions,
  }) => {
    await actions.datasetPreview.load(config.dataSet, "Int");
    const cells = await selectors.datasetPreview.cells();
    const texts = await cells.allInnerTexts();
    expect(texts).not.toContain("NaN");
  });

  test("should be possible to only select table chart", async ({
    page,
    selectors,
  }) => {
    await loadChartInLocalStorage(page, key, config);
    page.goto(`/en/create/${key}`);

    await selectors.chart.loaded();

    const enabledButtons = await (
      await selectors.edition.chartTypeSelector()
    ).locator("button:not(.Mui-disabled)");

    expect(await enabledButtons.count()).toEqual(1);
  });
});
