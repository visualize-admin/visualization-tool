import { Client } from "@urql/core";
import { createDraft, current } from "immer";
import get from "lodash/get";

import { getChartConfigAdjustedToChartType } from "@/charts";
import {
  ChartConfig,
  ChartType,
  ColumnConfig,
  ConfiguratorStateConfiguringChart,
  DataSource,
  MapConfig,
  TableConfig,
} from "@/config-types";
import {
  applyNonTableDimensionToFilters,
  applyTableDimensionToFilters,
  deriveFiltersFromFields,
  getFiltersByMappingStatus,
  getLocalStorageKey,
  handleChartFieldChanged,
  handleChartOptionChanged,
  initChartStateFromChart,
  initChartStateFromCube,
  initChartStateFromLocalStorage,
  moveFilterField,
  updateColorMapping,
} from "@/configurator/configurator-state";
import {
  DimensionMetadataFragment,
  DimensionMetadataWithHierarchiesFragment,
} from "@/graphql/query-hooks";
import { DataCubeMetadata } from "@/graphql/types";
import covid19ColumnChartConfig from "@/test/__fixtures/config/dev/chartConfig-column-covid19.json";
import covid19TableChartConfig from "@/test/__fixtures/config/dev/chartConfig-table-covid19.json";
import { data as fakeVizFixture } from "@/test/__fixtures/config/prod/line-1.json";
import bathingWaterMetadata from "@/test/__fixtures/data/DataCubeMetadataWithComponentValues-bathingWater.json";
import covid19Metadata from "@/test/__fixtures/data/DataCubeMetadataWithComponentValues-covid19.json";
import * as api from "@/utils/chart-config/api";
import { migrateChartConfig } from "@/utils/chart-config/versioning";

const mockedApi = api as jest.Mocked<typeof api>;

jest.mock("@/utils/chart-config/api", () => ({
  fetchChartConfig: jest.fn(),
}));

jest.mock("@/graphql/client", () => {
  return {
    client: {
      readQuery: () => {
        return {
          data: {
            dataCubeByIri: {
              dimensions: [
                {
                  __typename: "GeoShapesDimension",
                  iri: "newAreaLayerColorIri",
                  values: [
                    {
                      value: "orange",
                      label: "orange",
                      color: "rgb(255, 153, 0)",
                    },
                  ],
                },
                {
                  __typename: "GeoCoordinatesDimension",
                  iri: "symbolLayerIri",
                  values: [{ value: "x", label: "y" }],
                },
              ],
              measures: [
                {
                  __typename: "NumericalMeasure",
                  iri: "measure",
                },
              ],
            },
          },
        };
      },
    },
  };
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("initChartStateFromChart", () => {
  const setup = ({ chartConfig }: { chartConfig: object }) => {
    mockedApi.fetchChartConfig.mockResolvedValue(
      chartConfig as ReturnType<typeof api.fetchChartConfig>
    );
  };
  it("should fetch work if existing chart is valid", async () => {
    setup({
      chartConfig: {
        data: fakeVizFixture,
      },
    });
    const state = await initChartStateFromChart("abcde");
    expect(state).toEqual(expect.objectContaining(fakeVizFixture));
  });

  it("should return undefined if chart is invalid", async () => {
    jest.spyOn(console, "warn").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});

    setup({
      chartConfig: {
        isBadState: true,
      },
    });
    const state = await initChartStateFromChart("abcde");
    expect(state).toEqual(undefined);
  });
});

describe("initChartFromLocalStorage", () => {
  it("should initialize from localStorage if valid", async () => {
    localStorage.setItem(
      getLocalStorageKey("viz1234"),
      JSON.stringify({ state: "CONFIGURING_CHART", ...fakeVizFixture })
    );
    const state = await initChartStateFromLocalStorage("viz1234");
    expect(state).not.toBeUndefined();
  });

  it("should return undefined and remove key from localStorage if invalid", async () => {
    jest.spyOn(console, "warn").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});

    localStorage.setItem(getLocalStorageKey("viz1234"), "abcde");
    const state = await initChartStateFromLocalStorage("viz1234");
    expect(state).toBeUndefined();
    expect(localStorage.getItem(getLocalStorageKey("viz1234"))).toBe(null);
  });
});

