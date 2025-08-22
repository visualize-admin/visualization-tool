import { renderHook } from "@testing-library/react";
import merge from "lodash/merge";
import { describe, expect, it, Mock, vi } from "vitest";

import {
  extractChartConfigComponentIds,
  prepareCubeQueryFilters,
  useQueryFilters,
} from "@/charts/shared/chart-helpers";
import { ChartConfig, Filters, InteractiveFiltersConfig } from "@/configurator";
import { FIELD_VALUE_NONE } from "@/configurator/constants";
import { mkJoinById } from "@/graphql/join";
import {
  InteractiveFiltersState,
  useChartInteractiveFilters,
} from "@/stores/interactive-filters";
import map1Fixture from "@/test/__fixtures/config/int/map-nfi.json";
import line1Fixture from "@/test/__fixtures/config/prod/line-1.json";
import dualLine1Fixture from "@/test/__fixtures/config/test/chartConfig-photovoltaik-und-gebaudeprogramm.json";
import { migrateChartConfig } from "@/utils/chart-config/versioning";

vi.mock("../../rdf/extended-cube", () => ({
  ExtendedCube: vi.fn(),
}));

vi.mock("@/stores/interactive-filters", () => ({
  useChartInteractiveFilters: vi.fn(() => ({
    A_1: { type: "single", value: "A_1_1" },
    A_2: { type: "single", value: "A_2_1" },
    B_1: { type: "single", value: "B_1_1" },
  })),
}));

const makeCubeNsGetters = (cubeIri: string) => ({
  col: (col: string) => `${cubeIri}/dimension/${col}`,
  val: (col: string, n: string) => `${cubeIri}/dimension/${col}/${n}`,
});

const { col, val } = makeCubeNsGetters(
  "http://environment.ld.admin.ch/foen/px/0703010000_105"
);

const commonInteractiveFiltersConfig: InteractiveFiltersConfig = {
  legend: {
    active: false,
    componentId: col("2"),
  },
  timeRange: {
    active: false,
    componentId: col("1"),
    presets: {
      type: "range",
      from: "2010-01-01",
      to: "2020-01-01",
    },
  },
  dataFilters: {
    active: false,
    componentIds: [col("3"), col("4")],
    defaultValueOverrides: {},
  },
  calculation: {
    active: false,
    type: "identity",
  },
};
const commonInteractiveFiltersState: InteractiveFiltersState = {
  categories: {
    type: true,
  },
  timeRange: {
    from: new Date(2021, 0, 1),
    to: new Date(2021, 11, 31),
  },
  timeSlider: {
    type: "interval",
    value: undefined,
  },
  dataFilters: {
    [col("3")]: {
      type: "single",
      value: val("3", "1"),
    },
  },
  calculation: {
    type: "identity",
  },
  annotations: {},
};

