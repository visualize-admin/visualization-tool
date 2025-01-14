import produce, { createDraft, current } from "immer";
import get from "lodash/get";

import { getChartConfigAdjustedToChartType } from "@/charts";
import {
  ChartConfig,
  ChartType,
  ColumnConfig,
  ConfiguratorState,
  ConfiguratorStateConfiguringChart,
  ConfiguratorStatePublishing,
  Filters,
  MapConfig,
} from "@/config-types";
import { getChartConfig } from "@/config-utils";
import { getNewChartConfig } from "@/configurator/config-form";
import { ConfiguratorStateAction } from "@/configurator/configurator-state/actions";
import {
  configJoinedCubes,
  configStateMock,
  dimensionsJoinedCubes,
  groupedColumnChartDimensions,
  groupedColumnChartMeasures,
} from "@/configurator/configurator-state/mocks";
import {
  applyNonTableDimensionToFilters,
  applyTableDimensionToFilters,
  deriveFiltersFromFields,
  ensureDashboardLayoutIsCorrect,
  handleChartFieldChanged,
  handleChartOptionChanged,
  reducer,
  setRangeFilter,
  updateColorMapping,
} from "@/configurator/configurator-state/reducer";
import { Dimension, Measure, NominalDimension } from "@/domain/data";
import { stringifyComponentId } from "@/graphql/make-component-id";
import covid19ColumnChartConfig from "@/test/__fixtures/config/test/chartConfig-column-covid19.json";
import covid19TableChartConfig from "@/test/__fixtures/config/test/chartConfig-table-covid19.json";
import covid19Metadata from "@/test/__fixtures/data/DataCubeMetadataWithComponentValues-covid19.json";
import { getCachedComponents as getCachedComponentsOriginal } from "@/urql-cache";
import { getCachedComponentsMock } from "@/urql-cache.mock";
import { assert } from "@/utils/assert";
import { migrateChartConfig } from "@/utils/chart-config/versioning";

const pristineConfigStateMock = JSON.parse(JSON.stringify(configStateMock));

afterEach(() => {
  // Ensures that tests are not dirtying the configStateMock
  try {
    expect(configStateMock).toEqual(pristineConfigStateMock);
  } catch (e) {
    throw Error(
      "One of the tests is dirtying the configStateMock. Please ensure that the configStateMock is not modified in the tests by using produce from immer."
    );
  }
});

jest.mock("@/rdf/extended-cube", () => ({
  ExtendedCube: jest.fn(),
}));

jest.mock("@/utils/chart-config/api", () => ({
  createConfig: jest.fn(),
  fetchChartConfig: jest.fn(),
}));

jest.mock("@/urql-cache", () => {
  return {
    getCachedComponents: jest.fn(),
  };
});

jest.mock("@lingui/macro", () => ({
  defineMessage: (str: string) => str,
  t: (str: string) => str,
}));

type getCachedComponents = typeof getCachedComponentsOriginal;
const getCachedComponents = getCachedComponentsOriginal as unknown as jest.Mock<
  ReturnType<getCachedComponents>,
  Parameters<getCachedComponents>
>;

afterEach(() => {
  jest.restoreAllMocks();
});

describe("add dataset", () => {
  const state = configStateMock.map;

  const addAction: ConfiguratorStateAction = {
    type: "DATASET_ADD",
    value: {
      iri: "http://second-dataset",
      joinBy: {
        left: ["year-period-1"],
        right: ["year-period-2"],
      },
    },
  };

  const removeAction: ConfiguratorStateAction = {
    type: "DATASET_REMOVE",
    value: {
      locale: "de",
      iri: "http://second-dataset",
    },
  };

  const runReducer = (
    state: ConfiguratorState,
    action: ConfiguratorStateAction
  ) => produce(state, (state: ConfiguratorState) => reducer(state, action));

  it("should add/remove a cube and replace correctly joinBy to the first cube", () => {
    const newState = runReducer(
      state,
      addAction
    ) as ConfiguratorStatePublishing;

    const config = newState.chartConfigs[0] as MapConfig;

    expect(config.fields["areaLayer"]?.componentId).toEqual("joinBy__0");
    expect(config.fields["areaLayer"]?.color.componentId).toEqual("joinBy__0");
    expect(config.cubes.length).toBe(2);
  });

  it("should correctly remove a cube", () => {
    const newState = runReducer(
      state,
      addAction
    ) as ConfiguratorStatePublishing;

    getCachedComponents.mockImplementation((options) => {
      // TODO Cubes join by need to be reset at the moment, will change
      // when we have more than 2 cubes
      expect(
        options.cubeFilters.map((x) => x.joinBy).every((x) => x === undefined)
      ).toBe(true);

      return getCachedComponentsMock.electricityPricePerCantonDimensions;
    });
    const newState2 = runReducer(
      newState,
      removeAction
    ) as ConfiguratorStatePublishing;
    const config = newState2.chartConfigs[0] as MapConfig;
    expect(config.cubes.length).toBe(1);
    expect(config.chartType).toEqual("map");
  });
});