describe("initChartStateFromCube", () => {
  const setup = ({ cubeMetadata }: { cubeMetadata: object }) => {
    const client = new Client({
      url: "https://example.com/graphql",
    });

    // @ts-ignore
    jest.spyOn(client, "query").mockReturnValue({
      toPromise: jest.fn().mockResolvedValue(cubeMetadata),
    });

    return { client };
  };
  it("should work init fields with existing dataset and go directly to 2nd step", async () => {
    const { client } = setup({ cubeMetadata: bathingWaterMetadata });
    const dataSource: DataSource = {
      url: "https://example.com/api",
      type: "sparql",
    };
    const res = await initChartStateFromCube(
      client,
      "https://environment.ld.admin.ch/foen/ubd0104/3/",
      dataSource,
      "en"
    );
    expect(res).toEqual(
      expect.objectContaining({
        state: "CONFIGURING_CHART",
      })
    );
  });
});

describe("applyDimensionToFilters", () => {
  const keyDimension = {
    iri: "https://environment.ld.admin.ch/foen/ubd0104/parametertype",
    label: "Parameter",
    isKeyDimension: true,
    values: [
      { value: "E.coli", label: "E.coli" },
      { value: "Enterokokken", label: "Enterokokken" },
    ],
    unit: null,
    __typename: "NominalDimension",
  } as DimensionMetadataFragment;

  const keyDimensionWithHierarchy = {
    __typename: "NominalDimension",
    iri: "nominalDimensionIri",
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
        dimensionIri: "nominalDimensionIri",
        value: "brienz",
        label: "Brienz",
        depth: 0,
        hasValue: true,
        children: [],
      },
      {
        __typename: "HierarchyValue",
        dimensionIri: "nominalDimensionIri",
        value: "switzerland",
        label: "Switzerland",
        depth: -1,
        hasValue: true,
        children: [],
      },
    ],
  } as DimensionMetadataWithHierarchiesFragment;

  const optionalDimension = {
    iri: "https://environment.ld.admin.ch/foen/ubd0104/parametertype",
    label: "Parameter",
    isKeyDimension: false,
    values: [
      { value: "E.coli", label: "E.coli" },
      { value: "Enterokokken", label: "Enterokokken" },
    ],
    unit: null,
    __typename: "NominalDimension",
  } as DimensionMetadataFragment;

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
      });

      expect(initialFilters).toEqual(expectedFilters);
    });

    it("should select top-most hierarchy value by default", () => {
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
      });

      expect(initialFilters).toEqual(expectedFilters);
    });
  });
});

describe("moveField", () => {
  const chartConfig = {
    state: "CONFIGURING",
    filters: {
      species: {
        type: "single",
        value: "penguins",
      },
      date: {
        type: "single",
        value: "2020.11.20",
      },
    },
  } as unknown as ChartConfig;

  it("should be possible to move an existing field up", () => {
    const newChartConfig = moveFilterField(chartConfig, {
      dimensionIri: "date",
      delta: -1,
      possibleValues: ["2020.11.20", "2020.11.10"],
    });
    expect(Object.keys(newChartConfig.filters)).toEqual(["date", "species"]);
    expect(Object.values(newChartConfig.filters)).toEqual([
      { type: "single", value: "2020.11.20" },
      { type: "single", value: "penguins" },
    ]);
  });

  it("should be possible to move an existing field down", () => {
    const newChartConfig = moveFilterField(chartConfig, {
      dimensionIri: "species",
      delta: 1,
      possibleValues: ["penguins", "tigers"],
    });
    expect(Object.keys(newChartConfig.filters)).toEqual(["date", "species"]);
    expect(Object.values(newChartConfig.filters)).toEqual([
      { type: "single", value: "2020.11.20" },
      { type: "single", value: "penguins" },
    ]);
  });

  it("should be possible to move an absent field up", () => {
    const newChartConfig = moveFilterField(chartConfig, {
      dimensionIri: "color",
      delta: -1,
      possibleValues: ["red", "blue"],
    });
    expect(Object.keys(newChartConfig.filters)).toEqual([
      "species",
      "color",
      "date",
    ]);
    expect(Object.values(newChartConfig.filters)).toEqual([
      { type: "single", value: "penguins" },
      { type: "single", value: "red" },
      { type: "single", value: "2020.11.20" },
    ]);
  });

  it("should not be possible to move an existing field too much above", () => {
    const newChartConfig = moveFilterField(chartConfig, {
      dimensionIri: "species",
      delta: -1,
      possibleValues: ["penguins", "tigers"],
    });
    expect(Object.keys(newChartConfig.filters)).toEqual(["species", "date"]);
    expect(Object.values(newChartConfig.filters)).toEqual([
      { type: "single", value: "penguins" },
      { type: "single", value: "2020.11.20" },
    ]);
  });

  it("should not be possible to move an existing field too much below", () => {
    const newChartConfig = moveFilterField(chartConfig, {
      dimensionIri: "date",
      delta: 1,
      possibleValues: ["penguins", "tigers"],
    });
    expect(Object.keys(newChartConfig.filters)).toEqual(["species", "date"]);
    expect(Object.values(newChartConfig.filters)).toEqual([
      { type: "single", value: "penguins" },
      { type: "single", value: "2020.11.20" },
    ]);
  });
});

