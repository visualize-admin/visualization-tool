import { test, expect } from "./common";

/**
 * - Creates a chart from the photovoltaik dataset
 * - For each type of chart, changes the sorting between Name and Automatic
 * - Checks that the legend item order is coherent.
 */
test("Segment sorting", async ({ selectors, actions, within, screen }) => {
  test.setTimeout(60_000);

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
    const defaultExpected = chartType === "Lines" ? "Zurich" : "Aargau";
    const legendTexts = await legendItems.allInnerTexts();
    expect(legendTexts[0]).toEqual(defaultExpected);

    if (chartType !== "Lines") {
      await within(selectors.edition.controlSection("Sort"))
        .getByText("Name")
        .click();

      await actions.mui.selectOption("Automatic");

      await selectors.chart.loaded();
      await selectors.edition.filtersLoaded();

      const legendTexts = await legendItems.allInnerTexts();
      expect(legendTexts[0]).toBe("Zurich");
      await screen.getByText("Z → A").click();

      const legendTexts2 = await legendItems.allInnerTexts();
      expect(legendTexts2[0]).toEqual(
        chartType === "Pie" ? "Neuchâtel" : "Jura"
      );

      // Re-initialize for future tests
      await screen.getByText("A → Z").click();

      await within(selectors.edition.controlSection("Sort"))
        .getByText("Automatic")
        .click();

      await actions.mui.selectOption("Name");
    }
  }
});
