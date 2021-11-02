import { prepareQueryFilters } from "./chart-helpers";
import line1Fixture from "../../test/__fixtures/prod/line-1.json";
import { LineConfig } from "../../configurator";
import { InteractiveFiltersState } from "./use-interactive-filters";
import { merge } from "lodash";
import { FIELD_VALUE_NONE } from "../../configurator/constants";

const makeCubeNsGetters = (cubeIri: string) => ({
  col: (col: string) => `${cubeIri}/dimension/${col}`,
  val: (col: string, n: string) => `${cubeIri}/dimension/${col}/${n}`,
});

const { col, val } = makeCubeNsGetters(
  "http://environment.ld.admin.ch/foen/px/0703010000_105"
);

const commonInteractiveFiltersConfig = {
  legend: {
    active: false,
    componentIri: col("2"),
  },
  time: {
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
  time: {
    from: new Date(2021, 0, 1),
    to: new Date(2021, 11, 31),
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
      {
        ...line1Fixture.data.chartConfig,
        interactiveFiltersConfig: commonInteractiveFiltersConfig,
      } as LineConfig,
      commonInteractiveFiltersState
    );
    expect(queryFilters[col("3")]).toEqual({
      type: "single",
      value: val("3", "0"),
    });
  });

  it("should merge interactive filters state if interactive filters are active at publish time", () => {
    const queryFilters = prepareQueryFilters(
      {
        ...line1Fixture.data.chartConfig,
        interactiveFiltersConfig: merge({}, commonInteractiveFiltersConfig, {
          dataFilters: {
            active: true,
          },
        }),
      } as LineConfig,
      commonInteractiveFiltersState
    );
    expect(queryFilters[col("3")]).toEqual({
      type: "single",
      value: val("3", "1"),
    });
  });

  it("should omit none values since they should not be passed to graphql layer", () => {
    const queryFilters = prepareQueryFilters(
      {
        ...line1Fixture.data.chartConfig,
        interactiveFiltersConfig: merge({}, commonInteractiveFiltersConfig, {
          dataFilters: {
            active: true,
          },
        }),
      } as LineConfig,
      merge({}, commonInteractiveFiltersState, {
        dataFilters: {
          [col("3")]: {
            type: "single",
            value: FIELD_VALUE_NONE,
          },
        },
      })
    );
    expect(queryFilters[col("3")]).toBeUndefined();
  });
});
