import { describe, expect, it } from "vitest";

import { HierarchyValue } from "@/domain/data";

import { getLegendGroups } from "./legend-color-helpers";

describe("getLegendGroups", () => {
  const hierarchy = [
    { dimensionId: "numbers", depth: 0, value: "1", label: "one" },
    { dimensionId: "numbers", depth: 0, value: "2", label: "two" },
    { dimensionId: "numbers", depth: 0, value: "3", label: "three" },
  ] as HierarchyValue[];

  it("should properly create groups when encountering top-level values", () => {
    const groups = getLegendGroups({
      title: "",
      values: hierarchy.map((d) => d.value),
      sort: true,
    });

    expect(groups.length).toEqual(1);
    expect(groups[0][1]).toEqual(["1", "2", "3"]);
  });

  it("should only include values that are present in the data", () => {
    const groups = getLegendGroups({
      title: "",
      values: ["1", "2"],
      sort: true,
    });

    expect(groups.length).toEqual(1);
    expect(groups[0][1]).toEqual(["1", "2"]);
  });
});
