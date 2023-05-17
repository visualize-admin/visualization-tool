const CubeDimension = require("./CubeDimension");
const FilterBuilder = require("./FilterBuilder");
const Node = require("./Node");
const ns = require("./namespaces");
const { toTerm } = require("./utils");

class Dimension extends Node {
  constructor({
    parent,
    term,
    dataset,
    graph,
    aggregate,
    as,
    join,
    path,
    source,
    createTriples = true,
  }) {
    super({
      parent,
      term,
      dataset,
      graph,
    });

    if (createTriples) {
      this.ptr
        .addOut(ns.view.from, (from) => {
          from.addOut(ns.view.source, toTerm(source));

          if (Array.isArray(path)) {
            from.addList(ns.view.path, path);
          } else {
            from.addOut(ns.view.path, path);
          }

          if (join) {
            from.addOut(ns.view.join, toTerm(join));
          }
        })
        .addOut(ns.view.as, as || path);

      if (aggregate) {
        this.ptr.addOut(ns.view.aggregate, aggregate);
      }
    }

    this.source = source;

    this.filter = new FilterBuilder(this);
  }

  clear() {
    this.ptr.out(ns.view.from).deleteOut();

    super.clear();
  }

  get cubeDimensions() {
    const path = this.ptr.out(ns.view.from).out(ns.view.path).term;

    return this.cubes
      .map(
        (cube) =>
          this.ptr
            .node(cube)
            .out(ns.cube.observationConstraint)
            .out(ns.sh.property).terms
      )
      .flat()
      .filter((cubeDimension) =>
        this.ptr.node(cubeDimension).out(ns.sh.path).term.equals(path)
      )
      .map(
        (cubeDimension) =>
          new CubeDimension({
            term: cubeDimension,
            dataset: this.dataset,
            graph: this.graph,
          })
      );
  }

  get cubes() {
    return this.ptr.out(ns.view.from).out(ns.view.source).out(ns.view.cube)
      .terms;
  }
}

Dimension.aggregate = {
  avg: ns.view.Avg,
  max: ns.view.Max,
  min: ns.view.Min,
};

module.exports = Dimension;
