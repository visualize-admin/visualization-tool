import * as api from "@/api";
import {
  findPreferredDimension,
  getChartConfigAdjustedToChartType,
} from "@/charts";
import { ChartConfig } from "@/configurator";
import {
  applyNonTableDimensionToFilters,
  applyTableDimensionToFilters,
  deriveFiltersFromFields,
  getLocalStorageKey,
  initChartStateFromChart,
  initChartStateFromCube,
  initChartStateFromLocalStorage,
  moveFilterField,
} from "@/configurator/configurator-state";
import { getGeoShapesDimensions } from "@/domain/data";
import { DimensionMetaDataFragment } from "@/graphql/query-hooks";
import { DataCubeMetadata } from "@/graphql/types";
import bathingWaterMetadata from "@/test/__fixtures/api/DataCubeMetadataWithComponentValues-bathingWater.json";
import covid19Metadata from "@/test/__fixtures/api/DataCubeMetadataWithComponentValues-covid19.json";
import covid19ChartConfig from "@/test/__fixtures/dev/chartConfig-column-covid19.json";
import { data as fakeVizFixture } from "@/test/__fixtures/prod/line-1.json";
import { Client } from "@urql/core";
import { createDraft, current } from "immer";
import {
  ChartType,
  ColumnConfig,
  LineConfig,
  MapConfig,
  PieConfig,
} from "./config-types";

const mockedApi = api as jest.Mocked<typeof api>;

jest.mock("../api", () => ({
  fetchChartConfig: jest.fn(),
}));

afterEach(() => {
  jest.restoreAllMocks();
});

describe("initChartStateFromChart", () => {
  const setup = ({ chartConfig }: { chartConfig: object }) => {
    mockedApi.fetchChartConfig.mockResolvedValue(chartConfig);
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
    const res = await initChartStateFromCube(
      client,
      "https://environment.ld.admin.ch/foen/ubd0104/3/",
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
  } as DimensionMetaDataFragment;

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
  } as DimensionMetaDataFragment;

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
    .dataCubeByIri as DataCubeMetadata;
  let oldConfig: ChartConfig;
  let newConfig: ChartConfig;

  const deriveNewChartConfig = (
    oldConfig: ChartConfig,
    newChartType: ChartType
  ) => {
    const newConfig = createDraft(
      getChartConfigAdjustedToChartType({
        chartConfig: oldConfig,
        chartType: newChartType,
        dimensions: dataSetMetadata.dimensions,
        measures: dataSetMetadata.measures,
      })
    );
    deriveFiltersFromFields(newConfig, dataSetMetadata);

    return current(newConfig);
  };

  it("should retain appropriate chart config fields and discard the others", () => {
    oldConfig = covid19ChartConfig as ColumnConfig;
    newConfig = deriveNewChartConfig(oldConfig, "pie") as PieConfig;

    // It should retain Y component iri between column and pie chart.
    expect(newConfig.fields.y.componentIri).toEqual(
      oldConfig.fields.y.componentIri
    );

    oldConfig = newConfig;
    newConfig = deriveNewChartConfig(oldConfig, "column") as ColumnConfig;

    // It should retain segment component iri when switching between charts
    // that use segment field.
    expect(newConfig.fields.segment?.componentIri).toEqual(
      oldConfig.fields.segment.componentIri
    );

    oldConfig = newConfig;
    newConfig = deriveNewChartConfig(oldConfig, "map") as MapConfig;

    const expectedMapXComponentIri = getGeoShapesDimensions(
      dataSetMetadata.dimensions
    )[0].iri;

    // It should not retain TemporalDimension on the X axis when switching to a
    // map chart.
    expect(newConfig.fields.areaLayer.componentIri).toEqual(
      expectedMapXComponentIri
    );
    expect(newConfig.fields.areaLayer.componentIri).not.toEqual(
      oldConfig.fields.x.componentIri
    );

    oldConfig = newConfig;
    newConfig = deriveNewChartConfig(oldConfig, "column") as ColumnConfig;

    // It should retain GeoShapeDimension on the X axis for a column chart.
    expect(newConfig.fields.x.componentIri).toEqual(
      oldConfig.fields.areaLayer.componentIri
    );

    oldConfig = newConfig;
    newConfig = deriveNewChartConfig(oldConfig, "line") as LineConfig;

    const expectedLineXComponentIri = findPreferredDimension(
      dataSetMetadata.dimensions,
      "TemporalDimension"
    ).iri;

    // It should not retain GeoShapesDimension on the X axis when switching to
    // a line chart.
    expect(newConfig.fields.x.componentIri).toEqual(expectedLineXComponentIri);
    expect(newConfig.fields.x.componentIri).not.toEqual(
      oldConfig.fields.x.componentIri
    );
  });
});
