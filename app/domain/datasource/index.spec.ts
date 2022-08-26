import { act, renderHook } from "@testing-library/react-hooks";
import mittEmitter from "next/dist/shared/lib/mitt";
import Router from "next/router";

import { createUseDataSourceStore } from "@/stores/data-source";

jest.mock("next/router", () => ({
  pathname: "https://visualize.admin.ch/",
  events: mittEmitter(),
  isReady: true,
  query: {},
  ready: (f: () => void) => f(),
  replace: (args: unknown) => {
    Object.assign(Router, args);

    const url = new URL(Router.pathname);
    Object.entries(Router.query).forEach(([k, v]) => {
      if (typeof v === "string") {
        url.searchParams.append(k, v);
      }
    });

    // @ts-ignore
    delete window.location;
    // @ts-ignore
    window.location = {
      href: url.toString(),
    };

    Router.events.emit("routeChangeComplete");
  },
}));

jest.mock("../env", () => ({
  WHITELISTED_DATA_SOURCES: ["Test", "Prod", "Int"],
  ENDPOINT: "sparql+https://lindas.admin.ch/query",
}));

describe("datasource state hook", () => {
  const setup = ({
    localStorageValue = undefined as string | undefined,
    initialURL = "https://visualize.admin.ch",
  } = {}) => {
    if (localStorageValue) {
      localStorage.setItem("dataSource", localStorageValue);
    }

    const url = new URL(initialURL);
    const urlDataSourceLabel = url.searchParams.get("dataSource");
    Router.query = urlDataSourceLabel ? { dataSource: urlDataSourceLabel } : {};

    // @ts-ignore
    delete window.location;
    // @ts-ignore
    window.location = {
      href: url.toString(),
    };

    const useDataSourceStore = createUseDataSourceStore();

    const hook = renderHook(() => useDataSourceStore());

    return {
      hook,
      router: Router,
      getState: () => hook.result.current.dataSource,
      setState: (v: Parameters<typeof hook.result.current.setDataSource>[0]) =>
        hook.result.current.setDataSource(v),
    };
  };

  beforeEach(() => {
    localStorage.clear();
    Router.events = mittEmitter();
  });

  it("should have the correct default state when nothing is there", () => {
    const { getState } = setup({
      initialURL: "https://visualize.admin.ch/",
      localStorageValue: "Test",
    });
    expect(getState()).toEqual({
      type: "sparql",
      url: "https://test.lindas.admin.ch/query",
    });
  });

  it("should have the correct default state from local storage", () => {
    const { getState } = setup({
      localStorageValue: "Prod",
    });
    expect(getState()).toEqual({
      type: "sparql",
      url: "https://lindas.admin.ch/query",
    });
  });

  it("should have the correct default state from URL in priority", () => {
    const { getState } = setup({
      initialURL: "https://visualize.admin.ch/?dataSource=Test",
      localStorageValue: "Prod",
    });
    expect(getState()).toEqual({
      type: "sparql",
      url: "https://test.lindas.admin.ch/query",
    });
  });

  it("should keep both localStorage and router updated", () => {
    const { router, setState } = setup({
      initialURL: "https://visualize.admin.ch/?dataSource=Int",
      localStorageValue: "Test",
    });
    act(() => {
      setState({ type: "sparql", url: "https://lindas.admin.ch/query" });
    });
    expect(router.query.dataSource).toBe("Prod");
    expect(localStorage.getItem("dataSource")).toBe("Prod");
  });
});