describe("add chart", () => {
  const state = configStateMock.groupedColumnChart;
  const action: ConfiguratorStateAction = {
    type: "CHART_CONFIG_ADD",
    value: {
      chartConfig: getNewChartConfig({
        chartType: "line",
        chartConfig: state.chartConfigs[0],
        state,
        dimensions: groupedColumnChartDimensions,
        measures: groupedColumnChartMeasures,
      }),
      locale: "en",
    },
  };

  const runReducer = (
    state: ConfiguratorState,
    action: ConfiguratorStateAction
  ) => produce(state, (state: ConfiguratorState) => reducer(state, action));

  it("should correctly derive filters for a new chart", () => {
    getCachedComponents.mockImplementation(() => {
      return {
        dimensions: groupedColumnChartDimensions,
        measures: groupedColumnChartMeasures,
      };
    });
    const newState = runReducer(
      state,
      action
    ) as ConfiguratorStateConfiguringChart;
    const config = newState.chartConfigs[1];
    expect(Object.keys(config.cubes[0].filters)).toEqual([
      stringifyComponentId({
        unversionedCubeIri:
          "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen",
        unversionedComponentIri:
          "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/Kanton",
      }),
    ]);
  });
});

describe("applyDimensionToFilters", () => {
  const keyDimension = {
    id: "https://environment.ld.admin.ch/foen/ubd0104/parametertype",
    label: "Parameter",
    isKeyDimension: true,
    values: [
      { value: "E.coli", label: "E.coli" },
      { value: "Enterokokken", label: "Enterokokken" },
    ],
    unit: null,
    __typename: "NominalDimension",
  } as any as NominalDimension;

  const keyDimensionWithHierarchy = {
    __typename: "NominalDimension",
    id: "nominalDimensionIri",
    label: "Nominal Dimension with Hierarchy",
    isKeyDimension: true,
    isNumerical: false,
    values: [
      { value: "brienz", label: "Brienz" },
      { value: "switzerland", label: "Switzerland" },
    ],
    hierarchy: [
      {
        __typename: "HierarchyValue",
        dimensionId: "nominalDimensionIri",
        value: "switzerland",
        label: "Switzerland",
        depth: 0,
        hasValue: true,
        children: [],
      },
      {
        __typename: "HierarchyValue",
        dimensionId: "nominalDimensionIri",
        value: "brienz",
        label: "Brienz",
        depth: -1,
        hasValue: true,
        children: [],
      },
    ],
  } as any as NominalDimension;

  const optionalDimension = {
    id: "https://environment.ld.admin.ch/foen/ubd0104/parametertype",
    label: "Parameter",
    isKeyDimension: false,
    values: [
      { value: "E.coli", label: "E.coli" },
      { value: "Enterokokken", label: "Enterokokken" },
    ],
    unit: null,
    __typename: "NominalDimension",
  } as any as NominalDimension;

  describe("applyNonTableDimensionToFilters", () => {
    it("should remove single value filter when a keyDimension is used as a field", () => {
      const initialFilters = {
        "https://environment.ld.admin.ch/foen/ubd0104/parametertype": {
          type: "single",
          value: "E.coli",
        },
      } as any;
      const expectedFilters = {};

      applyNonTableDimensionToFilters({
        filters: initialFilters,
        dimension: keyDimension,
        isField: true,
        cubeIri: "https://environment.ld.admin.ch/foen/ubd0104",
      });

      expect(initialFilters).toEqual(expectedFilters);
    });

    it("should add single value filter if switching from a field to non-field", () => {
      const initialFilters = {
        "https://environment.ld.admin.ch/foen/ubd0104/parametertype": {
          type: "multi",
          values: { "E.coli": true, Enterokokken: true },
        },
      } as any;
      const expectedFilters = {
        "https://environment.ld.admin.ch/foen/ubd0104/parametertype": {
          type: "single",
          value: "E.coli",
        },
      };

      applyNonTableDimensionToFilters({
        filters: initialFilters,
        dimension: keyDimension,
        isField: false,
        cubeIri: "https://environment.ld.admin.ch/foen/ubd0104",
      });

      expect(initialFilters).toEqual(expectedFilters);
    });

    it("should not modify undefined filter for a optionalDimension", () => {
      const initialFilters = {};
      const expectedFilters = {};

      applyNonTableDimensionToFilters({
        filters: initialFilters,
        dimension: optionalDimension,
        isField: true,
        cubeIri: "https://environment.ld.admin.ch/foen/ubd0104",
      });

      expect(initialFilters).toEqual(expectedFilters);
    });

    it("should select top-most hierarchy value by default when no filter was present", () => {
      const initialFilters = {};
      const expectedFilters = {
        nominalDimensionIri: {
          type: "single",
          value: "switzerland",
        },
      };

      applyNonTableDimensionToFilters({
        filters: initialFilters,
        dimension: keyDimensionWithHierarchy,
        isField: false,
        cubeIri: "https://environment.ld.admin.ch/foen/ubd0104",
      });

      expect(initialFilters).toEqual(expectedFilters);
    });

    it("should select top-most hierarchy value by default when multi-filter was present", () => {
      const initialFilters: Filters = {
        nominalDimensionIri: {
          type: "multi",
          values: {
            brienz: true,
            switzerland: true,
          },
        },
      };
      const expectedFilters = {
        nominalDimensionIri: {
          type: "single",
          value: "switzerland",
        },
      };

      applyNonTableDimensionToFilters({
        filters: initialFilters,
        dimension: keyDimensionWithHierarchy,
        isField: false,
        cubeIri: "https://environment.ld.admin.ch/foen/ubd0104",
      });

      expect(initialFilters).toEqual(expectedFilters);
    });
  });

  describe("applyTableDimensionToFilters", () => {
    it("should set single value filter for a keyDimension if hidden and not grouped", () => {
      const initialFilters = {};
      const expectedFilters = {
        "https://environment.ld.admin.ch/foen/ubd0104/parametertype": {
          type: "single",
          value: "E.coli",
        },
      };

      applyTableDimensionToFilters({
        filters: initialFilters,
        dimension: keyDimension,
        isHidden: true,
        isGrouped: false,
        cubeIri: "https://environment.ld.admin.ch/foen/ubd0104",
      });

      expect(initialFilters).toEqual(expectedFilters);
    });

    it("should not modify filter for an optionalDimension if hidden and not grouped", () => {
      const initialFilters = {
        "https://environment.ld.admin.ch/foen/ubd0104/parametertype": {
          type: "multi",
          values: { "E.coli": true, Enterokokken: true },
        },
      } as any;
      const expectedFilters = {
        "https://environment.ld.admin.ch/foen/ubd0104/parametertype": {
          type: "multi",
          values: { "E.coli": true, Enterokokken: true },
        },
      };

      applyTableDimensionToFilters({
        filters: initialFilters,
        dimension: optionalDimension,
        isHidden: true,
        isGrouped: false,
        cubeIri: "https://environment.ld.admin.ch/foen/ubd0104",
      });

      expect(initialFilters).toEqual(expectedFilters);
    });

    it("should set single value filter for a keyDimension if hidden", () => {
      const initialFilters = {
        "https://environment.ld.admin.ch/foen/ubd0104/parametertype": {
          from: "2007-05-21",
          to: "2020-09-28",
          type: "range",
        },
      } as any;
      const expectedFilters = {
        "https://environment.ld.admin.ch/foen/ubd0104/parametertype": {
          type: "single",
          value: "2007-05-21",
        },
      };

      applyTableDimensionToFilters({
        filters: initialFilters,
        dimension: keyDimension,
        isHidden: true,
        isGrouped: false,
        cubeIri: "https://environment.ld.admin.ch/foen/ubd0104",
      });

      expect(initialFilters).toEqual(expectedFilters);
    });

    it("should not modify filters for a keyDimension if not hidden and grouped", () => {
      const initialFilters = {
        "https://environment.ld.admin.ch/foen/ubd0104/parametertype": {
          type: "multi",
          values: { "E.coli": false, Enterokokken: true },
        },
      } as any;
      const expectedFilters = {
        "https://environment.ld.admin.ch/foen/ubd0104/parametertype": {
          type: "multi",
          values: { "E.coli": false, Enterokokken: true },
        },
      };

      applyTableDimensionToFilters({
        filters: initialFilters,
        dimension: keyDimension,
        isHidden: false,
        isGrouped: true,
        cubeIri: "https://environment.ld.admin.ch/foen/ubd0104",
      });

      expect(initialFilters).toEqual(expectedFilters);
    });
  });
});

