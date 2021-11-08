import { Client } from "@urql/core";
import { applyDimensionToFilters } from ".";
import * as api from "../api";
import { DimensionMetaDataFragment } from "../graphql/query-hooks";
import bathingWaterMetadata from "../test/__fixtures/api/DataCubeMetadataWithComponentValues-bathingWater.json";
import { data as fakeVizFixture } from "../test/__fixtures/prod/line-1.json";
import {
  getLocalStorageKey,
  initChartStateFromChart,
  initChartStateFromCube,
  initChartStateFromLocalStorage,
} from "./configurator-state";

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
        state: "SELECTING_CHART_TYPE",
      })
    );
  });
});

describe("deriveFiltersFromField", () => {
  const dimension = {
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

  const _applyDimensionToFilters = (
    filters: any,
    isHidden: boolean,
    isGrouped: boolean
  ) => applyDimensionToFilters(filters, dimension, isHidden, isGrouped);

  it("should remove single value filter", () => {
    const initialFiltersState = {
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": {
        type: "single",
        value: "E.coli",
      },
    };
    const expectedFiltersState = {};

    _applyDimensionToFilters(initialFiltersState, false, false);
    expect(initialFiltersState).toEqual(expectedFiltersState);
  });

  it("should add single value filter for empty filter if hidden and not grouped", () => {
    const initialFiltersState = {};
    const expectedFiltersState = {
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": {
        type: "single",
        value: "E.coli",
      },
    };

    _applyDimensionToFilters(initialFiltersState, true, false);
    expect(initialFiltersState).toEqual(expectedFiltersState);
  });

  it("should add single value filter for multi filter if hidden and not grouped", () => {
    const initialFiltersState = {
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": {
        type: "multi",
        values: { "E.coli": true, Enterokokken: true },
      },
    };
    const expectedFiltersState = {
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": {
        type: "single",
        value: "E.coli",
      },
    };

    _applyDimensionToFilters(initialFiltersState, true, false);
    expect(initialFiltersState).toEqual(expectedFiltersState);
  });

  it("should add single value filter for range filter if hidden", () => {
    const initialFiltersState = {
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": {
        from: "2007-05-21",
        to: "2020-09-28",
        type: "range",
      },
    };
    const expectedFiltersState = {
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": {
        type: "single",
        value: "2007-05-21",
      },
    };

    _applyDimensionToFilters(initialFiltersState, true, false);
    expect(initialFiltersState).toEqual(expectedFiltersState);
  });

  it("should not modify filters for multi filter if not hidden and grouped", () => {
    const initialFiltersState = {
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": {
        type: "multi",
        values: { "E.coli": false, Enterokokken: true },
      },
    };
    const expectedFiltersState = {
      "https://environment.ld.admin.ch/foen/ubd0104/parametertype": {
        type: "multi",
        values: { "E.coli": false, Enterokokken: true },
      },
    };

    _applyDimensionToFilters(initialFiltersState, false, true);
    expect(initialFiltersState).toEqual(expectedFiltersState);
  });
});
