import { loadChartInLocalStorage } from "./charts-utils";
import { setup, sleep } from "./common";
import hierarchyTest13 from "./fixtures/hierarchy-test-13-municipality-population.json";

const { test, expect } = setup();

/**
 * - Creates a chart from the photovoltaik dataset
 * - For each type of chart, changes the sorting between Name and Automatic
 * - Checks that the legend item order is coherent.
 */
test
// FIX: works without Browser, some bug with Browser closed error
.skip("Segment sorting", async ({
  selectors,
  actions,
  within,
  screen,
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

  for (const chartType of ["Columns", "Pie"] as const) {
    await selectors.edition.drawerLoaded();
    await actions.editor.changeChartType(chartType);
    await actions.editor.selectActiveField("Segmentation");

    // Switch color on the first chart
    if (chartType === "Columns") {
      await within(selectors.edition.controlSectionByTitle("Segmentation"))
        .getByText("None")
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
}) => {
  await actions.chart.createFrom(
    "https://environment.ld.admin.ch/foen/nfi/nfi_C-1029/cube/2023-1",
    "Prod"
  );

  await selectors.edition.drawerLoaded();
  await actions.editor.selectActiveField("Segmentation");

  await sleep(3_000);

  const colorSection =
    selectors.edition.controlSectionByTitle("Segmentation");
  await within(colorSection).getByText("None").click();

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
    "Zurich",
    "Bern",
    "Lucerne",
    "Uri",
    "Schwyz",
    "Obwalden",
    "Nidwalden",
    "Glarus",
    "Zug",
    "Fribourg",
    "Solothurn",
    "both Basel",
    "Schaffhausen",
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

test("Map legend preview table sorting", async ({ actions, selectors }) => {
  await actions.chart.createFrom(
    "https://environment.ld.admin.ch/foen/gefahren-waldbrand-warnung/1",
    "Int"
  );
  await selectors.edition.drawerLoaded();

  await actions.editor.changeChartType("Map");
  await selectors.chart.loaded();

  await actions.chart.switchToTableView();
  await actions.datasetPreview.sortBy("Danger ratings");
  const cells = await selectors.datasetPreview.columnCells("Danger ratings");

  const texts = await cells.allInnerTexts();
  // TODO: Think about other cube / validation as this cube is updated quite often (day / week)
  // and thus will fail often.
  // expect(uniqueWithoutSorting(texts)).toEqual(["low danger", "moderate danger"]);
});

test("Sorting with values with same label as other values in the tree", async ({
  selectors,
  page,
}) => {
  const key = "sorting-hierarchy-values-same-label.spec";
  const config = hierarchyTest13;
  await loadChartInLocalStorage(page, key, config);
  page.goto(`/en/create/${key}`);
  await selectors.chart.loaded({ timeout: 30_000 });

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
