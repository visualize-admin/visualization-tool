const ns = require("../../namespaces");
const { contains, distinct } = require("../utils");

class Sources {
  constructor(viewQuery) {
    this.viewQuery = viewQuery;

    const view = this.viewQuery.view;
    const dimensions = this.viewQuery.dimensions.array;
    const sources = distinct(
      view
        .node(dimensions.map((d) => d.ptr.term))
        .out(ns.view.from)
        .out(ns.view.source)
    );

    this.array = sources.toArray().map((source) => {
      const graph = source.out(ns.view.graph).term;
      const isCubeSource = contains(
        source.out(ns.rdf.type),
        ns.view.CubeSource
      );
      const isLookupSource = contains(
        source.out(ns.rdf.type),
        ns.view.LookupSource
      );

      return {
        ptr: source,
        variable: this.viewQuery.variable("source"),
        graph,
        isCubeSource,
        isLookupSource,
      };
    });

    for (const source of this.array) {
      this.initPattern({ source });
    }
  }

  initPattern({ source }) {
    source.patterns = [];

    if (source.isCubeSource) {
      source.variableSet = this.viewQuery.variable("observationSet");

      const cube = source.ptr.out(ns.view.cube).term;
      const graph = source.ptr.out(ns.view.graph).term;

      source.patterns.push([
        cube,
        ns.cube.observationSet,
        source.variableSet,
        graph,
      ]);
      source.patterns.push([
        source.variableSet,
        ns.cube.observation,
        source.variable,
        graph,
      ]);
    }
  }

  get(term) {
    return this.array.find((source) => source.ptr.term.equals(term));
  }
}

module.exports = Sources;
