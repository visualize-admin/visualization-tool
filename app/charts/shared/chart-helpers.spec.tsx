import { renderHook } from "@testing-library/react";
import merge from "lodash/merge";

import {
  extractChartConfigComponentIris,
  prepareCubeQueryFilters,
  useQueryFilters,
} from "@/charts/shared/chart-helpers";
import {
  ChartConfig,
  ChartType,
  Filters,
  InteractiveFiltersConfig,
} from "@/configurator";
import { FIELD_VALUE_NONE } from "@/configurator/constants";
import { mkJoinById } from "@/graphql/join";
import { InteractiveFiltersState } from "@/stores/interactive-filters";
import dualLine1Fixture from "@/test/__fixtures/config/dev/chartConfig-photovoltaik-und-gebaudeprogramm.json";
import map1Fixture from "@/test/__fixtures/config/int/map-nfi.json";
import line1Fixture from "@/test/__fixtures/config/prod/line-1.json";
import { migrateChartConfig } from "@/utils/chart-config/versioning";

jest.mock("../../rdf/extended-cube", () => ({
  ExtendedCube: jest.fn(),
}));

jest.mock("@/stores/interactive-filters", () => ({
  useChartInteractiveFilters: jest.fn(() => ({
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
    componentIri: col("2"),
  },
  timeRange: {
    active: false,
    componentIri: col("1"),
    presets: {
      type: "range",
      from: "2010-01-01",
      to: "2020-01-01",
    },
  },
  dataFilters: {
    componentIris: [col("3"), col("4")],
    active: false,
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
};

describe("useQueryFilters", () => {
  it("should not merge interactive filters state if interactive filters are disabled at publish time", () => {
    const queryFilters = prepareCubeQueryFilters(
      line1Fixture.data.chartConfig.chartType as ChartType,
      line1Fixture.data.chartConfig.filters as Filters,
      commonInteractiveFiltersConfig,
      undefined,
      commonInteractiveFiltersState.dataFilters
    );
    expect(queryFilters[col("3")]).toEqual({
      type: "single",
      value: val("3", "0"),
    });
  });

  it("should merge interactive filters state if interactive filters are active at publish time", () => {
    const queryFilters = prepareCubeQueryFilters(
      line1Fixture.data.chartConfig.chartType as ChartType,
      line1Fixture.data.chartConfig.filters as Filters,
      merge({}, commonInteractiveFiltersConfig, {
        dataFilters: {
          active: true,
        },
      }),
      undefined,
      commonInteractiveFiltersState.dataFilters
    );

    expect(queryFilters[col("3")]).toEqual({
      type: "single",
      value: val("3", "1"),
    });
  });

  it("should omit none values since they should not be passed to graphql layer", () => {
    const queryFilters = prepareCubeQueryFilters(
      line1Fixture.data.chartConfig.chartType as ChartType,
      line1Fixture.data.chartConfig.filters as Filters,
      merge({}, commonInteractiveFiltersConfig, {
        dataFilters: {
          active: true,
        },
      }),
      undefined,
      merge({}, commonInteractiveFiltersState, {
        dataFilters: {
          [col("3")]: {
            type: "single",
            value: FIELD_VALUE_NONE,
          },
        },
      }).dataFilters
    );

    expect(queryFilters[col("3")]).toBeUndefined();
  });

  it("should scope interactive filters to cube filters", () => {
    const chartConfig = {
      chartType: "line",
      interactiveFiltersConfig: {
        dataFilters: {
          active: true,
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
        componentIris: undefined,
        filters: {
          A_1: { type: "single", value: "A_1_1" },
          A_2: { type: "single", value: "A_2_1" },
        },
        joinBy: undefined,
      },
      {
        iri: "B",
        componentIris: undefined,
        filters: { B_1: { type: "single", value: "B_1_1" } },
        joinBy: undefined,
      },
    ]);
  });
});

describe("getChartConfigComponentIris", () => {
  const migrationOptions = {
    migrationProps: { dataSet: "foo", meta: {} },
  };
  const lineConfig = migrateChartConfig(
    line1Fixture.data.chartConfig,
    migrationOptions
  );
  const mapConfig = migrateChartConfig(
    map1Fixture.data.chartConfig,
    migrationOptions
  );

  it("should return correct componentIris for line chart", () => {
    const componentsIris = extractChartConfigComponentIris({
      chartConfig: lineConfig,
    });
    expect(componentsIris).toEqual([
      "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/0",
      "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/1",
      "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/2",
      "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/3",
      "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/4",
      "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/0",
    ]);
  });

  it("should return correct componentIris for map chart", () => {
    const componentsIris = extractChartConfigComponentIris({
      chartConfig: mapConfig,
    });
    expect(componentsIris).toEqual([
      "https://environment.ld.admin.ch/foen/nfi/Topic/3",
      "https://environment.ld.admin.ch/foen/nfi/Topic/3r",
      "https://environment.ld.admin.ch/foen/nfi/classificationUnit",
      "https://environment.ld.admin.ch/foen/nfi/evaluationType",
      "https://environment.ld.admin.ch/foen/nfi/grid",
      "https://environment.ld.admin.ch/foen/nfi/inventory",
      "https://environment.ld.admin.ch/foen/nfi/unitOfEvaluation",
      "https://environment.ld.admin.ch/foen/nfi/unitOfReference",
    ]);
  });

  it("should return correct componentIris for dual line chart (join by)", () => {
    const componentIris = extractChartConfigComponentIris({
      chartConfig: dualLine1Fixture as unknown as ChartConfig,
    });
    expect(
      componentIris.includes(
        "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/Jahr"
      )
    ).toBe(true);
    expect(componentIris.includes(mkJoinById(0))).toBe(false);
  });
});
