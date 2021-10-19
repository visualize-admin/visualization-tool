import {
  getLocalStorageKey,
  initChartStateFromExisting,
  initChartStateFromLocalStorage,
} from "./configurator-state";
import * as api from "../api";
import { jsxEmptyExpression } from "@babel/types";
import { data as fakeVizFixture } from "../test/__fixtures/prod/5BmzFXXNtE1X.json";

const mockedApi = api as jest.Mocked<typeof api>;

jest.mock("../api", () => ({
  fetchChartConfig: jest.fn(),
}));

afterEach(() => {
  jest.restoreAllMocks();
});

describe("initChartStateFromExisting", () => {
  const setup = ({ chartConfig }: { chartConfig: object }) => {
    mockedApi.fetchChartConfig.mockResolvedValue(chartConfig);
  };
  it("should fetch work if existing chart is valid", async () => {
    setup({
      chartConfig: {
        data: fakeVizFixture,
      },
    });
    const state = await initChartStateFromExisting("abcde");
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
    const state = await initChartStateFromExisting("abcde");
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
