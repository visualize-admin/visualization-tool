const { strictEqual } = require("assert");
const { describe, it } = require("mocha");
const rdf = require("rdf-ext");
const CubeDimension = require("../lib/CubeDimension");
const buildCubeDimension = require("./support/buildCubeDimension");
const ns = require("./support/namespaces");

describe("CubeDimension", () => {
  it("should be a constructor", () => {
    strictEqual(typeof CubeDimension, "function");
  });

  it("should create a ptr for the given term, dataset, graph", () => {
    const term = ns.ex.test;
    const dataset = rdf.dataset();
    const graph = ns.ex.graph;
    const dimension = new CubeDimension({ term, dataset, graph });

    strictEqual(dimension.ptr.term.equals(term), true);
    strictEqual(dimension.ptr.dataset, dataset);
    strictEqual(dimension.ptr._context[0].graph.equals(graph), true);
  });

  describe(".datatype", () => {
    it("should be undefined if no datatype is defined", () => {
      const dimension = buildCubeDimension({ path: ns.ex.property });

      strictEqual(typeof dimension.datatype, "undefined");
    });

    it("should be the term defined sh:datatype", () => {
      const dimension = buildCubeDimension({
        path: ns.ex.property,
        datatype: ns.ex.datatype,
      });

      strictEqual(ns.ex.datatype.equals(dimension.datatype), true);
    });

    it("should be the term defined in sh:datatype that is not cube:Undefined", () => {
      const dimension = buildCubeDimension({
        path: ns.ex.property,
        datatype: ns.ex.datatype,
        optional: true,
      });

      strictEqual(ns.ex.datatype.equals(dimension.datatype), true);
    });
  });

  describe(".optional", () => {
    it("should be false if no cube:Undefined datatype is defined", () => {
      const dimension = buildCubeDimension({ path: ns.ex.property });

      strictEqual(dimension.optional, false);
    });

    it("should be false if cube:Undefined is not part of the value list", () => {
      const dimension = buildCubeDimension({
        path: ns.ex.property,
        nodeKind: "NamedNode",
      });

      strictEqual(dimension.optional, false);
    });

    it("should be true if cube:Undefined datatype is defined", () => {
      const dimension = buildCubeDimension({
        path: ns.ex.property,
        datatype: ns.ex.datatype,
        optional: true,
      });

      strictEqual(dimension.optional, true);
    });

    it("should be true if cube:Undefined is part of the value list", () => {
      const dimension = buildCubeDimension({
        path: ns.ex.property,
        nodeKind: "NamedNode",
        optional: true,
      });

      strictEqual(dimension.optional, true);
    });
  });
});
