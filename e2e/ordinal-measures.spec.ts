import { loadChartInLocalStorage } from "./charts-utils";
import { setup, sleep } from "./common";
import forestFireDanger from "./fixtures/forest-fire-danger-chart-config.json";
import { harReplayGraphqlEndpointQueryParam } from "./har-utils";

const { test, describe, expect } = setup();

describe("viewing a dataset with only ordinal measures", () => {
  const key = "ePUgYyo622qS";
  const config = forestFireDanger;

  test("should retrieve dimension values properly", async ({
    selectors,
    actions,
    replayFromHAR,
  }) => {
    await replayFromHAR();
    await actions.datasetPreview.load({
      iri: config.dataSet,
      dataSource: "Int",
      urlParams: harReplayGraphqlEndpointQueryParam,
    });
    const cells = await selectors.datasetPreview.cells();
    const texts = await cells.allInnerTexts();
    expect(texts).not.toContain("NaN");
  });

  test("should be possible to only select table & map", async ({
    page,
    selectors,
    replayFromHAR,
  }) => {
    await replayFromHAR();
    await loadChartInLocalStorage(page, key, config);
    page.goto(`/en/create/${key}?${harReplayGraphqlEndpointQueryParam}`);

    await selectors.chart.loaded();
    await selectors.edition.drawerLoaded();

    const enabledButtons = await (
      await selectors.edition.chartTypeSelectorRegular()
    ).locator("button:not(.Mui-disabled)");

    expect(await enabledButtons.count()).toEqual(2);
  });

  test("should be possible to select ordinal measure as area color", async ({
    page,
    screen,
    selectors,
    actions,
    within,
    replayFromHAR,
  }) => {
    test.slow();

    await replayFromHAR();
    await loadChartInLocalStorage(page, key, config);
    page.goto(`/en/create/${key}?${harReplayGraphqlEndpointQueryParam}`);

    await selectors.chart.loaded();
    await selectors.edition.drawerLoaded();

    await actions.editor.changeRegularChartType("Map");

    await selectors.chart.loaded();

    await actions.editor.selectActiveField("Symbols");

    await selectors.chart.loaded();

    await within(selectors.edition.controlSectionByTitle("Symbols"))
      .getByLabelText("None")
      .click();

    // Select options open in portal
    await actions.mui.selectOption("Warning region");

    // Allow select options to disappear to prevent re-selecting none
    await sleep(3000);

    // Chart needs to re-load when symbol layer is selected
    await selectors.chart.loaded();

    await within(selectors.edition.controlSectionBySubtitle("Color"))
      .getByLabelText("None")
      .click();

    const options = await selectors.mui.options();
    const dimensionLabels = await options.allInnerTexts();

    expect(dimensionLabels).toEqual([
      "None",
      "Canton",
      "Danger ratings",
      "Warning region",
    ]);
  });
});
