import { describe, expect, it } from "vitest";

import { HierarchyValue } from "@/domain/data";
import {
  findInHierarchy,
  mapTree,
  pruneTree,
  regroupTrees,
} from "@/rdf/tree-utils";
import multipleRootHierarchy from "@/test/__fixtures/data/multiple-root-hierarchy.json";

// Country > Canton > Municipality
// Countries have no value
const tree = [
  {
    value: "Switzerland",
    hasValue: false,
    children: [
      {
        value: "Zürich",
        hasValue: true,
        children: [
          { hasValue: true, value: "Thalwil" },
          { hasValue: true, value: "Kilchberg" },
        ],
      },
      {
        hasValue: true,
        value: "Bern",
        children: [
          { hasValue: true, value: "Bern City" },
          { hasValue: true, value: "Langnau" },
        ],
      },
    ],
  },
  {
    value: "France",
    hasValue: false,
  },
] as any as HierarchyValue[];

describe("mapTree", () => {
  it("should map the function across all nodes of the tree", () => {
    const reverseStr = (s: string) => s.split("").reverse().join("");
    const mappedTree = mapTree(tree, (x) => ({
      ...x,
      value: reverseStr(x.value),
    }));
    expect(mappedTree[0].value).toBe(reverseStr("Switzerland"));
    expect(mappedTree[0]?.children?.[0]?.value).toBe(reverseStr("Zürich"));
    expect(mappedTree[0]?.children?.[0]?.children?.[0].value).toBe(
      reverseStr("Thalwil")
    );
  });
});

describe("filterTree", () => {
  it("should remove any node not containing any of the passed leafs", () => {
    const whitelist = new Set(["Thalwil", "Bern"]);
    const res = pruneTree(tree, (n) => whitelist.has(n.value));
    expect(res).toEqual([
      {
        value: "Switzerland",
        hasValue: false,
        children: [
          {
            value: "Zürich",
            hasValue: true,
            children: [
              {
                value: "Thalwil",
                hasValue: true,
              },
            ],
          },
          {
            value: "Bern",
            hasValue: true,
            children: [],
          },
        ],
      },
    ]);
  });
});

describe("multiple hierarchy handling", () => {
  it("should regroup trees", () => {
    const tree = regroupTrees(multipleRootHierarchy as any);
    expect(tree[0].children?.map((x) => x.value)).toEqual([
      "Switzerland - Canton",
      "Switzerland - Protection Region - Economic Region",
      "Switzerland - Production Region - Economic Region",
    ]);
  });

  it("should select values starting from beginning of the tree", () => {
    const expectedValue: HierarchyValue = {
      depth: 0,
      dimensionId: "A",
      value: "A",
      hasValue: true,
      label: "A",
    };
    const tree: HierarchyValue[] = [
      expectedValue,
      {
        depth: 0,
        dimensionId: "B",
        value: "B",
        hasValue: true,
        label: "B",
      },
      {
        depth: 0,
        dimensionId: "C",
        value: "C",
        hasValue: true,
        label: "C",
      },
    ];
    const value = findInHierarchy(tree, (d) => d.hasValue);
    expect(value).toEqual(expectedValue);
  });
});