describe("deriveFiltersFromFields", () => {
  it("should apply missing filters, even in the case of join by dimensions, in case of non table chart", () => {
    const state = configJoinedCubes.pie!;
    const dimensions = dimensionsJoinedCubes;

    const derived = deriveFiltersFromFields(state, {
      dimensions: dimensions as Dimension[],
    });
    expect(derived).toMatchInlineSnapshot(`
      Object {
        "activeField": undefined,
        "chartType": "pie",
        "cubes": Array [
          Object {
            "filters": Object {
              "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/Jahr": Object {
                "type": "single",
                "value": "2011",
              },
              "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/Kanton": Object {
                "type": "single",
                "value": "https://ld.admin.ch/canton/1",
              },
            },
            "iri": "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/9",
            "joinBy": Array [
              "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/Jahr",
              "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/Kanton",
            ],
          },
          Object {
            "filters": Object {
              "https://energy.ld.admin.ch/elcom/electricityprice-canton(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)https://energy.ld.admin.ch/elcom/electricityprice/dimension/canton": Object {
                "type": "single",
                "value": "https://ld.admin.ch/canton/1",
              },
              "https://energy.ld.admin.ch/elcom/electricityprice-canton(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)https://energy.ld.admin.ch/elcom/electricityprice/dimension/period": Object {
                "type": "single",
                "value": "2011",
              },
              "https://energy.ld.admin.ch/elcom/electricityprice-canton(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)https://energy.ld.admin.ch/elcom/electricityprice/dimension/product": Object {
                "type": "single",
                "value": "https://energy.ld.admin.ch/elcom/electricityprice/product/cheapest",
              },
            },
            "iri": "https://energy.ld.admin.ch/elcom/electricityprice-canton",
            "joinBy": Array [
              "https://energy.ld.admin.ch/elcom/electricityprice-canton(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)https://energy.ld.admin.ch/elcom/electricityprice/dimension/period",
              "https://energy.ld.admin.ch/elcom/electricityprice-canton(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)https://energy.ld.admin.ch/elcom/electricityprice/dimension/canton",
            ],
          },
        ],
        "fields": Object {
          "segment": Object {
            "colorMapping": Object {
              "https://energy.ld.admin.ch/elcom/electricityprice/category/C1": "#1f77b4",
              "https://energy.ld.admin.ch/elcom/electricityprice/category/C2": "#ff7f0e",
              "https://energy.ld.admin.ch/elcom/electricityprice/category/C3": "#2ca02c",
              "https://energy.ld.admin.ch/elcom/electricityprice/category/C4": "#d62728",
              "https://energy.ld.admin.ch/elcom/electricityprice/category/C5": "#9467bd",
              "https://energy.ld.admin.ch/elcom/electricityprice/category/C6": "#8c564b",
              "https://energy.ld.admin.ch/elcom/electricityprice/category/C7": "#e377c2",
              "https://energy.ld.admin.ch/elcom/electricityprice/category/H1": "#7f7f7f",
              "https://energy.ld.admin.ch/elcom/electricityprice/category/H2": "#bcbd22",
              "https://energy.ld.admin.ch/elcom/electricityprice/category/H3": "#17becf",
              "https://energy.ld.admin.ch/elcom/electricityprice/category/H4": "#1f77b4",
              "https://energy.ld.admin.ch/elcom/electricityprice/category/H5": "#ff7f0e",
              "https://energy.ld.admin.ch/elcom/electricityprice/category/H6": "#2ca02c",
              "https://energy.ld.admin.ch/elcom/electricityprice/category/H7": "#d62728",
              "https://energy.ld.admin.ch/elcom/electricityprice/category/H8": "#9467bd",
            },
            "componentId": "https://energy.ld.admin.ch/elcom/electricityprice-canton(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)https://energy.ld.admin.ch/elcom/electricityprice/dimension/category",
            "palette": "category10",
            "sorting": Object {
              "sortingOrder": "asc",
              "sortingType": "byMeasure",
            },
          },
          "y": Object {
            "componentId": "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/AnzahlAnlagen",
          },
        },
        "interactiveFiltersConfig": Object {
          "calculation": Object {
            "active": false,
            "type": "identity",
          },
          "dataFilters": Object {
            "active": false,
            "componentIds": Array [],
          },
          "legend": Object {
            "active": false,
            "componentId": "",
          },
          "timeRange": Object {
            "active": false,
            "componentId": "",
            "presets": Object {
              "from": "",
              "to": "",
              "type": "range",
            },
          },
        },
        "key": "ydBHrv26xvUg",
        "meta": Object {
          "description": Object {
            "de": "",
            "en": "",
            "fr": "",
            "it": "",
          },
          "label": Object {
            "de": "",
            "en": "",
            "fr": "",
            "it": "",
          },
          "title": Object {
            "de": "",
            "en": "",
            "fr": "",
            "it": "",
          },
        },
        "version": "4.0.0",
      }
    `);
  });

  it("should remove filters in case of table", () => {
    const state = configJoinedCubes.table!;
    const derived = deriveFiltersFromFields(state, {
      dimensions: dimensionsJoinedCubes,
    });
    expect(derived.cubes.map((c) => c.filters)).toMatchInlineSnapshot(`
      Array [
        Object {},
        Object {},
      ]
    `);
  });
});

