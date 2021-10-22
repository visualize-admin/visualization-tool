import { renderHook } from "@testing-library/react-hooks";
import { merge } from "lodash";
import { ChartConfig } from "./config-types";
import useFilterChanges from "./use-filter-changes";

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
    } as ChartConfig["filters"];
    let filters = filters1;

    const { result, rerender } = renderHook(() => useFilterChanges(filters));
    expect(result.current).toEqual([]);

    filters = merge({}, filters1, {
      "https://environment.ld.admin.ch/foen/red_lists/status": {
        type: "single",
        value: "endangered",
      },
    }) as ChartConfig["filters"];
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
