import { loadChartInLocalStorage } from "./charts-utils";
import { setup, sleep } from "./common";
import testOrd507 from "./fixtures/test-ord-507-chart-config.json";

const { test, describe, expect } = setup();

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

  test("should be possible to only select table & map", async ({
    page,
    selectors,
  }) => {
    await loadChartInLocalStorage(page, key, config);
    page.goto(`/en/create/${key}`);

    await selectors.chart.loaded();

    const enabledButtons = await (
      await selectors.edition.chartTypeSelector()
    ).locator("button:not(.Mui-disabled)");

    expect(await enabledButtons.count()).toEqual(2);
  });

  test("should be possible to select ordinal measure as area color", async ({
    page,
    screen,
    selectors,
    actions,
    within,
  }) => {
    await loadChartInLocalStorage(page, key, config);
    page.goto(`/en/create/${key}`);

    await selectors.chart.loaded();

    await actions.editor.changeChartType("Map");

    await selectors.chart.loaded();

    await actions.editor.selectActiveField("Symbols");

    await selectors.chart.loaded();

    await within(selectors.edition.controlSection("Symbols"))
      .getByText("None")
      .click();

    // Select options open in portal
    await actions.mui.selectOption("area");

    // Allow select options to disappear to prevent re-selecting none
    await sleep(3000);

    // Chart needs to re-load when symbol layer is selected
    await selectors.chart.loaded();

    await within(selectors.edition.controlSection("Color"))
      .getByText("None")
      .click();

    const options = await selectors.mui.options();
    const dimensionLabels = await options.allInnerTexts();

    expect(dimensionLabels).toEqual(["None", "area", "ord1", "ord2", "ord3"]);
  });
});