describe("handleChartFieldChanged", () => {
  it("should not reset symbol layer when it's being updated", () => {
    getCachedComponents.mockImplementation(
      () => getCachedComponentsMock.geoAndNumerical
    );
    const state = configStateMock.map;

    const newState = produce(state, (state: ConfiguratorState) =>
      handleChartFieldChanged(state, {
        type: "CHART_FIELD_CHANGED",
        value: {
          locale: "en",
          field: "symbolLayer",
          componentId:
            "mapDataset(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)symbolLayerIri",
        },
      })
    );

    expect(
      (newState.chartConfigs[0] as any).fields.symbolLayer.color
    ).toBeDefined();
  });
});

describe("colorMapping", () => {
  it("should correctly reset color mapping", () => {
    const state: ConfiguratorStateConfiguringChart = configStateMock.map;

    const newState = produce(state, (state: ConfiguratorState) =>
      updateColorMapping(state, {
        type: "CHART_CONFIG_UPDATE_COLOR_MAPPING",
        value: {
          field: "areaLayer",
          colorConfigPath: "color",
          dimensionId: "year-period-1",
          values: [
            { value: "red", label: "red", color: "red" },
            { value: "green", label: "green", color: "green" },
            { value: "blue", label: "blue", color: "blue" },
          ],
          random: false,
        },
      })
    );

    expect(
      (getChartConfig(newState).fields as any).areaLayer.color.colorMapping
    ).toEqual({
      red: "red",
      green: "green",
      blue: "blue",
    });
  });

  it("should use dimension colors if present", () => {
    getCachedComponents.mockImplementation(
      () => getCachedComponentsMock.geoAndNumerical
    );
    const state = {
      state: "CONFIGURING_CHART",
      dataSource: {
        type: "sparql",
        url: "fakeUrl",
      },
      chartConfigs: [
        {
          key: "abc",
          chartType: "column",
          fields: {
            y: {
              componentId: "measure",
            },
          },
          cubes: [
            {
              iri: "",
              filters: {},
            },
          ],
        },
      ],
      activeChartKey: "abc",
    } as ConfiguratorStateConfiguringChart;

    handleChartFieldChanged(state, {
      type: "CHART_FIELD_CHANGED",
      value: {
        locale: "en",
        field: "segment",
        componentId:
          "mapDataset(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)newAreaLayerColorIri",
      },
    });

    const chartConfig = state.chartConfigs[0] as ColumnConfig;

    expect(
      chartConfig.fields.segment?.componentId ===
        "mapDataset(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)newAreaLayerColorIri"
    );
    expect(chartConfig.fields.segment?.palette === "dimension");
    expect(chartConfig.fields.segment?.colorMapping).toEqual({
      orange: "rgb(255, 153, 0)",
    });
  });
});

