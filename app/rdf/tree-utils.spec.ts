import { HierarchyValue } from "@/graphql/query-hooks";

import { filterTree, CheckboxStateController } from "./tree-utils";

const tree = [
  {
    value: "Switzerland",
    children: [
      {
        value: "Zurich",
        children: [{ value: "Thalwil" }, { value: "Kilchberg" }],
      },
      {
        value: "Bern",
        children: [{ value: "Bern City" }, { value: "Langnau" }],
      },
    ],
  },
  {
    value: "France",
  },
] as HierarchyValue[];

describe("filterTree", () => {
  it("should remove any node not containing any of the passed leafs", () => {
    const whitelist = new Set(["Thalwil", "Bern"]);
    const res = filterTree(tree, (n) => whitelist.has(n.value));
    expect(res).toEqual([
      {
        value: "Switzerland",
        children: [
          {
            value: "Zurich",
            children: [
              {
                value: "Thalwil",
              },
            ],
          },
          {
            value: "Bern",
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
    expect(state.get("Zurich")).toEqual("indeterminate");
    expect(state.get("Thalwil")).toEqual("checked");
    expect(state.get("Bern")).toEqual("unchecked");
  });

  it("should be possible to toggle a node", () => {
    const controller = setupController();
    controller.toggle("Switzerland");
    expect(controller.getValues()).toEqual([]);
    controller.toggle("Switzerland");
    expect(controller.getValues().sort()).toEqual([
      "Bern City",
      "Kilchberg",
      "Langnau",
      "Thalwil",
    ]);
    controller.toggle("Switzerland");
    expect(controller.getValues().sort()).toEqual([
      "Bern City",
      "Kilchberg",
      "Langnau",
      "Switzerland",
      "Thalwil",
    ]);
    controller.toggle("Zurich");
    expect(controller.getValues().sort()).toEqual([
      "Bern City",
      "Kilchberg",
      "Langnau",
      "Switzerland",
      "Thalwil",
      "Zurich",
    ]);
    controller.toggle("Zurich");
    expect(controller.getValues().sort()).toEqual([
      "Bern City",
      "Langnau",
      "Switzerland",
    ]);
  });
});
