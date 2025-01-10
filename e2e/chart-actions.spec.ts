import { promises } from "fs";

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

test("it should be possible to make a screenshot of a chart", async ({
  page,
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
  const downloadPromise = page.waitForEvent("download");
  await (await selectors.mui.popover().findByText("Export PNG")).click();
  const download = await downloadPromise;
  expect((await promises.stat(await download.path())).size).toBeGreaterThan(
    // Assuring the file is not empty.
    4000
  );
});
