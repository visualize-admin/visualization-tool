import { HierarchyValue } from "@/graphql/resolver-types";

import { getLegendGroups } from "./legend-color-helpers";

describe("getLegendGroups", () => {
  const hierarchy: HierarchyValue[] = [
    { dimensionIri: "numbers", depth: 0, value: "1", label: "one" },
    { dimensionIri: "numbers", depth: 0, value: "2", label: "two" },
    { dimensionIri: "numbers", depth: 0, value: "3", label: "three" },
  ];

  it("should properly create groups when encountering top-level values", () => {
    const groups = getLegendGroups({
      title: "",
      values: hierarchy.map((d) => d.value),
      hierarchy,
      sort: true,
    });

    expect(groups.length).toEqual(1);
    expect(groups[0][1]).toEqual(["1", "2", "3"]);
  });

  it("should only include values that are present in the data", () => {
    const groups = getLegendGroups({
      title: "",
      values: ["1", "2"],
      hierarchy,
      sort: true,
    });

    expect(groups.length).toEqual(1);
    expect(groups[0][1]).toEqual(["1", "2"]);
  });
});
