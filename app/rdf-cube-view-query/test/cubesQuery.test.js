const { deepStrictEqual, strictEqual } = require("assert");
const { describe, it } = require("mocha");
const cubesQuery = require("../lib/query/cubes");
const { compareQuery } = require("./support/compareQuery");
const ns = require("./support/namespaces");

describe("query/cubes", () => {
  it("should be a function", () => {
    strictEqual(typeof cubesQuery, "function");
  });

  it("should create a query that finds all cube:Cube terms", async () => {
    const query = cubesQuery();

    await compareQuery({ name: "cubes", query });
  });

  it("should use the given named graph", async () => {
    const graph = ns.ex.graph;

    const query = cubesQuery({ graph });

    await compareQuery({ name: "cubesGraph", query });
  });

  it("should call the filters functions", async () => {
    const args = [];

    const filter = (name) => {
      return ({ cube, index }) => {
        args.push({ name, termType: cube.termType, value: cube.value, index });

        return [];
      };
    };

    cubesQuery({ filters: [filter("1"), filter("2")] });

    deepStrictEqual(args, [
      { name: "1", termType: "Variable", value: "cube", index: 0 },
      { name: "2", termType: "Variable", value: "cube", index: 1 },
    ]);
  });

  it("should use the result of the filter functions", async () => {
    const filter = (name) => {
      return ({ index }) => {
        return [`# ${name} ${index}`];
      };
    };

    const query = cubesQuery({ filters: [filter("1"), filter("2")] });

    await compareQuery({ name: "cubesFilter", query });
  });
});
