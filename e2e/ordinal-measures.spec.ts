import { within } from "@playwright-testing-library/test";

import actions from "./actions";
import { loadChartInLocalStorage } from "./charts-utils";
import { test, expect, describe, sleep } from "./common";
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

    await actions.datasetPreview.load(ctx, config.dataSet, "Int");
    const cells = await selectors.datasetPreview.cells(ctx);
    const texts = await cells.allInnerTexts();
    expect(texts).not.toContain("NaN");
  });

  test("should be possible to only select table & map", async ({
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

    expect(await enabledButtons.count()).toEqual(2);
  });

  test("should be possible to select ordinal measure as area color", async ({
    page,
    screen,
  }) => {
    const ctx = { page, screen };
    await loadChartInLocalStorage(page, key, config);
    page.goto(`/en/create/${key}`);

    await selectors.chart.loaded(ctx);

    actions.editor.changeChartType(ctx, "Map");
    actions.editor.selectActiveField(ctx, "Symbols");

    const panelRight = await selectors.panels.right(ctx);
    await (await within(panelRight).findByText("None")).click();

    // Select options open in portal
    await screen.locator('li[role="option"]:has-text("area")').click();

    // allow select options to disappear to prevent re-selecting none
    await sleep(3000);
    // chart needs to re-load when symbol layer is selected
    await selectors.chart.loaded(ctx);

    // FIXME: second select is for color, should be handled better
    await (await panelRight.locator("text=None >> nth=1")).click();
    // re-select preduction region for color mapping
    const selects = await screen.locator('li[role="option"]');

    const expectedDimensions = ["ord1", "ord2", "ord3"];
    const dimensionLabels = await selects.allInnerTexts();

    expectedDimensions.forEach((d) => {
      expect(dimensionLabels).toContain(d);
    });
  });
});
