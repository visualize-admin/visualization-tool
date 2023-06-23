import { setup, sleep } from "./common";

const { test, expect } = setup();

test("it should be possible to enable abbreviations for colors & x field (column)", async ({
  actions,
  selectors,
}) => {
  test.slow();

  await actions.chart.createFrom(
    "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/6",
    "Prod"
  );

  await selectors.edition.drawerLoaded();
  await actions.editor.selectActiveField("Horizontal Axis");

  let checkbox = await selectors.edition.useAbbreviationsCheckbox();

  expect(await checkbox.isDisabled()).toEqual(true);

  await (
    await selectors.panels.drawer().within().findByText("Jahr der Vergütung")
  ).click();

  await actions.mui.selectOption("Kanton");

  await selectors.chart.loaded();
  await selectors.edition.filtersLoaded();

  expect(await checkbox.isDisabled()).toEqual(false);

  await checkbox.click();

  await sleep(3_000);

  const xAxis = await selectors.chart.axisWidthBand();
  const ticks = (await xAxis.textContent()) as string;
  expect([ticks.slice(0, 2), ticks.slice(-2)]).toEqual(["ZH", "NE"]);

  await (await selectors.panels.drawer().within().findByText("Kanton")).click();

  await actions.mui.selectOption("Jahr der Vergütung");

  await sleep(3_000);

  await actions.drawer.close();

  await actions.editor.selectActiveField("Color");

  await (await selectors.panels.drawer().within().findByText("None")).click();

  await actions.mui.selectOption("Kanton");

  checkbox = await selectors.edition.useAbbreviationsCheckbox();
  await checkbox.click();

  // Wait for the data to load.
  await selectors.chart.loaded();
  await selectors.edition.filtersLoaded();
  await selectors.chart.colorLegend(undefined, { timeout: 3_000 });

  await sleep(3_000);

  const colorLegendItems = await (
    await selectors.chart.colorLegendItems()
  ).allInnerTexts();

  expect(colorLegendItems[0]).toEqual("ZH");
});

test("hierarchies: it should be possible to enable abbreviations for colors", async ({
  actions,
  selectors,
}) => {
  await actions.chart.createFrom(
    "https://environment.ld.admin.ch/foen/ubd000502/4",
    "Prod"
  );

  await selectors.edition.drawerLoaded();
  await actions.editor.selectActiveField("Color");

  await (await selectors.panels.drawer().within().findByText("None")).click();

  await actions.mui.selectOption("Greenhouse gas");

  const checkbox = await selectors.edition.useAbbreviationsCheckbox();

  await checkbox.click();

  await selectors.chart.loaded();
  await selectors.edition.filtersLoaded();
  await selectors.chart.colorLegend(undefined, { timeout: 3_000 });

  await sleep(3_000);

  const legendItems = await (
    await selectors.chart.colorLegendItems()
  ).allInnerTexts();

  expect(legendItems).toEqual(["CH4", "CO2", "N2O"]);
});

test("localized abbreviations", async ({ actions, selectors }) => {
  await actions.chart.createFrom(
    "https://environment.ld.admin.ch/foen/gefahren-waldbrand-praeventionsmassnahmen-kantone/1",
    "Int"
  );

  await selectors.edition.drawerLoaded();
  await actions.editor.changeChartType("Map");
  await actions.editor.selectActiveField("Warning region");

  const checkbox = await selectors.edition.useAbbreviationsCheckbox();

  await checkbox.click();

  await selectors.chart.loaded();
  await selectors.edition.filtersLoaded();
  await selectors.chart.colorLegend(undefined, { timeout: 3_000 });

  await sleep(3_000);

  const legendItems = await (
    await selectors.chart.colorLegendItems()
  ).allInnerTexts();

  expect(legendItems.slice(0, 2)).toEqual(["No measures", "Warning"]);
});
