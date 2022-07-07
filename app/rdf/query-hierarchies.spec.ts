import { HierarchyValue } from "@/graphql/query-hooks";

import { trimTree } from "./tree-utils";

describe("trimTree", () => {
  it("should remove any node not containing any of the passed leafs", () => {
    const tree = [
      {
        value: "A",
        children: [
          {
            value: "B",
            children: [{ value: "C" }, { value: "D" }],
          },
          {
            value: "E",
            children: [{ value: "F" }, { value: "G" }],
          },
        ],
      },
      {
        value: "H",
      },
    ] as HierarchyValue[];

    const res = trimTree(tree, ["C", "E"]);
    expect(res).toEqual([
      {
        value: "A",
        children: [
          {
            value: "B",
            children: [
              {
                value: "C",
              },
            ],
          },
          {
            value: "E",
            children: [],
          },
        ],
      },
    ]);
  });
});