describe("filtering", () => {
  it("should add range filter", () => {
    const draft = {
      chartConfigs: [{ key: "ABC", cubes: [{ iri: "foo", filters: {} }] }],
      activeChartKey: "ABC",
    } as any as ConfiguratorStateConfiguringChart;
    const action: Extract<
      ConfiguratorStateAction,
      { type: "CHART_CONFIG_FILTER_SET_RANGE" }
    > = {
      type: "CHART_CONFIG_FILTER_SET_RANGE",
      value: {
        dimension: { cubeIri: "foo", id: "time" } as any as Dimension,
        from: "2010",
        to: "2014",
      },
    };

    setRangeFilter(draft, action);

    expect(draft.chartConfigs[0].cubes[0].filters).toEqual({
      time: { type: "range", from: "2010", to: "2014" },
    });
  });

  it("should add range filters to every cube if using joinBy dimension", () => {
    const draft = {
      chartConfigs: [
        {
          key: "ABC",
          cubes: [
            { iri: "foo1", filters: {} },
            { iri: "foo2", filters: {} },
            { iri: "foo3", filters: {} },
          ],
        },
      ],
      activeChartKey: "ABC",
    } as any as ConfiguratorStateConfiguringChart;
    const action: Extract<
      ConfiguratorStateAction,
      { type: "CHART_CONFIG_FILTER_SET_RANGE" }
    > = {
      type: "CHART_CONFIG_FILTER_SET_RANGE",
      value: {
        dimension: {
          isJoinByDimension: true,
          originalIds: [
            {
              cubeIri: "foo1",
              dimensionId: "time1",
            },
            {
              cubeIri: "foo2",
              dimensionId: "time2",
            },
            {
              cubeIri: "foo3",
              dimensionId: "time3",
            },
          ],
        } as any as Dimension,
        from: "2010",
        to: "2014",
      },
    };

    setRangeFilter(draft, action);

    expect(draft.chartConfigs[0].cubes.map((cube) => cube.filters)).toEqual([
      { time1: { type: "range", from: "2010", to: "2014" } },
      { time2: { type: "range", from: "2010", to: "2014" } },
      { time3: { type: "range", from: "2010", to: "2014" } },
    ]);
  });
});

