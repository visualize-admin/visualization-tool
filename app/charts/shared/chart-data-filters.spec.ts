import { describe, expect, it } from "vitest";

import { getInteractiveQueryFilters } from "@/charts/shared/chart-data-filters";
import { Filters } from "@/configurator";

describe("getInteractiveQueryFilters", () => {
  it("should use correct positions", () => {
    const filters: Filters = {
      A: {
        type: "single",
        value: "A",
      },
      B: {
        type: "single",
        value: "B",
      },
      C: {
        type: "single",
        value: "C",
      },
      D: {
        type: "single",
        value: "D",
      },
    };
    const interactiveFilters: Filters = {
      B: {
        type: "single",
        value: "B",
      },
      D: {
        type: "single",
        value: "D",
      },
    };
    const result = getInteractiveQueryFilters({ filters, interactiveFilters });
    expect(result).toEqual({
      A: {
        type: "single",
        value: "A",
        // config filter takes precedence
        position: 0,
      },
      B: {
        type: "single",
        value: "B",
        position: 2,
      },
      C: {
        type: "single",
        value: "C",
        // config filter takes precedence
        position: 1,
      },
      D: {
        type: "single",
        value: "D",
        position: 3,
      },
    });
  });
});
