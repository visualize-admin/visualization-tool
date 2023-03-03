import { expect, sleep, test } from "./common";

test("it should be possible to enable abbreviations for colors & x field (column)", async ({
  actions,
  selectors,
}) => {
  test.slow();
  await actions.chart.createFrom(
    "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/6",
    "Prod"
  );

  await actions.editor.selectActiveField("Horizontal Axis");

  let checkbox = await selectors.edition.useAbbreviationsCheckbox();

  expect(await checkbox.isDisabled()).toEqual(true);

  await (
    await selectors.panels.drawer().within().findByText("Jahr der Vergütung")
  ).click();

  await actions.mui.selectOption("Kanton");

  // Wait for the data to load.
  await selectors.chart.loaded();
  await selectors.edition.filtersLoaded();

  expect(await checkbox.isDisabled()).toEqual(false);

  await checkbox.click();

  await sleep(5_000);

  const xAxis = await selectors.chart.axisWidthBand();
  const ticks = (await xAxis.textContent()) as string;
  expect([ticks.slice(0, 2), ticks.slice(-2)]).toEqual(["ZH", "NE"]);

  await (await selectors.panels.drawer().within().findByText("Kanton")).click();

  await actions.mui.selectOption("Jahr der Vergütung");

  await sleep(5_000);

  await actions.drawer.close();

  await actions.editor.selectActiveField("Color");

  await (await selectors.panels.drawer().within().findByText("None")).click();

  await actions.mui.selectOption("Kanton");

  checkbox = await selectors.edition.useAbbreviationsCheckbox();
  await checkbox.click();

  // Wait for the data to load.
  await selectors.chart.loaded();
  await selectors.edition.filtersLoaded();
  await selectors.chart.colorLegend(undefined, { setTimeout: 5_000 });

  const legendItems = await (
    await selectors.chart.colorLegendItems()
  ).allInnerTexts();

  expect([legendItems[0], legendItems[legendItems.length - 1]]).toEqual([
    "ZH",
    "JU",
  ]);
});

test("hierarchies: it should be possible to enable abbreviations for colors", async ({
  actions,
  selectors,
}) => {
  await actions.chart.createFrom(
    "https://environment.ld.admin.ch/foen/ubd000502_sad_01/7",
    "Int"
  );

  await actions.editor.selectActiveField("Color");

  await (await selectors.panels.drawer().within().findByText("None")).click();

  await actions.mui.selectOption("Greenhouse gas");

  const checkbox = await selectors.edition.useAbbreviationsCheckbox();

  await checkbox.click();

  // Wait for the data to load.
  await selectors.chart.loaded();
  await selectors.edition.filtersLoaded();
  await selectors.chart.colorLegend(undefined, { setTimeout: 5_000 });

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

  await actions.editor.changeChartType("Map");
  await actions.editor.selectActiveField("Warning region");

  const checkbox = await selectors.edition.useAbbreviationsCheckbox();

  await checkbox.click();

  // Wait for the data to load.
  await selectors.chart.loaded();
  await selectors.edition.filtersLoaded();
  await selectors.chart.colorLegend(undefined, { setTimeout: 5_000 });

  const legendItems = await (
    await selectors.chart.colorLegendItems()
  ).allInnerTexts();

  expect(legendItems).toEqual([
    "No measures",
    "Warning",
    "Conditional ban on fires",
    "Fire ban in the forest",
    "Ban on fires",
  ]);
});
