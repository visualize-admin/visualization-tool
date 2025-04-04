import { loadChartInLocalStorage } from "./charts-utils";
import { setup, sleep } from "./common";

const { test, expect } = setup();

test("should have correct tooltip content", async ({
  actions,
  selectors,
  within,
  page,
  replayFromHAR,
}) => {
  await replayFromHAR({
    update: true,
  });
  await actions.chart.createFrom({
    iri: "https://environment.ld.admin.ch/foen/ubd000502/4",
    dataSource: "Prod",
  });

  await selectors.edition.drawerLoaded();

  const filterLocator = await within(
    selectors.edition.controlSectionByTitle("Filters")
  );

  await filterLocator
    .getByRole("textbox", { name: "2. Greenhouse gas" })
    .click();

  await selectors.mui
    .popover()
    .findByText("Methane", undefined, { timeout: 10_000 });

  await actions.mui.selectOption("Methane");

  await selectors.chart.loaded();

  const chart = page.locator("[data-chart-loaded]");
  const xLabel = chart.locator('[data-index="6"]');

  await xLabel.hover({
    force: true,
  });

  await sleep(3_000);

  const tooltip = page.locator('[data-testid="chart-tooltip"]');
  await tooltip.waitFor({
    state: "attached",
    timeout: 1_000,
  });
  const textContent = await tooltip.textContent();
  expect(textContent?.startsWith("1996")).toBe(true);
});

test("should keep correct position after scrolling", async ({
  page,
  actions,
}) => {
  await actions.chart.createFrom({
    iri: "https://agriculture.ld.admin.ch/foag/cube/MilkDairyProducts/Consumption_Price_Month",
    dataSource: "Prod",
    createURLParams: "flag__enable-experimental-features=true",
  });
  await actions.editor.changeRegularChartType("Bars");
  const chart = page.locator("[data-chart-loaded]");
  const chartBbox = await chart.boundingBox();
  const rect0 = chart.locator('[data-index="0"]');
  await rect0.hover({ force: true });
  await sleep(3_000);
  const rect50 = chart.locator('[data-index="50"]');
  await rect50.hover({ force: true });
  await sleep(3_000);
  const tooltip = page.locator('[data-testid="chart-tooltip"]');
  await tooltip.waitFor({ state: "attached", timeout: 1_000 });
  const tooltipRect = await tooltip.boundingBox();

  if (!chartBbox || !tooltipRect) {
    throw new Error("Bounding box not found!");
  }

  expect(tooltipRect.x).toBeGreaterThanOrEqual(chartBbox.x);
  expect(tooltipRect.x).toBeLessThanOrEqual(chartBbox.x + chartBbox.width);
  expect(tooltipRect.y).toBeGreaterThanOrEqual(chartBbox.y);
  expect(tooltipRect.y).toBeLessThanOrEqual(chartBbox.y + chartBbox.height);
});

test("should not contain NaN values", async ({ page, selectors }) => {
  const key = "map-config";
  await loadChartInLocalStorage(page, key, MAP_CONFIG_STATE);
  await page.goto(`/en/create/${key}`);
  await selectors.chart.loaded();
  const chart = page.locator(".maplibregl-canvas");
  await chart.hover({ position: { x: 1, y: 1 } });
  const tooltip = page.locator('[data-testid="chart-tooltip"]');
  await tooltip.waitFor({ state: "attached", timeout: 1_000 });
  const textContent = await tooltip.textContent();
  expect(textContent).not.toContain("NaN");
});

// Special config that contains symbols grouped in the right top corner of the chart,
// so that we can easily hover over them and check the tooltip content.
const MAP_CONFIG_STATE = {
  version: "4.2.0",
  state: "CONFIGURING_CHART",
  dataSource: {
    type: "sparql",
    url: "https://lindas-cached.cluster.ldbar.ch/query",
  },
  layout: {
    type: "tab",
    meta: {
      title: {
        de: "",
        en: "",
        fr: "",
        it: "",
      },
      description: {
        de: "",
        en: "",
        fr: "",
        it: "",
      },
      label: {
        de: "",
        en: "",
        fr: "",
        it: "",
      },
    },
    blocks: [
      {
        type: "chart",
        key: "ftcfNaXEz1Dt",
        initialized: false,
      },
    ],
  },
  chartConfigs: [
    {
      key: "ftcfNaXEz1Dt",
      version: "4.1.0",
      meta: {
        title: {
          en: "",
          de: "",
          fr: "",
          it: "",
        },
        description: {
          en: "",
          de: "",
          fr: "",
          it: "",
        },
        label: {
          en: "",
          de: "",
          fr: "",
          it: "",
        },
      },
      cubes: [
        {
          iri: "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/10",
          filters: {
            "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/Jahr":
              {
                type: "single",
                value: "2014",
              },
          },
        },
      ],
      chartType: "map",
      interactiveFiltersConfig: {
        legend: {
          active: false,
          componentId: "",
        },
        timeRange: {
          active: true,
          componentId:
            "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/Jahr",
          presets: {
            type: "range",
            from: "2014",
            to: "2023",
          },
        },
        dataFilters: {
          active: false,
          componentIds: [],
        },
        calculation: {
          active: false,
          type: "identity",
        },
      },
      baseLayer: {
        show: true,
        locked: true,
        bbox: [
          [7.037838717797797, 24.804701640425165],
          [64.55634838244976, 47.70350279907606],
        ],
      },
      fields: {
        symbolLayer: {
          componentId:
            "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/Kanton",
          color: {
            type: "fixed",
            value: "#1f77b4",
            opacity: 100,
          },
          measureId: "FIELD_VALUE_NONE",
        },
      },
    },
  ],
  activeChartKey: "ftcfNaXEz1Dt",
  dashboardFilters: {
    timeRange: {
      active: false,
      timeUnit: "",
      presets: {
        from: "",
        to: "",
      },
    },
    dataFilters: {
      componentIds: [],
      filters: {},
    },
  },
};
