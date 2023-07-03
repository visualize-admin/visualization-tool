import { InternMap } from "d3";
import merge from "lodash/merge";

import {
  getChartConfigComponentIris,
  getMaybeTemporalDimensionValues,
  getWideData,
  prepareQueryFilters,
} from "@/charts/shared/chart-helpers";
import { InteractiveFiltersState } from "@/charts/shared/use-interactive-filters";
import {
  ChartType,
  Filters,
  InteractiveFiltersConfig,
  LineConfig,
  MapConfig,
} from "@/configurator";
import { FIELD_VALUE_NONE } from "@/configurator/constants";
import { Observation } from "@/domain/data";
import { DimensionMetadataFragment } from "@/graphql/query-hooks";
import map1Fixture from "@/test/__fixtures/config/int/map-nfi.json";
import line1Fixture from "@/test/__fixtures/config/prod/line-1.json";

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
    value: undefined,
  },
  dataFilters: {
    [col("3")]: {
      type: "single",
      value: val("3", "1"),
    },
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

describe("getMaybeTemporalDimensionValues", () => {
  it("should return data values if dimension is temporal", () => {
    const temporalDimension = {
      __typename: "TemporalDimension",
      iri: "year",
      values: [
        { label: "1996", value: "1996" },
        { label: "2023", value: "2023" },
      ],
    } as DimensionMetadataFragment;
    const data: Observation[] = [
      { [temporalDimension.iri]: "1997" },
      { [temporalDimension.iri]: "2002" },
      { [temporalDimension.iri]: "2023" },
    ];

    const result = getMaybeTemporalDimensionValues(temporalDimension, data);

    expect(result).toEqual([
      { label: "1997", value: "1997" },
      { label: "2002", value: "2002" },
      { label: "2023", value: "2023" },
    ]);
  });

  it("should return dimension values if dimension is not temporal", () => {
    const dimension = {
      __typename: "NominalDimension",
      iri: "year",
      values: [
        { label: "A", value: "A" },
        { label: "B", value: "B" },
        { label: "C", value: "C" },
      ],
    } as DimensionMetadataFragment;
    const data: Observation[] = [];

    const result = getMaybeTemporalDimensionValues(dimension, data);

    expect(result).toEqual(dimension.values);
  });
});

describe("getChartConfigComponentIris", () => {
  const lineConfig = line1Fixture.data.chartConfig as unknown as LineConfig;
  const mapConfig = map1Fixture.data.chartConfig as unknown as MapConfig;

  it("should return correct componentIris for line chart", () => {
    const componentsIris = getChartConfigComponentIris(lineConfig);
    expect(componentsIris).toEqual([
      "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/0",
      "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/0",
      "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/1",
      "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/2",
      "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/3",
      "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/4",
    ]);
  });

  it("should return correct componentIris for map chart", () => {
    const componentsIris = getChartConfigComponentIris(mapConfig);
    expect(componentsIris).toEqual([
      "https://environment.ld.admin.ch/foen/nfi/unitOfReference",
      "https://environment.ld.admin.ch/foen/nfi/Topic/3r",
      "https://environment.ld.admin.ch/foen/nfi/Topic/3",
      "https://environment.ld.admin.ch/foen/nfi/classificationUnit",
      "https://environment.ld.admin.ch/foen/nfi/inventory",
      "https://environment.ld.admin.ch/foen/nfi/evaluationType",
      "https://environment.ld.admin.ch/foen/nfi/grid",
      "https://environment.ld.admin.ch/foen/nfi/unitOfEvaluation",
    ]);
  });
});