describe("useQueryFilters", () => {
  it("should not merge interactive filters state if interactive filters are disabled at publish time", () => {
    const queryFilters = prepareCubeQueryFilters({
      chartConfig: line1Fixture.data.chartConfig as unknown as ChartConfig,
      cubeFilters: line1Fixture.data.chartConfig.filters as Filters,
      animationField: undefined,
      interactiveFiltersConfig: commonInteractiveFiltersConfig,
      dashboardFilters: undefined,
      interactiveDataFilters: commonInteractiveFiltersState.dataFilters,
    });
    expect(queryFilters[col("3")]).toEqual({
      type: "single",
      value: val("3", "0"),
    });
  });

  it("should merge interactive filters state if interactive filters are active at publish time", () => {
    const queryFilters = prepareCubeQueryFilters({
      chartConfig: line1Fixture.data.chartConfig as unknown as ChartConfig,
      cubeFilters: line1Fixture.data.chartConfig.filters as Filters,
      animationField: undefined,
      interactiveFiltersConfig: merge({}, commonInteractiveFiltersConfig, {
        dataFilters: {
          active: true,
          componentIds: [col("3")],
        },
      }),
      dashboardFilters: undefined,
      interactiveDataFilters: commonInteractiveFiltersState.dataFilters,
    });

    expect(queryFilters[col("3")]).toEqual({
      type: "single",
      value: val("3", "1"),
    });
  });

  it("should omit none values since they should not be passed to graphql layer", () => {
    const queryFilters = prepareCubeQueryFilters({
      chartConfig: line1Fixture.data.chartConfig as unknown as ChartConfig,
      cubeFilters: line1Fixture.data.chartConfig.filters as Filters,
      animationField: undefined,
      interactiveFiltersConfig: merge({}, commonInteractiveFiltersConfig, {
        dataFilters: {
          active: true,
          componentIds: [col("3")],
        },
      }),
      dashboardFilters: undefined,
      interactiveDataFilters: merge({}, commonInteractiveFiltersState, {
        dataFilters: {
          [col("3")]: {
            type: "single",
            value: FIELD_VALUE_NONE,
          },
        },
      }).dataFilters,
    });

    expect(queryFilters[col("3")]).toBeUndefined();
  });

  it("should scope interactive filters to cube filters", () => {
    const chartConfig = {
      chartType: "line",
      interactiveFiltersConfig: {
        dataFilters: {
          active: true,
          componentIds: ["A_1", "A_2", "B_1"],
        },
      },
      cubes: [
        {
          iri: "A",
          filters: {
            A_1: { type: "single", value: "A_1_5" },
            A_2: { type: "single", value: "A_2_3" },
          },
        },
        {
          iri: "B",
          filters: {
            B_1: { type: "single", value: "B_1_1" },
          },
        },
      ],
      fields: {},
    } as any as ChartConfig;
    const { result: queryFilters } = renderHook<
      ReturnType<typeof useQueryFilters>,
      Parameters<typeof useQueryFilters>[0]
    >(
      (props: Parameters<typeof useQueryFilters>[0]) => useQueryFilters(props),
      {
        initialProps: { chartConfig, dashboardFilters: undefined },
      }
    );

    expect(queryFilters.current).toEqual([
      {
        iri: "A",
        componentIds: undefined,
        filters: {
          A_1: { type: "single", value: "A_1_1" },
          A_2: { type: "single", value: "A_2_1" },
        },
        joinBy: undefined,
      },
      {
        iri: "B",
        componentIds: undefined,
        filters: { B_1: { type: "single", value: "B_1_1" } },
        joinBy: undefined,
      },
    ]);
  });

  it("should handle correctly dashboard filters", () => {
    (useChartInteractiveFilters as Mock).mockImplementation(() => ({}));

    const chartConfig = {
      chartType: "line",
      interactiveFiltersConfig: {
        dataFilters: {
          active: true,
          componentIds: ["A_1", "A_2", "B_1"],
        },
      },
      cubes: [
        {
          iri: "A",
          filters: {
            A_1: { type: "single", value: "A_1_5" },
            A_2: { type: "single", value: "A_2_1" },
          },
        },
        {
          iri: "B",
          filters: {
            B_1: { type: "single", value: "B_1_1" },
          },
        },
      ],
      fields: {},
    } as any as ChartConfig;
    const { result: queryFilters } = renderHook<
      ReturnType<typeof useQueryFilters>,
      Parameters<typeof useQueryFilters>[0]
    >(useQueryFilters, {
      initialProps: {
        chartConfig,
        dashboardFilters: {
          timeRange: {
            active: false,
            timeUnit: "ms",
            presets: {
              from: "2021-01-01",
              to: "2021-12-31",
            },
          },
          dataFilters: {
            componentIds: ["A_1"],
            filters: {
              A_1: { type: "single", value: "A_1_Data_Filter" },
              A_2: { type: "single", value: "A_2_3" },
            },
          },
        },
      },
    });

    expect(queryFilters.current).toEqual([
      {
        iri: "A",
        componentIds: undefined,
        filters: {
          A_1: { type: "single", value: "A_1_Data_Filter" },
          A_2: { type: "single", value: "A_2_1" },
        },
        joinBy: undefined,
      },
      {
        iri: "B",
        componentIds: undefined,
        filters: {
          B_1: { type: "single", value: "B_1_1" },
        },
        joinBy: undefined,
      },
    ]);
  });

  it("should handle multi-filter with FIELD_VALUE_NONE", () => {
    const cubeFiltersWithMulti: Filters = {
      [col("3")]: {
        type: "multi" as const,
        values: {
          [val("3", "1")]: true,
          [val("3", "2")]: true,
        },
      },
    };

    const interactiveDataFiltersWithNone = {
      [col("3")]: { type: "single" as const, value: FIELD_VALUE_NONE },
    };

    const queryFilters = prepareCubeQueryFilters({
      chartConfig: line1Fixture.data.chartConfig as unknown as ChartConfig,
      cubeFilters: cubeFiltersWithMulti,
      animationField: undefined,
      interactiveFiltersConfig: merge({}, commonInteractiveFiltersConfig, {
        dataFilters: {
          active: true,
          componentIds: [col("3")],
        },
      }),
      dashboardFilters: undefined,
      interactiveDataFilters: interactiveDataFiltersWithNone,
    });

    expect(queryFilters[col("3")]).toEqual({
      type: "multi",
      values: {
        [val("3", "1")]: true,
        [val("3", "2")]: true,
      },
    });
  });

  it("should handle animation field exclusion with multi-filters", () => {
    const animationField = {
      componentId: col("3"),
      showPlayButton: false,
      type: "continuous" as const,
      duration: 1000,
      dynamicScales: false,
    };

    const queryFilters = prepareCubeQueryFilters({
      chartConfig: line1Fixture.data.chartConfig as unknown as ChartConfig,
      cubeFilters: line1Fixture.data.chartConfig.filters as Filters,
      animationField,
      interactiveFiltersConfig: merge({}, commonInteractiveFiltersConfig, {
        dataFilters: {
          active: true,
          componentIds: [col("3")],
        },
      }),
      dashboardFilters: undefined,
      interactiveDataFilters: commonInteractiveFiltersState.dataFilters,
    });

    expect(queryFilters[col("3")]).toEqual({
      type: "single",
      value: val("3", "0"),
    });
  });

  it("should prioritize dashboard filters over interactive filters", () => {
    const dashboardFilters = {
      timeRange: {
        active: false,
        timeUnit: "ms",
        presets: {
          from: "2021-01-01",
          to: "2021-12-31",
        },
      },
      dataFilters: {
        componentIds: [col("3")],
        filters: {
          [col("3")]: { type: "single" as const, value: val("3", "dashboard") },
        },
      },
    };

    const queryFilters = prepareCubeQueryFilters({
      chartConfig: line1Fixture.data.chartConfig as unknown as ChartConfig,
      cubeFilters: line1Fixture.data.chartConfig.filters as Filters,
      animationField: undefined,
      interactiveFiltersConfig: merge({}, commonInteractiveFiltersConfig, {
        dataFilters: {
          active: true,
          componentIds: [col("3")],
        },
      }),
      dashboardFilters,
      interactiveDataFilters: {},
    });

    expect(queryFilters[col("3")]).toEqual({
      type: "single",
      value: val("3", "dashboard"),
    });
  });
});

