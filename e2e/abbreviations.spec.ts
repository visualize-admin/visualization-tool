import { setup, sleep } from "./common";
import { harReplayGraphqlEndpointQueryParam } from "./har-utils";

const { test, expect } = setup();

test("it should be possible to enable abbreviations for colors & x field (column)", async ({
  actions,
  selectors,
  replayFromHAR,
}) => {
  await replayFromHAR();

  test.slow();

  await actions.chart.createFrom({
    iri: "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/6",
    dataSource: "Prod",
    createURLParams: harReplayGraphqlEndpointQueryParam,
  });

  await selectors.edition.drawerLoaded();
  await actions.editor.selectActiveField("Horizontal Axis");

  let checkbox = await selectors.edition.useAbbreviationsCheckbox();

  expect(await checkbox.isDisabled()).toEqual(true);

  await (
    await selectors.panels
      .drawer()
      .within()
      .getByLabelText("Jahr der Vergütung")
  ).click();

  await actions.mui.selectOption("Kanton");

  await selectors.chart.loaded();
  await selectors.edition.filtersLoaded();

  expect(await checkbox.isDisabled()).toEqual(false);

  await checkbox.click();

  await sleep(3_000);

  const xAxis = await selectors.chart.axisWidthBand();
  const ticks = (await xAxis.textContent()) as string;

  await (
    await selectors.panels.drawer().within().getByLabelText("Kanton")
  ).click();

  await actions.mui.selectOption("Jahr der Vergütung");

  await sleep(3_000);

  await actions.drawer.close();

  await actions.editor.selectActiveField("Segmentation");
  await selectors.edition.drawerLoaded();

  await (
    await selectors.panels.drawer().within().getByLabelText("None")
  ).click();

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
  replayFromHAR,
}) => {
  await replayFromHAR();

  await actions.chart.createFrom({
    iri: "https://environment.ld.admin.ch/foen/ubd000502/4",
    dataSource: "Prod",
    createURLParams: harReplayGraphqlEndpointQueryParam,
  });

  await selectors.edition.drawerLoaded();
  await actions.editor.selectActiveField("Segmentation");

  await (
    await selectors.panels.drawer().within().getByLabelText("None")
  ).click();

  await actions.mui.selectOption("Greenhouse gas");
  await selectors.edition.drawerLoaded();
  const checkbox = await selectors.edition.useAbbreviationsCheckbox();

  await checkbox.click();

  await selectors.chart.loaded();
  await selectors.edition.filtersLoaded();
  await selectors.chart.colorLegend(undefined, { timeout: 3_000 });

  await sleep(3_000);

  const legendItems = await (
    await selectors.chart.colorLegendItems()
  ).allInnerTexts();

  expect(legendItems).toEqual([
    "CH4",
    "CO2",
    "N2O",
    "HFC",
    "NF3",
    "PFC",
    "SF6",
  ]);
});

// test("localized abbreviations", async ({
//   actions,
//   selectors,
//   replayFromHAR,
// }) => {
//   await replayFromHAR();

//   await actions.chart.createFrom({
//     iri: "https://environment.ld.admin.ch/foen/gefahren-waldbrand-praeventionsmassnahmen-kantone/1",
//     dataSource: "Prod",
//     createURLParams: harReplayGraphqlEndpointQueryParam,
//   });

//   await selectors.edition.drawerLoaded();
//   await actions.editor.changeRegularChartType("Map");
//   await actions.editor.selectActiveField("Warning region");

//   await selectors.edition.drawerLoaded();
//   const checkbox = await selectors.edition.useAbbreviationsCheckbox();

//   await checkbox.click();

//   await selectors.chart.loaded();
//   await selectors.edition.filtersLoaded();
//   await selectors.chart.colorLegend(undefined, { timeout: 3_000 });

//   await sleep(3_000);

//   const legendItems = await (
//     await selectors.chart.colorLegendItems()
//   ).allInnerTexts();

//   expect(legendItems.slice(0, 2)).toEqual(["No measures", "Warning"]);
// });
