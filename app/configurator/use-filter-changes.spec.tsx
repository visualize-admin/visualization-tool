import { renderHook } from "@testing-library/react";
import merge from "lodash/merge";
import { describe, expect, it } from "vitest";

import { Filters } from "@/config-types";
import { useFilterChanges } from "@/configurator/use-filter-changes";

describe("use-filter-changes", () => {
  it("should work", () => {
    const filters1 = {
      "https://environment.ld.admin.ch/foen/red_lists/yearissue": {
        type: "single",
        value: "1992",
      },
      "https://environment.ld.admin.ch/foen/red_lists/status": {
        type: "single",
        value: "ok",
      },
    } as Filters;
    let filters = filters1;
    const { result, rerender } = renderHook(() => useFilterChanges(filters));

    expect(result.current).toEqual([]);

    filters = merge({}, filters1, {
      "https://environment.ld.admin.ch/foen/red_lists/status": {
        type: "single",
        value: "endangered",
      },
    }) as Filters;
    rerender();
    expect(result.current).toEqual([
      [
        "https://environment.ld.admin.ch/foen/red_lists/status",
        {
          type: "single",
          value: "ok",
        },
        {
          type: "single",
          value: "endangered",
        },
      ],
    ]);

    filters = {
      "https://environment.ld.admin.ch/foen/red_lists/yearissue": {
        type: "single",
        value: "1992",
      },
    };
    rerender();
    expect(result.current).toEqual([
      [
        "https://environment.ld.admin.ch/foen/red_lists/status",
        {
          type: "single",
          value: "endangered",
        },
        undefined,
      ],
    ]);
  });
});
