import { InternMap } from "d3";
import merge from "lodash/merge";

import {
  extractChartConfigComponentIris,
  getWideData,
  prepareQueryFilters,
} from "@/charts/shared/chart-helpers";
import { ChartType, Filters, InteractiveFiltersConfig } from "@/configurator";
import { FIELD_VALUE_NONE } from "@/configurator/constants";
import { Observation } from "@/domain/data";
import { InteractiveFiltersState } from "@/stores/interactive-filters";
import map1Fixture from "@/test/__fixtures/config/int/map-nfi.json";
import line1Fixture from "@/test/__fixtures/config/prod/line-1.json";
import { migrateChartConfig } from "@/utils/chart-config/versioning";

jest.mock("rdf-cube-view-query", () => ({
  Node: class {
    constructor() {}
  },
  Source: class {
    constructor() {}
  },
  Cube: class {
    constructor() {}
  },
}));

jest.mock("../../rdf/extended-cube", () => ({
  ExtendedCube: jest.fn(),
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
    const queryFilters = prepareQueryFilters(
      line1Fixture.data.chartConfig.chartType as ChartType,
      line1Fixture.data.chartConfig.filters as Filters,
      commonInteractiveFiltersConfig,
      commonInteractiveFiltersState.dataFilters
    );
    expect(queryFilters[col("3")]).toEqual({
      type: "single",
      value: val("3", "0"),
    });
  });

  it("should merge interactive filters state if interactive filters are active at publish time", () => {
    const queryFilters = prepareQueryFilters(
      line1Fixture.data.chartConfig.chartType as ChartType,
      line1Fixture.data.chartConfig.filters as Filters,
      merge({}, commonInteractiveFiltersConfig, {
        dataFilters: {
          active: true,
        },
      }),
      commonInteractiveFiltersState.dataFilters
    );

    expect(queryFilters[col("3")]).toEqual({
      type: "single",
      value: val("3", "1"),
    });
  });

  it("should omit none values since they should not be passed to graphql layer", () => {
    const queryFilters = prepareQueryFilters(
      line1Fixture.data.chartConfig.chartType as ChartType,
      line1Fixture.data.chartConfig.filters as Filters,
      merge({}, commonInteractiveFiltersConfig, {
        dataFilters: {
          active: true,
        },
      }),
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
});

describe("getWideData", () => {
  const exampleMap: InternMap<string, Observation[]> = new Map();
  exampleMap.set("2021-01-02", [{ segment: "abc", value: 1 }]);
  exampleMap.set("2015-03-03", [{ segment: "abc", value: 10 }]);
  exampleMap.set("2028-12-12", [{ segment: "abc", value: 12 }]);

  it("should return sorted data", () => {
    const wideData = getWideData({
      dataGroupedByX: exampleMap,
      xKey: "date",
      getY: (d: Observation) => Number(d["value"]),
      getSegment: (d: Observation) => String(d["segment"]),
    });

    expect(wideData.map((d) => d["date"])).toEqual([
      "2015-03-03",
      "2021-01-02",
      "2028-12-12",
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
    const componentsIris = extractChartConfigComponentIris(lineConfig);
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
    const componentsIris = extractChartConfigComponentIris(mapConfig);
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
});
