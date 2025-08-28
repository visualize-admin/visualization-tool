import { describe, expect, it } from "vitest";

import type {
  GroupedPreparedFilter,
  PreparedFilter,
} from "@/charts/shared/chart-data-filters";
import {
  getInteractiveQueryFilters,
  groupPreparedFiltersByDimension,
} from "@/charts/shared/chart-data-filters";
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

describe("groupPreparedFiltersByDimension", () => {
  const mkPrepared = (
    cubeIri: string,
    resolution: Record<string, string>,
    interactive: Record<string, any> = {}
  ): PreparedFilter => ({
    cubeIri,
    interactiveFilters: interactive,
    unmappedFilters: {},
    mappedFilters: {},
    componentIdResolution: resolution,
  });

  it("groups non-joined ids per cube correctly", () => {
    const componentIds = ["dimA", "dimB"];
    const prepared: PreparedFilter[] = [
      mkPrepared("cube1", { dimA: "dimA", dimB: "dimB" }),
      mkPrepared("cube2", { dimA: "dimA", dimB: "dimB" }),
    ];

    const grouped = groupPreparedFiltersByDimension(prepared, componentIds);
    const byId: Record<string, GroupedPreparedFilter> = Object.fromEntries(
      grouped.map((g) => [g.dimensionId, g])
    );

    expect(Object.keys(byId)).toEqual(["dimA", "dimB"]);
    expect(byId["dimA"].entries).toHaveLength(2);
    expect(byId["dimB"].entries).toHaveLength(2);
  });

  it("groups joined ids under the join key with per-cube resolutions", () => {
    const joinKey = "joinBy__0";
    const componentIds = [joinKey];
    const prepared: PreparedFilter[] = [
      mkPrepared("cube1", { [joinKey]: "dimX1" }),
      mkPrepared("cube2", { [joinKey]: "dimX2" }),
    ];

    const grouped = groupPreparedFiltersByDimension(prepared, componentIds);

    expect(grouped).toHaveLength(1);
    expect(grouped[0].dimensionId).toBe(joinKey);
    expect(grouped[0].entries.map((e) => e.cubeIri)).toEqual([
      "cube1",
      "cube2",
    ]);
    expect(grouped[0].entries.map((e) => e.resolvedDimensionId)).toEqual([
      "dimX1",
      "dimX2",
    ]);
  });
});
