import { act, renderHook } from "@testing-library/react";
import mittEmitter from "next/dist/shared/lib/mitt";
import { useRouter } from "next/router";
import { describe, expect, it, vi } from "vitest";

import { DEFAULT_DATA_SOURCE } from "@/domain/data-source";
import { useRouteState } from "@/utils/router/use-route-state";

vi.mock("next/router", () => {
  return {
    useRouter: vi.fn(),
  };
});

describe("use route state", () => {
  const prodSource = {
    type: "sparql" as const,
    url: "https://lindas.admin.ch/query",
  };

  const setup = ({ initialRouterQuery = {} } = {}) => {
    const router = {
      pathname: "/hello",
      query: initialRouterQuery,
      events: mittEmitter(),
      replace: (opts: Record<string, unknown>) => {
        Object.assign(router, opts);
        router.events.emit("routeChangeComplete");
      },
    };
    // @ts-ignore
    useRouter.mockImplementation(() => router);

    const onValueChange = vi.fn();

    const hook = renderHook(() =>
      useRouteState(
        () => {
          return DEFAULT_DATA_SOURCE;
        },
        {
          param: "dataSource",
          onValueChange,
          serialize: (dataSource) => JSON.stringify(dataSource),
          deserialize: (dataSourceStr) => JSON.parse(dataSourceStr),
        }
      )
    );

    return {
      router,
      useRouter,
      hook,
      onValueChange,
      getState: () => hook.result.current[0],
      setState: (v: Parameters<(typeof hook.result.current)[1]>[0]) =>
        hook.result.current[1](v),
    };
  };

  it("should do initially have DEFAULT_DATA_SOURCE", () => {
    const { getState } = setup();
    expect(getState()).toEqual(DEFAULT_DATA_SOURCE);
  });

  it("should keep router query in sync", () => {
    const { setState, router } = setup();
    act(() => {
      setState(prodSource);
    });
    expect(router.query).toEqual({
      dataSource: JSON.stringify(prodSource),
    });
  });

  it("should set state inside router if not already there, keeping previous state", () => {
    const { router, getState, setState } = setup({
      initialRouterQuery: {
        includeDrafts: "true",
      },
    });

    act(() => {
      setState(prodSource);
    });

    expect(getState()).toEqual(prodSource);
    expect(router.query).toEqual({
      dataSource: JSON.stringify(prodSource),
      includeDrafts: "true",
    });
  });

  it("should call on value change", () => {
    const { setState, onValueChange } = setup({
      initialRouterQuery: {
        includeDrafts: "true",
      },
    });

    act(() => {
      setState(prodSource);
    });
    expect(onValueChange).toHaveBeenCalledWith(prodSource);
  });
});
