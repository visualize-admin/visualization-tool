import { describe, expect, it } from "vitest";

import _hierarchy from "../../test/__fixtures/data/tarrifs-hierarchy.json";

import { groupByParents } from "./use-hierarchy-parents";

describe("grouping hierarchy by parents", () => {
  it("should work", () => {
    const hierarchy = _hierarchy as unknown as Parameters<
      typeof groupByParents
    >[0];
    const groups = groupByParents(hierarchy);
    const iri =
      "https://ld.admin.ch/cube/dimension/aussenhandel_warenkoerbe/1_listZT";
    const ztGroups = groups.filter(
      ([parents]) =>
        parents.length > 0 && parents[parents.length - 1].value === iri
    )!;

    expect(ztGroups.length).toBe(1);
    const ztGroup = ztGroups[0]!;
    const [parents, children] = ztGroup;
    expect(parents.length).toBe(2);
    expect(children.length).toBe(41);
  });
});