describe("retainChartConfigWhenSwitchingChartType", () => {
  const dataSetMetadata = covid19Metadata.data.dataCubeByIri;
  const dimensions = (dataSetMetadata.dimensions as any as Dimension[]).map(
    (d) => ({
      ...d,
      id: stringifyComponentId({
        unversionedCubeIri: "foo",
        unversionedComponentIri: d.id,
      }),
    })
  );
  const measures = (dataSetMetadata.measures as any as Measure[]).map((m) => ({
    ...m,
    id: stringifyComponentId({
      unversionedCubeIri: "foo",
      unversionedComponentIri: m.id,
    }),
  }));

  const deriveNewChartConfig = (
    oldConfig: ChartConfig,
    newChartType: ChartType
  ) => {
    const newConfig = createDraft(
      getChartConfigAdjustedToChartType({
        chartConfig: oldConfig,
        newChartType,
        dimensions,
        measures,
      })
    );
    deriveFiltersFromFields(newConfig, {
      dimensions,
    });

    return current(newConfig);
  };

  type CheckType = {
    newChartType: ChartType;
    checks: {
      comparisonChecks: {
        oldFieldGetterPath: string | string[];
        newFieldGetterPath: string | string[];
        equal: boolean;
      }[];
      oldConfigChecks?: {
        fieldGetterPath: string | string[];
        expectedValue: any;
      }[];
      newConfigChecks?: {
        fieldGetterPath: string | string[];
        expectedValue: any;
      }[];
    };
  };

  const xyChecks: CheckType[] = [
    {
      newChartType: "pie",
      checks: {
        comparisonChecks: [
          {
            oldFieldGetterPath: "fields.y.componentId",
            newFieldGetterPath: "fields.y.componentId",
            equal: true,
          },
        ],
      },
    },
    {
      newChartType: "column",
      checks: {
        comparisonChecks: [
          {
            oldFieldGetterPath: "fields.segment.componentId",
            newFieldGetterPath: "fields.segment.componentId",
            equal: true,
          },
        ],
      },
    },
    {
      newChartType: "map",
      checks: {
        comparisonChecks: [
          {
            oldFieldGetterPath: "fields.x.componentId",
            newFieldGetterPath: "fields.areaLayer.componentId",
            equal: false,
          },
          {
            oldFieldGetterPath: [
              "filters",
              "foo(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)https://environment.ld.admin.ch/foen/COVID19VaccPersons_v2/type",
            ],
            newFieldGetterPath: [
              "filters",
              "foo(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)https://environment.ld.admin.ch/foen/COVID19VaccPersons_v2/type",
            ],
            equal: true,
          },
        ],
      },
    },
    {
      newChartType: "column",
      checks: {
        comparisonChecks: [
          {
            oldFieldGetterPath: "fields.areaLayer.componentId",
            newFieldGetterPath: "fields.x.componentId",
            equal: true,
          },
        ],
      },
    },
    {
      newChartType: "line",
      checks: {
        comparisonChecks: [
          {
            oldFieldGetterPath: "fields.x.componentId",
            newFieldGetterPath: "fields.x.componentId",
            equal: false,
          },
        ],
      },
    },
  ];

  const segmentChecks: CheckType[] = [
    {
      newChartType: "column",
      checks: {
        comparisonChecks: [
          {
            oldFieldGetterPath: [
              "fields",
              "foo(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)https://environment.ld.admin.ch/foen/COVID19VaccPersons_v2/date",
              "componentId",
            ],
            newFieldGetterPath: "fields.segment.componentId",
            equal: true,
          },
        ],
        // Fixture is initially grouped by TemporalDimension and GeoShapesDimension.
        oldConfigChecks: [
          {
            fieldGetterPath: [
              "fields",
              "foo(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)https://environment.ld.admin.ch/foen/COVID19VaccPersons_v2/date",
              "isGroup",
            ],
            expectedValue: true,
          },
          {
            fieldGetterPath: [
              "fields",
              "foo(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)https://environment.ld.admin.ch/foen/COVID19VaccPersons_v2/georegion",
              "isGroup",
            ],
            expectedValue: true,
          },
        ],
      },
    },
    {
      newChartType: "table",
      checks: {
        comparisonChecks: [
          {
            oldFieldGetterPath: "fields.segment.componentId",
            newFieldGetterPath: [
              "fields",
              "foo(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)https://environment.ld.admin.ch/foen/COVID19VaccPersons_v2/date",
              "componentId",
            ],
            equal: true,
          },
        ],
        newConfigChecks: [
          // Table should be grouped by a segment from previous chart.
          {
            fieldGetterPath: [
              "fields",
              "foo(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)https://environment.ld.admin.ch/foen/COVID19VaccPersons_v2/date",
              "isGroup",
            ],
            expectedValue: true,
          },
        ],
      },
    },
  ];

  const runChecks = (config: ChartConfig, checks: CheckType[]) => {
    let oldConfig = config;
    let newConfig: ChartConfig;

    for (const {
      newChartType,
      checks: { comparisonChecks, oldConfigChecks, newConfigChecks },
    } of checks) {
      newConfig = deriveNewChartConfig(oldConfig, newChartType);

      for (const check of comparisonChecks) {
        const { oldFieldGetterPath, newFieldGetterPath, equal } = check;
        const oldField = get(oldConfig, oldFieldGetterPath);
        const newField = get(newConfig, newFieldGetterPath);

        if (equal) {
          expect(oldField).toEqual(newField);
        } else {
          expect(oldField).not.toEqual(newField);
        }
      }

      if (oldConfigChecks) {
        for (const check of oldConfigChecks) {
          const { fieldGetterPath, expectedValue } = check;

          const field = get(oldConfig, fieldGetterPath);
          expect(field).toEqual(expectedValue);
        }
      }

      if (newConfigChecks) {
        for (const check of newConfigChecks) {
          const { fieldGetterPath, expectedValue } = check;

          const field = get(newConfig, fieldGetterPath);
          expect(field).toEqual(expectedValue);
        }
      }

      oldConfig = newConfig;
    }
  };

  it("should retain appropriate x & y fields and discard the others", async () => {
    runChecks(
      await migrateChartConfig(covid19ColumnChartConfig, {
        migrationProps: {
          meta: {},
          dataSet: "foo",
          dataSource: {
            type: "sparql",
            url: "",
          },
        },
      }),
      xyChecks
    );
  });

  it("should retain appropriate segment fields and discard the others", async () => {
    getCachedComponents.mockImplementation(() => ({
      dimensions,
      measures,
    }));
    const config = await migrateChartConfig(covid19TableChartConfig, {
      migrationProps: {
        meta: {},
        dataSet: "foo",
        dataSource: {
          type: "sparql",
          url: "",
        },
      },
    });
    runChecks(config, segmentChecks);
  });
});

