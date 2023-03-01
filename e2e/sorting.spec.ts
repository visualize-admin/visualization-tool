import { test, expect } from "./common";

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
  context,
  page,
}) => {
  test.setTimeout(60_000);

  if (process.env.E2E_HAR !== "false") {
    await page.routeFromHAR("./e2e/har/sorting.zip", {
      notFound: "fallback",
    });
  }

  await actions.chart.createFrom(
    "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/13",
    "Int"
  );

  for (const chartType of ["Columns", "Lines", "Areas", "Pie"] as const) {
    await actions.editor.changeChartType(chartType);
    await actions.editor.selectActiveField("Color");

    // Wait for color section to be ready
    await selectors.edition.controlSection("Color").waitFor();

    // Switch color on the first chart
    if (chartType === "Columns") {
      await within(selectors.edition.controlSection("Color"))
        .getByText("None")
        .click();

      await actions.mui.selectOption("Standort der Anlage");
    }

    // Wait for chart to be loaded
    await selectors.chart.loaded();
    await selectors.edition.filtersLoaded();
    await selectors.chart.colorLegend(undefined, { setTimeout: 5_000 });

    const legendItems = await selectors.chart.colorLegendItems();
    const legendTexts = await legendItems.allInnerTexts();
    expect(legendTexts[0]).toEqual("Zurich");

    await within(selectors.edition.controlSection("Sort"))
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

    await within(selectors.edition.controlSection("Sort"))
      .getByText("Name")
      .click();

    await actions.mui.selectOption("Automatic");

    await actions.drawer.close();
  }
});

test("Segment sorting with hierarchy", async ({
  actions,
  selectors,
  screen,
  within,
}) => {
  await actions.chart.createFrom(
    "https://environment.ld.admin.ch/foen/nfi/49-19-44/cube/1",
    "Int"
  );
  await actions.editor.selectActiveField("Color");

  // Wait for color section to be ready
  await selectors.edition.controlSection("Color").waitFor();

  await within(selectors.edition.controlSection("Color"))
    .getByText("None")
    .click();

  await actions.mui.selectOption("Production region");
  await selectors.chart.loaded();

  await selectors.edition.filtersLoaded();
  await selectors.chart.colorLegend(undefined, { timeout: 30_000 });

  await within(await selectors.chart.colorLegend()).findByText(
    "Southern Alps",
    undefined,
    { timeout: 10_000 }
  );

  const legendItems = await selectors.chart.colorLegendItems();

  expect(await legendItems.allInnerTexts()).toEqual([
    "Jura",
    "Plateau",
    "Pre-Alps",
    "Alps",
    "Southern Alps",
  ]);

  await screen.getByText("Z → A").click();
  expect(await legendItems.allInnerTexts()).toEqual([
    "Southern Alps",
    "Alps",
    "Pre-Alps",
    "Plateau",
    "Jura",
  ]);
});

test("Map legend categorical values sorting", async ({
  actions,
  selectors,
}) => {
  await actions.chart.createFrom(
    "https://environment.ld.admin.ch/foen/gefahren-waldbrand-warnung/1",
    "Int"
  );
  await actions.editor.changeChartType("Map");
  await selectors.chart.loaded();

  const legendItems = await selectors.chart.colorLegendItems();

  expect(await legendItems.allInnerTexts()).toEqual([
    "low danger",
    "moderate danger",
    "considerable danger",
    "high danger",
    "very high danger",
  ]);
});

const uniqueWithoutSorting = <T>(arr: T[]) => {
  const res: T[] = [];
  for (let i = 0; i < arr.length; i++) {
    const prev = i > 0 ? arr[i - 1] : undefined;
    const cur = arr[i];
    if (prev !== cur) {
      res.push(cur);
    }
  }
  return res;
};

test.only("Map legend preview table sorting", async ({
  actions,
  selectors,
  page,
}) => {
  await actions.chart.createFrom(
    "https://environment.ld.admin.ch/foen/gefahren-waldbrand-warnung/1",
    "Int"
  );
  await actions.editor.changeChartType("Map");
  await selectors.chart.loaded();

  await actions.chart.switchToTableView();
  await actions.datasetPreview.sortBy("Danger ratings");
  const cells = await selectors.datasetPreview.columnCells("Danger ratings");

  const texts = await cells.allInnerTexts();
  expect(uniqueWithoutSorting(texts)).toEqual([
    "low danger",
    "moderate danger",
    "considerable danger",
    "high danger",
    "very high danger",
  ]);
});
