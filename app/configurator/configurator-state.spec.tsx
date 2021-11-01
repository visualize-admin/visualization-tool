import { Client } from "@urql/core";
import {
  getLocalStorageKey,
  initChartStateFromChart,
  initChartStateFromLocalStorage,
  initChartStateFromDataset,
} from "./configurator-state";
import * as api from "../api";
import { data as fakeVizFixture } from "../test/__fixtures/prod/line-1.json";
import bathingWaterMetadata from "../test/__fixtures/api/DataCubeMetadataWithComponentValues-bathingWater.json";

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

describe("initChartStateFromDataset", () => {
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
    const res = await initChartStateFromDataset(
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