describe("getChartConfigComponentsIds", () => {
  const migrationOptions = {
    migrationProps: {
      dataSet: "foo",
      meta: {},
      dataSource: {
        type: "sparql",
        url: "",
      },
    },
  };
  let lineConfig: ChartConfig;
  let mapConfig: ChartConfig;

  it("should return correct componentsIds for line chart", async () => {
    lineConfig = await migrateChartConfig(
      line1Fixture.data.chartConfig,
      migrationOptions
    );
    mapConfig = await migrateChartConfig(
      map1Fixture.data.chartConfig,
      migrationOptions
    );
    const componentsIds = extractChartConfigComponentIds({
      chartConfig: lineConfig,
    });
    expect(componentsIds).toEqual([
      "foo(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/0",
      "foo(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/1",
      "foo(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/2",
      "foo(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/3",
      "foo(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/4",
      "foo(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)http://environment.ld.admin.ch/foen/px/0703010000_105/measure/0",
    ]);
  });

  it("should return correct componentsIds for map chart", () => {
    const componentsIds = extractChartConfigComponentIds({
      chartConfig: mapConfig,
    });
    expect(componentsIds).toEqual([
      "foo(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)https://environment.ld.admin.ch/foen/nfi/Topic/3",
      "foo(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)https://environment.ld.admin.ch/foen/nfi/Topic/3r",
      "foo(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)https://environment.ld.admin.ch/foen/nfi/classificationUnit",
      "foo(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)https://environment.ld.admin.ch/foen/nfi/evaluationType",
      "foo(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)https://environment.ld.admin.ch/foen/nfi/grid",
      "foo(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)https://environment.ld.admin.ch/foen/nfi/inventory",
      "foo(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)https://environment.ld.admin.ch/foen/nfi/unitOfEvaluation",
      "foo(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)https://environment.ld.admin.ch/foen/nfi/unitOfReference",
    ]);
  });

  it("should return correct componentsIds for dual line chart (join by)", async () => {
    const dualLineConfig = await migrateChartConfig(
      dualLine1Fixture,
      migrationOptions
    );
    const componentIds = extractChartConfigComponentIds({
      chartConfig: dualLineConfig,
    });
    expect(
      componentIds.includes(
        "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/9(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/Jahr"
      )
    ).toBe(true);
    expect(componentIds.includes(mkJoinById(0))).toBe(false);
  });
});
