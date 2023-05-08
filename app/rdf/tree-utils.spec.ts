import { HierarchyValue } from "@/graphql/query-hooks";

import multipleRootHierarchy from "../test/__fixtures/data/multiple-root-hierarchy.json";

import { pruneTree, mapTree, regroupTrees } from "./tree-utils";

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
] as HierarchyValue[];

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
    const tree = regroupTrees(multipleRootHierarchy);
    expect(tree[0].children?.map((x) => x.value)).toEqual([
      "Switzerland - Canton",
      "Switzerland - Protection Region - Economic Region",
      "Switzerland - Production Region - Economic Region",
    ]);
  });
});
