import { act, renderHook } from "@testing-library/react-hooks";
import mittEmitter from "next/dist/shared/lib/mitt";
import { SingletonRouter } from "next/router";

import { createUseDataSourceStore } from "@/stores/data-source";

const createRouter = () => {
  const router = {
    pathname: "https://visualize.admin.ch/",
    events: mittEmitter(),
    isReady: true,
    query: {},
    ready: (f: () => void) => f(),
  } as SingletonRouter;
  // @ts-ignore
  router.replace = (args: unknown) => {
    Object.assign(router, args);

    const url = new URL(router.pathname);
    Object.entries(router.query).forEach(([k, v]) => {
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

    router.events.emit("routeChangeComplete");
  };

  return router;
};

jest.mock("../env", () => ({
  WHITELISTED_DATA_SOURCES: ["Test", "Prod", "Int"],
  ENDPOINT: "sparql+https://lindas.admin.ch/query", // Default is Prod in tests
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

    // @ts-ignore
    delete window.location;
    // @ts-ignore
    window.location = {
      href: url.toString(),
    };

    const router = createRouter();
    const useDataSourceStore = createUseDataSourceStore(router);
    const hook = renderHook(() => useDataSourceStore());

    return {
      hook,
      router,
      getState: () => hook.result.current.dataSource,
      setState: (v: Parameters<typeof hook.result.current.setDataSource>[0]) =>
        hook.result.current.setDataSource(v),
    };
  };

  beforeEach(() => {
    localStorage.clear();
  });

  it("should have the correct default state when nothing is there", () => {
    const { getState } = setup({
      initialURL: "https://visualize.admin.ch/",
      localStorageValue: "",
    });
    expect(getState()).toEqual({
      type: "sparql",
      url: "https://lindas.admin.ch/query",
    });
  });

  it("should have the correct default state from local storage", () => {
    const { getState, router } = setup({
      localStorageValue: "sparql+https://int.lindas.admin.ch/query",
    });
    expect(getState()).toEqual({
      type: "sparql",
      url: "https://int.lindas.admin.ch/query",
    });
    expect(router.query.dataSource).toBe("Int");
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

  it("should not update router when default value is used", () => {
    const { router } = setup({
      initialURL: "https://visualize.admin.ch/",
      localStorageValue: "",
    });
    expect(router.query.dataSource).toBeFalsy();
    expect(localStorage.getItem("dataSource")).toBeFalsy();
  });

  it("should update router when default value is used and another value is present", () => {
    const { router } = setup({
      initialURL: "https://visualize.admin.ch/?dataSource=Int",
      localStorageValue: "",
    });
    expect(router.query.dataSource).toBe("Int");
  });
});
