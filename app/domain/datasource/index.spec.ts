import { act, renderHook } from "@testing-library/react-hooks";
import mittEmitter from "next/dist/shared/lib/mitt";
import { useRouter } from "next/router";

import { useDataSourceState } from ".";

jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

jest.mock("../env", () => ({
  WHITELISTED_DATA_SOURCES: ["Test", "Prod", "Int"],
  ENDPOINT: "sparql+https://lindas.admin.ch/query",
}));

describe("datasource state hook", () => {
  beforeEach(() => {
    localStorage.clear();
  });
  const setup = ({
    initialRouterQuery = {} as Record<string, string>,
    localStorageValue = undefined as string | undefined,
    initialURL = "https://visualize.admin.ch",
  } = {}) => {
    if (localStorageValue) {
      localStorage.setItem("dataSource", localStorageValue);
    }

    // @ts-ignore
    delete window.location;
    // @ts-ignore
    window.location = {
      href: initialURL,
    };

    const router = {
      pathname: "/hello",
      query: initialRouterQuery,
      events: mittEmitter(),
      isReady: true,
      replace: (opts: Record<string, unknown>) => {
        Object.assign(router, opts);
        router.events.emit("routeChangeComplete");
      },
    };
    // @ts-ignore
    useRouter.mockImplementation(() => router);

    const hook = renderHook(() => useDataSourceState());
    return {
      hook,
      router,
      getState: () => hook.result.current[0],
      setState: (v: Parameters<typeof hook.result.current[1]>[0]) =>
        hook.result.current[1](v),
    };
  };

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
    const { getState } = setup({
      localStorageValue: "sparql+https://lindas.admin.ch/query",
    });
    expect(getState()).toEqual({
      type: "sparql",
      url: "https://lindas.admin.ch/query",
    });
  });

  it("should have the correct default state from URL in priority", () => {
    const { getState } = setup({
      initialURL: "https://visualize.admin.ch/?dataSource=Test",
      localStorageValue: "sparql+https://lindas.admin.ch/query",
    });
    expect(getState()).toEqual({
      type: "sparql",
      url: "https://test.lindas.admin.ch/query",
    });
  });

  it("should keep both localStorage and router updated", () => {
    const { router, setState } = setup({
      initialURL: "https://visualize.admin.ch/?dataSource=Int",
      localStorageValue: "sparql+https://lindas.admin.ch/query",
    });
    act(() => {
      setState("sparql+https://lindas.admin.ch/query");
    });
    expect(router.query.dataSource).toBe("Prod");
    expect(localStorage.getItem("dataSource")).toBe(
      "sparql+https://lindas.admin.ch/query"
    );
  });
});
