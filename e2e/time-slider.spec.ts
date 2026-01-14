import { loadChartInLocalStorage } from "./charts-utils";
import { setup } from "./common";

const { expect, test } = setup();

test("is should be possible to use time slider", async ({
  page,
  selectors,
}) => {
  const key = "123";
  await loadChartInLocalStorage(page, key, CONFIGURATOR_STATE);
  await page.goto(`/en/create/${key}`);
  await selectors.chart.loaded();

  const thumbX0 = await page
    .locator(".MuiSlider-thumb")
    .boundingBox()
    .then((box) => box.x);
  const secondMark = page.locator(".MuiSlider-mark").nth(2);
  await secondMark.click();
  const thumbX1 = await page
    .locator(".MuiSlider-thumb")
    .boundingBox()
    .then((box) => box.x);

  expect(thumbX1).toBeLessThan(thumbX0);
});

const CONFIGURATOR_STATE = {
  version: "4.4.0",
  state: "CONFIGURING_CHART",
  dataSource: {
    type: "sparql",
    url: "https://lindas-cached.int.cz-aws.net/query",
  },
  layout: {
    type: "tab",
    meta: {
      title: { de: "", en: "", fr: "", it: "" },
      description: { de: "", en: "", fr: "", it: "" },
      label: { de: "", en: "", fr: "", it: "" },
    },
    blocks: [{ type: "chart", key: "476WLsfvkmpO", initialized: false }],
  },
  chartConfigs: [
    {
      key: "476WLsfvkmpO",
      version: "4.3.0",
      meta: {
        title: { en: "", de: "", fr: "", it: "" },
        description: { en: "", de: "", fr: "", it: "" },
        label: { en: "", de: "", fr: "", it: "" },
      },
      cubes: [
        {
          iri: "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/10",
          filters: {
            "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/Jahr":
              { type: "range", from: "2014", to: "2023" },
          },
        },
      ],
      limits: {},
      chartType: "map",
      interactiveFiltersConfig: {
        legend: { active: false, componentId: "" },
        timeRange: {
          active: false,
          componentId:
            "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/Jahr",
          presets: { type: "range", from: "2014", to: "2023" },
        },
        dataFilters: { active: false, componentIds: [] },
        calculation: { active: false, type: "identity" },
      },
      baseLayer: { show: true, locked: false, customLayers: [] },
      fields: {
        areaLayer: {
          componentId:
            "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/Kanton",
          color: {
            type: "numerical",
            componentId:
              "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/AnzahlAnlagen",
            paletteId: "oranges",
            scaleType: "continuous",
            interpolationType: "linear",
            opacity: 100,
          },
        },
        animation: {
          componentId:
            "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/Jahr",
          showPlayButton: true,
          duration: 30,
          type: "continuous",
          dynamicScales: false,
        },
      },
    },
  ],
  activeChartKey: "476WLsfvkmpO",
  dashboardFilters: {
    timeRange: { active: false, timeUnit: "", presets: { from: "", to: "" } },
    dataFilters: {
      componentIds: [
        "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/Jahr",
      ],
      filters: {
        "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/Jahr":
          { type: "single", value: "2014" },
      },
    },
  },
};
