import { loadChartInLocalStorage } from "./charts-utils";
import { setup } from "./common";
import forestFireDanger from "./fixtures/forest-fire-danger-chart-config.json";
import { harReplayGraphqlEndpointQueryParam } from "./har-utils";

const { test } = setup();

test("@noci should be possible to de-select options from color component in maps", async ({
  page,
  actions,
  selectors,
  replayFromHAR,
}) => {
  await replayFromHAR();
  const key = "color-mapping-maps.spec";
  const config = forestFireDanger;
  await loadChartInLocalStorage(page, key, config);
  await page.goto(`/en/create/${key}?${harReplayGraphqlEndpointQueryParam}`);
  await selectors.edition.drawerLoaded();

  await selectors.chart.loaded();

  await actions.editor.changeRegularChartType("Map");

  await selectors.chart.loaded();

  await actions.editor.selectActiveField("Areas");

  await selectors.chart.loaded();

  await page.getByRole("button", { name: "Edit filters" }).click();

  const filters = selectors.edition.filterDrawer();
  await filters.getByText("Canton of Zurich").click();
  await filters.getByText("Apply filters").click();

  await selectors.chart.loaded();
});
