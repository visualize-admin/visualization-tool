import { loadChartInLocalStorage } from "./charts-utils";
import { test, expect, describe, sleep } from "./common";
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
    within
  }) => {
    const ctx = { page, screen };
    await loadChartInLocalStorage(page, key, config);
    page.goto(`/en/create/${key}`);

    await selectors.chart.loaded();

    await actions.editor.changeChartType( "Map");
    await actions.editor.selectActiveField( "Symbols");

    await selectors.chart.loaded();


    const panelRight = await selectors.panels.right();
    await within(selectors.edition.controlSection('Symbols')).getByText("None").click();

    // Select options open in portal
    await actions.mui.selectOption('area');

    // Allow select options to disappear to prevent re-selecting none
    await sleep(3000);

    // Chart needs to re-load when symbol layer is selected
    await selectors.chart.loaded();

    // FIXME: second select is for color, should be handled better
    await panelRight.locator("text=None >> nth=1").click();

    // Re-select production region for color mapping
    const selects = await screen.locator('li[role="option"]');

    const expectedDimensions = ["ord1", "ord2", "ord3"];
    const dimensionLabels = await selects.allInnerTexts();

    expect(expectedDimensions).toEqual(['ord1', 'ord2', 'ord3']);
  });
});