describe("handleChartOptionChanged", () => {
  it("should set required scale properties", () => {
    const state = {
      state: "CONFIGURING_CHART",
      dataSource: {
        type: "sparql",
        url: "fakeUrl",
      },
      chartConfigs: [
        {
          key: "bac",
          chartType: "map",
          cubes: [
            {
              iri: "mapDataset",
              filters: {},
            },
          ],
          fields: {
            areaLayer: {
              componentId: "areaLayerIri",
              color: {
                type: "numerical",
                componentId: "areaLayerColorIri",
                palette: "oranges",
                scaleType: "continuous",
                interpolationType: "linear",
              },
            },
          },
          filters: {},
        },
      ],
      activeChartKey: "bac",
    } as unknown as ConfiguratorStateConfiguringChart;

    handleChartOptionChanged(state, {
      type: "CHART_OPTION_CHANGED",
      value: {
        locale: "en",
        field: "areaLayer",
        path: "color.scaleType",
        value: "discrete",
      },
    });

    expect(
      (state.chartConfigs[0] as any).fields.areaLayer.color.nbClass
    ).toBeTruthy();
  });

  it("should reset previous color filters", () => {
    const state = {
      state: "CONFIGURING_CHART",
      dataSource: {
        type: "sparql",
        url: "fakeUrl",
      },
      chartConfigs: [
        {
          key: "cab",
          chartType: "map",
          fields: {
            areaLayer: {
              componentId: "areaLayerIri",
              color: {
                type: "categorical",
                componentId: "areaLayerColorIri",
                palette: "dimension",
                colorMapping: {
                  red: "green",
                  green: "blue",
                  blue: "red",
                },
              },
            },
          },
          cubes: [
            {
              iri: "mapDataset",
              filters: {
                areaLayerColorId: {
                  type: "multi",
                  values: {
                    red: true,
                    green: true,
                  },
                },
              },
            },
          ],
        },
      ],
      activeChartKey: "cab",
    } as unknown as ConfiguratorStateConfiguringChart;

    handleChartOptionChanged(state, {
      type: "CHART_OPTION_CHANGED",
      value: {
        locale: "en",
        field: "areaLayer",
        path: "color.componentId",
        value: "newAreaLayerColorIri",
      },
    });

    expect(Object.keys(state.chartConfigs[0].cubes[0].filters)).not.toContain(
      "areaLayerColorIri"
    );
  });
});

describe("ensureDashboardLayoutIsCorrect", () => {
  const state = configStateMock.map;
  const newState = produce(state, (state: ConfiguratorState) => {
    assert(
      state.state === "CONFIGURING_CHART",
      "State should be CONFIGURING_CHART"
    );
    state.layout.type = "dashboard";
    assert(
      state.layout.type === "dashboard",
      "Layout type should be dashboard"
    );
    state.layout.layout = "canvas";
    assert(state.layout.layout === "canvas", "Layout type should be canvas");
    state.layout.layouts = { xl: [], lg: [], md: [], sm: [] };
    state.chartConfigs.push({
      ...state.chartConfigs[0],
      key: "newKey",
    });
    ensureDashboardLayoutIsCorrect(state);
    return state;
  });
  expect((newState as any).layout.layouts.lg.length).toBe(2);
});
