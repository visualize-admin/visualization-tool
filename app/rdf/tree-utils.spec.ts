import { HierarchyValue } from "@/graphql/query-hooks";

import { filterTree, CheckboxStateController } from "./tree-utils";

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

describe("filterTree", () => {
  it("should remove any node not containing any of the passed leafs", () => {
    const whitelist = new Set(["Thalwil", "Bern"]);
    const res = filterTree(tree, (n) => whitelist.has(n.value));
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

describe("checkbox state controller", () => {
  const setupController = () => {
    const checkedValues = ["Switzerland", "Thalwil"];
    return new CheckboxStateController(tree, checkedValues);
  };

  it("should be possible to get checked/indeterminate state", () => {
    const controller = setupController();
    const state = controller.getState();
    expect(state.get("Switzerland")).toEqual("checked");
    expect(state.get("Zürich")).toEqual("indeterminate");
    expect(state.get("Thalwil")).toEqual("checked");
    expect(state.get("Bern")).toEqual("unchecked");
  });

  it("should be possible to toggle a node", () => {
    const controller = setupController();

    // Node is checked, toggling it removes all the children
    controller.toggle("Switzerland");
    expect(controller.getValues()).toEqual([]);

    // Node gets checked, toggling it checks all its leafs
    controller.toggle("Switzerland");
    expect(controller.getValues().sort()).toEqual([
      "Bern City",
      "Kilchberg",
      "Langnau",
      "Thalwil",
    ]);

    // Node gets checked, but has no value, so remove all children
    controller.toggle("Switzerland");
    expect(controller.getValues().sort()).toEqual([]);

    controller.toggle("Zürich");
    expect(controller.getValues().sort()).toEqual(["Kilchberg", "Thalwil"]);

    controller.toggle("Zürich");
    expect(controller.getValues().sort()).toEqual([
      "Kilchberg",
      "Thalwil",
      "Zürich",
    ]);
  });
});
