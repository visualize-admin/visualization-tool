import { loadChartInLocalStorage } from "./charts-utils";
import { setup, sleep } from "./common";
import hierarchyTest13 from "./fixtures/hierarchy-test-13-municipality-population.json";
import { harReplayGraphqlEndpointQueryParam } from "./har-utils";

const { test, expect } = setup();

/**
 * - Creates a chart from the photovoltaik dataset
 * - For each type of chart, changes the sorting between Name and Automatic
 * - Checks that the legend item order is coherent.
 */
test("Segment sorting", async ({
  selectors,
  actions,
  within,
  screen,
  replayFromHAR,
}) => {
  test.setTimeout(60_000);

  await replayFromHAR();

  await actions.chart.createFrom({
    iri: "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/10",
    dataSource: "Prod",
    createURLParams: harReplayGraphqlEndpointQueryParam,
  });

  for (const chartType of ["Columns", "Pie"] as const) {
    await selectors.edition.drawerLoaded();
    await actions.editor.changeRegularChartType(chartType);
    await actions.editor.selectActiveField("Segmentation");

    // Switch color on the first chart
    if (chartType === "Columns") {
      await within(selectors.edition.controlSectionByTitle("Segmentation"))
        .getByLabelText("None")
        .click();

      await actions.mui.selectOption("Kanton");
    }

    await selectors.chart.loaded();
    await selectors.edition.filtersLoaded();
    await selectors.chart.colorLegend(undefined, { timeout: 5_000 });

    const legendItems = await selectors.chart.colorLegendItems();
    const legendTexts = await legendItems.allInnerTexts();
    expect(legendTexts[0]).toEqual("Zurich");

    await within(selectors.edition.controlSectionBySubtitle("Sort"))
      .getByText("Automatic")
      .click();

    await actions.mui.selectOption("Name");

    await selectors.chart.loaded();
    await selectors.edition.filtersLoaded();

    const legendTexts2 = await legendItems.allInnerTexts();
    expect(legendTexts2[0]).toBe("Aargau");
    await screen.getByText("Z → A").click();

    const legendTexts3 = await legendItems.allInnerTexts();
    expect(legendTexts3[0]).toEqual("Zurich");

    // Re-initialize for future tests
    await screen.getByText("A → Z").click();

    await within(selectors.edition.controlSectionBySubtitle("Sort"))
      .getByRole("button", { name: "Name" })
      .click();

    await actions.mui.selectOption("Automatic");

    await actions.drawer.close();
  }
  expect(true).toBe(true);
});

test("Segment sorting with hierarchy", async ({
  actions,
  selectors,
  screen,
  within,
  replayFromHAR,
}) => {
  await replayFromHAR();

  await actions.chart.createFrom({
    iri: "https://environment.ld.admin.ch/foen/nfi/nfi_T-changes/cube/2024-1",
    dataSource: "Prod",
    createURLParams: harReplayGraphqlEndpointQueryParam,
  });

  await selectors.edition.drawerLoaded();
  await actions.editor.selectActiveField("Segmentation");

  await sleep(3_000);

  const colorSection = selectors.edition.controlSectionByTitle("Segmentation");
  await within(colorSection).getByLabelText("None").click();

  await actions.mui.selectOption("Region");
  await selectors.chart.loaded();

  await selectors.edition.filtersLoaded();
  await selectors.chart.colorLegend(undefined, { timeout: 30_000 });

  await within(await selectors.chart.colorLegend()).findByText(
    "Appenzell Innerrhoden",
    undefined,
    { timeout: 10_000 }
  );

  const legendItems = await selectors.chart.colorLegendItems();

  const expectedLegendItems = [
    "Jura",
    "Jura + Plateau",
    "Western Jura",
    "Zurich",
    "Bern",
    "Eastern Jura",
    "Northwestern Alps",
    "Plateau",
    "Lucerne",
    "Northeastern Alps",
    "Pre-Alps",
    "Western Plateau",
    "Alps",
    "Central Plateau",
    "Southwestern Alps",
    "Uri",
    "Eastern Plateau",
    "Schwyz",
    "Southeastern Alps",
    "Southern Alps",
    "Obwalden",
    "Southern Alps",
    "Western Pre-Alps",
    "Central Pre-Alps",
    "Nidwalden",
    "Eastern Pre-Alps",
    "Glarus",
    "Northwestern Alps",
    "Zug",
    "Central Alps",
    "Fribourg",
    "Northeastern Alps",
    "Solothurn",
    "Southwestern Alps",
    "Southeastern Alps",
    "both Basel",
    "Schaffhausen",
    "Southern Alps",
    "Appenzell Ausserrhoden",
    "Appenzell Innerrhoden",
    "St Gallen",
    "Grisons",
    "Aargau",
    "Thurgau",
    "Ticino",
    "Vaud",
    "Valais",
    "Neuchâtel",
    "Geneva",
    "Jura",
  ];

  expect(await legendItems.allInnerTexts()).toEqual(expectedLegendItems);

  await screen.getByText("Z → A").click();
  expect(await legendItems.allInnerTexts()).toEqual(
    [...expectedLegendItems].reverse()
  );
});

test.skip("Map legend preview table sorting", async ({
  actions,
  selectors,
  replayFromHAR,
}) => {
  await replayFromHAR();
  await actions.chart.createFrom({
    iri: "https://environment.ld.admin.ch/foen/gefahren-waldbrand-warnung/1",
    dataSource: "Int",
    createURLParams: harReplayGraphqlEndpointQueryParam,
  });
  await selectors.edition.drawerLoaded();

  await actions.editor.changeRegularChartType("Map");
  await selectors.chart.loaded();

  await actions.chart.switchToTableView();
  await actions.datasetPreview.sortBy("Danger ratings");
  const cells = await selectors.datasetPreview.columnCells("Danger ratings");
});

test("Sorting with values with same label as other values in the tree", async ({
  selectors,
  page,
  replayFromHAR,
}) => {
  await replayFromHAR();
  const key = "sorting-hierarchy-values-same-label.spec";
  const config = hierarchyTest13;
  await loadChartInLocalStorage(page, key, config);
  page.goto(`/en/create/${key}?${harReplayGraphqlEndpointQueryParam}`);
  await selectors.chart.loaded();

  const texts = await Promise.all(
    await (
      await page.locator('[data-testid="axis-width-band"] text').all()
    ).map((loc) => {
      return loc.innerHTML();
    })
  );

  // Zürich has id 261 while Bern has id 351
  expect(texts).toEqual(["Zürich", "Bern"]);
});
