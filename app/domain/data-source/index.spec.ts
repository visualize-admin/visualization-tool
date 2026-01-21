import { act, renderHook } from "@testing-library/react";
import mittEmitter from "next/dist/shared/lib/mitt";
import { SingletonRouter } from "next/router";
import { beforeEach, describe, expect, it, Mock, vi } from "vitest";

import { createUseDataSourceStore } from "@/stores/data-source";
import { setURLParam } from "@/utils/router/helpers";

vi.mock("@/utils/router/helpers", async () => {
  const original = await vi.importActual("@/utils/router/helpers");
  return {
    getURLParam: original.getURLParam,
    setURLParam: vi.fn(),
  };
});

const createRouter = ({ query }: { query: Record<string, string> }) => {
  const router = {
    pathname: "https://visualize.admin.ch/",
    query: query || {},
    events: mittEmitter(),
    isReady: true,
    ready: (f: () => void) => {
      // Use setTimeout instead of invoking directly for the callbacks
      // to be called after the datasource has been correctly set up.
      // This follows the async nature of ready on the real router
      setTimeout(f, 0);
    },
  } as SingletonRouter;

  return router;
};

vi.mock("../env", () => ({
  WHITELISTED_DATA_SOURCES: ["Test", "Prod", "Int"],
  ENDPOINT: "sparql+https://lindas-cached.cluster.ldbar.ch/query", // Default is Prod in tests
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

    // Initialize router with a proper query based on initialUrl.
    const router = createRouter({
      query: { dataSource: urlDataSourceLabel } as Record<string, string>,
    });
    const useDataSourceStore = createUseDataSourceStore(router);
    const hook = renderHook(() => useDataSourceStore());

    const res = {
      hook,
      router,
      getState: () => hook.result.current.dataSource,
      setState: (v: Parameters<typeof hook.result.current.setDataSource>[0]) =>
        hook.result.current.setDataSource(v),
    };

    return new Promise<typeof res>((resolve) => {
      router.ready(() => resolve(res));
    });
  };

  beforeEach(() => {
    localStorage.clear();
    (setURLParam as Mock).mockClear();
  });

  it("should have the correct default state when nothing is there", async () => {
    const { getState } = await setup({
      initialURL: "https://visualize.admin.ch/",
      localStorageValue: undefined,
    });

    expect(getState()).toEqual({
      type: "sparql",
      url: "https://lindas-cached.cluster.ldbar.ch/query",
    });
  });

  it("should have the correct default state from local storage", async () => {
    const { getState } = await setup({
      initialURL: "https://visualize.admin.ch/",
      localStorageValue: "Test",
    });

    expect(getState()).toEqual({
      type: "sparql",
      url: "https://lindas-cached.test.cz-aws.net/query",
    });
    expect(setURLParam).toHaveBeenCalledWith("dataSource", "Test");
  });

  it("should have the correct default state from URL in priority", async () => {
    const { getState } = await setup({
      initialURL: "https://visualize.admin.ch/?dataSource=Test",
      localStorageValue: "Prod",
    });

    expect(getState()).toEqual({
      type: "sparql",
      url: "https://lindas-cached.test.cz-aws.net/query",
    });
  });

  it("should keep both localStorage and router updated", async () => {
    const { setState } = await setup({
      initialURL: "https://visualize.admin.ch/?dataSource=Int",
      localStorageValue: "Test",
    });
    act(() => {
      setState({
        type: "sparql",
        url: "https://lindas-cached.cluster.ldbar.ch/query",
      });
    });

    expect(setURLParam).toHaveBeenCalledWith("dataSource", "Prod");
    expect(localStorage.getItem("dataSource")).toBe("Prod");
  });
});
