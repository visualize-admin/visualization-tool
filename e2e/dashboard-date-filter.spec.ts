import { loadChartInLocalStorage } from "./charts-utils";
import { setup, sleep } from "./common";

const { expect, test } = setup();

test("the application shouldn't crash in case of adding a global, week-based filter", async ({
  page,
  selectors,
}) => {
  const key = "123";
  await loadChartInLocalStorage(page, key, CONFIGURATOR_STATE);
  await page.goto(`/en/create/${key}`);
  await selectors.chart.loaded();

  const dateFilterToggle = page.locator(
    "[data-testid='dashboard-time-range-filter-toggle']"
  );
  await dateFilterToggle.click();

  await sleep(2_000);

  const dateFilters = page
    .locator("[data-testid='dashboard-time-range-filters'] input")
    .first();
  const dateFiltersText = await dateFilters.inputValue();

  // Make sure the content is not empty and the date is formatted correctly.
  expect(dateFiltersText).toContain("-");
});

const CONFIGURATOR_STATE = {
  version: "4.2.0",
  state: "LAYOUTING",
  dataSource: {
    type: "sparql",
    url: "https://lindas-cached.cluster.ldbar.ch/query",
  },
  layout: {
    type: "tab",
    meta: {
      title: { de: "", en: "", fr: "", it: "" },
      description: { de: "", en: "", fr: "", it: "" },
      label: { de: "", en: "", fr: "", it: "" },
    },
    blocks: [
      { type: "chart", key: "P2aXwlds74qI", initialized: false },
      { key: "SnhL6_5cK1Az", type: "chart", initialized: false },
    ],
  },
  chartConfigs: [
    {
      key: "P2aXwlds74qI",
      version: "4.1.0",
      meta: {
        title: { en: "", de: "", fr: "", it: "" },
        description: { en: "", de: "", fr: "", it: "" },
        label: { en: "", de: "", fr: "", it: "" },
      },
      cubes: [
        {
          iri: "https://health.ld.admin.ch/fsvo/Moderhinke_Untersuchungsperiode_2024_2025/10",
          filters: {
            "https://health.ld.admin.ch/fsvo/Moderhinke_Untersuchungsperiode_2024_2025(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)https://health.ld.admin.ch/fsvo/Moderhinke_Untersuchungsperiode_2024_2025/Variable":
              {
                type: "single",
                value:
                  "https://health.ld.admin.ch/fsvo/Moderhinke_Untersuchungsperiode_2024_2025/farms_examined_count",
              },
            "https://health.ld.admin.ch/fsvo/Moderhinke_Untersuchungsperiode_2024_2025(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)https://health.ld.admin.ch/fsvo/Moderhinke_Untersuchungsperiode_2024_2025/lastdayofweek":
              { type: "range", from: "2024-10-06", to: "2025-01-26" },
          },
        },
      ],
      chartType: "column",
      interactiveFiltersConfig: {
        legend: { active: false, componentId: "" },
        timeRange: {
          componentId:
            "https://health.ld.admin.ch/fsvo/Moderhinke_Untersuchungsperiode_2024_2025(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)https://health.ld.admin.ch/fsvo/Moderhinke_Untersuchungsperiode_2024_2025/lastdayofweek",
          active: false,
          presets: { type: "range", from: "2024-10-06", to: "2025-01-26" },
        },
        dataFilters: { active: false, componentIds: [] },
        calculation: { active: false, type: "identity" },
      },
      fields: {
        x: {
          componentId:
            "https://health.ld.admin.ch/fsvo/Moderhinke_Untersuchungsperiode_2024_2025(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)https://health.ld.admin.ch/fsvo/Moderhinke_Untersuchungsperiode_2024_2025/lastdayofweek",
          sorting: { sortingType: "byAuto", sortingOrder: "asc" },
        },
        y: {
          componentId:
            "https://health.ld.admin.ch/fsvo/Moderhinke_Untersuchungsperiode_2024_2025(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)https://health.ld.admin.ch/fsvo/Moderhinke_Untersuchungsperiode_2024_2025/number",
        },
        color: { type: "single", paletteId: "category10", color: "#006699" },
      },
    },
    {
      key: "SnhL6_5cK1Az",
      version: "4.1.0",
      meta: {
        title: { en: "", de: "", fr: "", it: "" },
        description: { en: "", de: "", fr: "", it: "" },
        label: { en: "", de: "", fr: "", it: "" },
      },
      cubes: [
        {
          iri: "https://health.ld.admin.ch/fsvo/Moderhinke_Untersuchungsperiode_2024_2025/10",
          filters: {
            "https://health.ld.admin.ch/fsvo/Moderhinke_Untersuchungsperiode_2024_2025(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)https://health.ld.admin.ch/fsvo/Moderhinke_Untersuchungsperiode_2024_2025/Variable":
              {
                type: "single",
                value:
                  "https://health.ld.admin.ch/fsvo/Moderhinke_Untersuchungsperiode_2024_2025/farms_examined_count",
              },
          },
        },
      ],
      chartType: "line",
      interactiveFiltersConfig: {
        legend: { active: false, componentId: "" },
        timeRange: {
          active: false,
          componentId:
            "https://health.ld.admin.ch/fsvo/Moderhinke_Untersuchungsperiode_2024_2025(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)https://health.ld.admin.ch/fsvo/Moderhinke_Untersuchungsperiode_2024_2025/lastdayofweek",
          presets: { type: "range", from: "", to: "" },
        },
        dataFilters: { active: false, componentIds: [] },
        calculation: { active: false, type: "identity" },
      },
      fields: {
        x: {
          componentId:
            "https://health.ld.admin.ch/fsvo/Moderhinke_Untersuchungsperiode_2024_2025(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)https://health.ld.admin.ch/fsvo/Moderhinke_Untersuchungsperiode_2024_2025/lastdayofweek",
        },
        y: {
          componentId:
            "https://health.ld.admin.ch/fsvo/Moderhinke_Untersuchungsperiode_2024_2025(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)https://health.ld.admin.ch/fsvo/Moderhinke_Untersuchungsperiode_2024_2025/number",
        },
        color: { type: "single", paletteId: "category10", color: "#006699" },
      },
    },
  ],
  activeChartKey: "P2aXwlds74qI",
  dashboardFilters: {
    timeRange: { active: false, timeUnit: "", presets: { from: "", to: "" } },
    dataFilters: { componentIds: [], filters: {} },
  },
};
