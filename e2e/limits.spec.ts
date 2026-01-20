import { loadChartInLocalStorage } from "./charts-utils";
import { setup } from "./common";

const { test, expect } = setup();

test("future, time-range limits should be displayed in the chart", async ({
  page,
  selectors,
}) => {
  const key = "limits-chart";
  await loadChartInLocalStorage(page, key, CONFIGURATOR_STATE);
  await page.goto(`/en/create/${key}`);
  await selectors.chart.loaded();
  const xAxis = page.locator("#axis-width-time");
  const xAxisTicks = xAxis.locator(".tick > text");
  const xAxisTickLabels = await xAxisTicks.allTextContents();
  const lastXAxisTickLabel = xAxisTickLabels[xAxisTickLabels.length - 1];
  expect(lastXAxisTickLabel).toBe("2030");

  const verticalLimits = page.locator("#vertical-limits");
  const limitMiddleLine = verticalLimits.locator(".middle-line");
  const limitMiddleLineX1 = await limitMiddleLine.getAttribute("x1");
  const limitMiddleLineX2 = await limitMiddleLine.getAttribute("x2");

  const limitMiddleLineLength = +limitMiddleLineX2 - +limitMiddleLineX1;
  expect(limitMiddleLineLength).toBeGreaterThan(0);
});

const CONFIGURATOR_STATE = {
  version: "4.6.0",
  state: "CONFIGURING_CHART",
  dataSource: {
    type: "sparql",
    url: "https://lindas-cached.int.cz-aws.net/query",
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
        key: "Y1vZ4Vkbb2A8",
        initialized: false,
      },
    ],
  },
  chartConfigs: [
    {
      key: "Y1vZ4Vkbb2A8",
      version: "4.5.0",
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
          iri: "https://environment.ld.admin.ch/foen/test_target/cube/target_future_ghg/1",
          filters: {},
        },
      ],
      limits: {
        "https://environment.ld.admin.ch/foen/test_target/cube/target_future_ghg/1(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)https://environment.ld.admin.ch/foen/test_target/roundedCO2Emissions":
          [
            {
              related: [
                {
                  index: 1,
                  type: "time-from",
                  dimensionId:
                    "https://environment.ld.admin.ch/foen/test_target/cube/target_future_ghg/1(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)https://environment.ld.admin.ch/foen/test_target/year",
                  value: "https://ld.admin.ch/time/year/2021",
                  label: "Year 2021",
                  position: "2021",
                },
                {
                  index: 1,
                  type: "time-to",
                  dimensionId:
                    "https://environment.ld.admin.ch/foen/test_target/cube/target_future_ghg/1(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)https://environment.ld.admin.ch/foen/test_target/year",
                  value: "https://ld.admin.ch/time/year/2030",
                  label: "Year 2030",
                  position: "2030",
                },
              ],
              color: "#ff0000",
              lineType: "solid",
              symbolType: "circle",
            },
          ],
      },
      conversionUnitsByComponentId: {},
      activeField: "y",
      chartType: "line",
      interactiveFiltersConfig: {
        legend: {
          active: false,
          componentId: "",
        },
        timeRange: {
          active: false,
          componentId:
            "https://environment.ld.admin.ch/foen/test_target/cube/target_future_ghg/1(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)https://environment.ld.admin.ch/foen/test_target/year",
          presets: {
            type: "range",
            from: "",
            to: "",
          },
        },
        dataFilters: {
          active: false,
          componentIds: [],
          defaultOpen: true,
        },
        calculation: {
          active: false,
          type: "identity",
        },
      },
      fields: {
        x: {
          componentId:
            "https://environment.ld.admin.ch/foen/test_target/cube/target_future_ghg/1(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)https://environment.ld.admin.ch/foen/test_target/year",
        },
        y: {
          componentId:
            "https://environment.ld.admin.ch/foen/test_target/cube/target_future_ghg/1(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)https://environment.ld.admin.ch/foen/test_target/roundedCO2Emissions",
        },
        color: {
          type: "single",
          paletteId: "category10",
          color: "#1D4ED8",
        },
      },
    },
  ],
  activeChartKey: "Y1vZ4Vkbb2A8",
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