describe("retainChartConfigWhenSwitchingChartType", () => {
  const dataSetMetadata = covid19Metadata.data
    .dataCubeByIri as unknown as DataCubeMetadata;

  const deriveNewChartConfig = (
    oldConfig: ChartConfig,
    newChartType: ChartType
  ) => {
    const newConfig = createDraft(
      getChartConfigAdjustedToChartType({
        chartConfig: oldConfig,
        newChartType,
        dimensions: dataSetMetadata.dimensions,
        measures: dataSetMetadata.measures,
      })
    );
    deriveFiltersFromFields(newConfig, dataSetMetadata.dimensions);

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
            oldFieldGetterPath: "fields.y.componentIri",
            newFieldGetterPath: "fields.y.componentIri",
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
            oldFieldGetterPath: "fields.segment.componentIri",
            newFieldGetterPath: "fields.segment.componentIri",
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
            oldFieldGetterPath: "fields.x.componentIri",
            newFieldGetterPath: "fields.areaLayer.componentIri",
            equal: false,
          },
          {
            oldFieldGetterPath: [
              "filters",
              "https://environment.ld.admin.ch/foen/COVID19VaccPersons_v2/type",
            ],
            newFieldGetterPath: [
              "filters",
              "https://environment.ld.admin.ch/foen/COVID19VaccPersons_v2/type",
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
            oldFieldGetterPath: "fields.areaLayer.componentIri",
            newFieldGetterPath: "fields.x.componentIri",
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
            oldFieldGetterPath: "fields.x.componentIri",
            newFieldGetterPath: "fields.x.componentIri",
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
              "https://environment.ld.admin.ch/foen/COVID19VaccPersons_v2/georegion",
              "componentIri",
            ],
            newFieldGetterPath: "fields.segment.componentIri",
            equal: true,
          },
        ],
        // Fixture is initially grouped by TemporalDimension and GeoShapesDimension.
        oldConfigChecks: [
          {
            fieldGetterPath: [
              "fields",
              "https://environment.ld.admin.ch/foen/COVID19VaccPersons_v2/date",
              "isGroup",
            ],
            expectedValue: true,
          },
          {
            fieldGetterPath: [
              "fields",
              "https://environment.ld.admin.ch/foen/COVID19VaccPersons_v2/georegion",
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
            oldFieldGetterPath: "fields.segment.componentIri",
            newFieldGetterPath: [
              "fields",
              "https://environment.ld.admin.ch/foen/COVID19VaccPersons_v2/georegion",
              "componentIri",
            ],
            equal: true,
          },
        ],
        newConfigChecks: [
          // Table should be grouped by a segment from previous chart.
          {
            fieldGetterPath: [
              "fields",
              "https://environment.ld.admin.ch/foen/COVID19VaccPersons_v2/georegion",
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

  it("should retain appropriate x & y fields and discard the others", () => {
    runChecks(migrateChartConfig(covid19ColumnChartConfig), xyChecks);
  });

  it("should retain appropriate segment fields and discard the others", () => {
    runChecks(covid19TableChartConfig as unknown as TableConfig, segmentChecks);
  });
});

describe("getFiltersByMappingStatus", () => {
  it("should correctly retrieve categorical color iris", () => {
    const config = {
      chartType: "map",
      fields: {
        areaLayer: {
          componentIri: "areaIri",
          color: { type: "categorical", componentIri: "areaColorIri" },
        },
        symbolLayer: {
          componentIri: "symbolIri",
          color: { type: "categorical", componentIri: "symbolColorIri" },
        },
      },
    } as any as MapConfig;

    const { mappedFiltersIris } = getFiltersByMappingStatus(config);

    expect([...mappedFiltersIris]).toEqual(
      expect.arrayContaining(["areaColorIri", "symbolColorIri"])
    );
  });
});

describe("colorMapping", () => {
  it("should correctly reset color mapping", () => {
    const state = {
      state: "CONFIGURING_CHART",
      chartConfig: {
        fields: {
          areaLayer: {
            componentIri: "areaLayerIri",
            color: {
              type: "categorical",
              componentIri: "areaLayerColorIri",
              palette: "dimension",
              colorMapping: {
                red: "green",
                green: "blue",
                blue: "red",
              },
            },
          },
        },
      },
    };

    updateColorMapping(state as unknown as ConfiguratorStateConfiguringChart, {
      type: "CHART_CONFIG_UPDATE_COLOR_MAPPING",
      value: {
        field: "areaLayer",
        colorConfigPath: "color",
        dimensionIri: "areaLayerColorIri",
        values: [
          { value: "red", label: "red", color: "red" },
          { value: "green", label: "green", color: "green" },
          { value: "blue", label: "blue", color: "blue" },
        ],
        random: false,
      },
    });

    expect(state.chartConfig.fields.areaLayer.color.colorMapping).toEqual({
      red: "red",
      green: "green",
      blue: "blue",
    });
  });

  it("should use dimension colors if present", () => {
    const state = {
      state: "CONFIGURING_CHART",
      dataSource: {
        type: "sparql",
        url: "fakeUrl",
      },
      chartConfig: {
        chartType: "column",
        fields: {
          y: {
            componentIri: "measure",
          },
        },
        filters: {},
      },
    } as ConfiguratorStateConfiguringChart;

    handleChartFieldChanged(
      state as unknown as ConfiguratorStateConfiguringChart,
      {
        type: "CHART_FIELD_CHANGED",
        value: {
          locale: "en",
          field: "segment",
          componentIri: "newAreaLayerColorIri",
        },
      }
    );

    const chartConfig = state.chartConfig as ColumnConfig;

    expect(chartConfig.fields.segment?.componentIri === "newAreaLayerColorIri");
    expect(chartConfig.fields.segment?.palette === "dimension");
    expect(chartConfig.fields.segment?.colorMapping).toEqual({
      orange: "rgb(255, 153, 0)",
    });
  });
});

describe("handleChartFieldChanged", () => {
  it("should not reset symbol layer when it's being updated", () => {
    const state = {
      state: "CONFIGURING_CHART",
      dataSet: "mapDataset",
      dataSource: {
        type: "sparql",
        url: "fakeUrl",
      },
      chartConfig: {
        chartType: "map",
        fields: {
          symbolLayer: {
            componentIri: "symbolLayerIri",
            color: {
              type: "categorical",
              componentIri: "symbolLayerColorIri",
              palette: "oranges",
              colorMapping: {
                red: "green",
                green: "blue",
                blue: "red",
              },
            },
          },
        },
        filters: {},
      },
    };

    handleChartFieldChanged(
      state as unknown as ConfiguratorStateConfiguringChart,
      {
        type: "CHART_FIELD_CHANGED",
        value: {
          locale: "en",
          field: "symbolLayer",
          componentIri: "symbolLayerIri",
        },
      }
    );

    expect(state.chartConfig.fields.symbolLayer.color).toBeDefined();
  });
});

describe("handleChartOptionChanged", () => {
  it("should set required scale properties", () => {
    const state = {
      state: "CONFIGURING_CHART",
      dataSet: "mapDataset",
      dataSource: {
        type: "sparql",
        url: "fakeUrl",
      },
      chartConfig: {
        chartType: "map",
        fields: {
          areaLayer: {
            componentIri: "areaLayerIri",
            color: {
              type: "numerical",
              componentIri: "areaLayerColorIri",
              palette: "oranges",
              scaleType: "continuous",
              interpolationType: "linear",
            },
          },
        },
        filters: {},
      },
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
      (state.chartConfig as any).fields.areaLayer.color.nbClass
    ).toBeTruthy();
  });

  it("should reset previous color filters", () => {
    const state = {
      state: "CONFIGURING_CHART",
      dataSet: "mapDataset",
      dataSource: {
        type: "sparql",
        url: "fakeUrl",
      },
      chartConfig: {
        chartType: "map",
        fields: {
          areaLayer: {
            componentIri: "areaLayerIri",
            color: {
              type: "categorical",
              componentIri: "areaLayerColorIri",
              palette: "dimension",
              colorMapping: {
                red: "green",
                green: "blue",
                blue: "red",
              },
            },
          },
        },
        filters: {
          areaLayerColorIri: {
            type: "multi",
            values: {
              red: true,
              green: true,
            },
          },
        },
      },
    } as unknown as ConfiguratorStateConfiguringChart;

    handleChartOptionChanged(state, {
      type: "CHART_OPTION_CHANGED",
      value: {
        locale: "en",
        field: "areaLayer",
        path: "color.componentIri",
        value: "newAreaLayerColorIri",
      },
    });

    expect(Object.keys(state.chartConfig.filters)).not.toContain(
      "areaLayerColorIri"
    );
  });
});
