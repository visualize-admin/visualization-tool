import { setup } from "./common";

const { test, expect } = setup();

test("it should be possible to duplicate a chart", async ({
  actions,
  selectors,
}) => {
  await actions.chart.createFrom({
    iri: "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/10",
    dataSource: "Prod",
  });
  await selectors.chart.loaded();
  const chartMoreButton = await selectors.chart.moreButton();
  await chartMoreButton.click();
  await (await selectors.mui.popover().findByText("Duplicate")).click();
  const chartTabs = await selectors.chart.tabs();
  expect(await chartTabs.count()).toBe(2);
});

