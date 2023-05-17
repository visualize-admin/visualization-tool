const TermSet = require("@rdfjs/term-set");
const rdf = require("rdf-ext");
const CubeDimension = require("./CubeDimension");
const Node = require("./Node");
const ns = require("./namespaces");
const cubeQuery = require("./query/cube.js");
const queryFilter = require("./query/cubesFilter");

class Cube extends Node {
  constructor({
    parent,
    term,
    dataset,
    graph,
    source,
    ignore = [ns.rdf.type],
  }) {
    super({
      parent,
      term,
      dataset,
      graph,
    });

    this.source = source;
    this.ignore = new TermSet(ignore);
    this.quads = [];
  }

  clear() {
    for (const quad of this.quads) {
      this.dataset.remove(quad);
    }

    super.clear();
  }

  get dimensions() {
    return this.ptr
      .out(ns.cube.observationConstraint)
      .out(ns.sh.property)
      .filter((property) => !this.ignore.has(property.out(ns.sh.path).term))
      .map(
        (ptr) => new CubeDimension({ term: ptr.term, dataset: this.dataset })
      );
  }

  cubeQuery() {
    const query = cubeQuery({ cube: this.term, graph: this.source.graph });
    return query.toString();
  }

  async fetchCube() {
    const cubeData = await this.source.client.query.construct(this.cubeQuery());

    this.dataset.addAll(cubeData);

    this.quads = [...this.quads, ...cubeData];
  }

  shapeQuery() {
    if (!this.source.graph || this.source.graph.termType === "DefaultGraph") {
      return `DESCRIBE <${this.ptr.out(ns.cube.observationConstraint).value}>`;
    }

    return `DESCRIBE <${
      this.ptr.out(ns.cube.observationConstraint).value
    }> FROM <${this.source.graph.value}>`;
  }

  async fetchShape() {
    const shapeData = await this.source.client.query.construct(
      this.shapeQuery()
    );

    this.dataset.addAll(shapeData);

    this.quads = [...this.quads, ...shapeData];
  }

  async init() {
    await this.fetchCube();
    await this.fetchShape();
  }

  out(...args) {
    return this.ptr.out(...args);
  }

  in(...args) {
    return this.ptr.in(...args);
  }
}

Cube.filter = { ...queryFilter };

Cube.filter.isPartOf = (container) => {
  return Cube.filter.patternIn(ns.schema.hasPart, container);
};

Cube.filter.noExpires = () => {
  return Cube.filter.notExists(ns.schema.expires);
};

Cube.filter.noValidThrough = () => {
  return Cube.filter.notExists(ns.schema.validThrough);
};

Cube.filter.status = (values) => {
  values = Array.isArray(values) ? values : [values];

  return Cube.filter.in(ns.schema.creativeWorkStatus, values);
};

Cube.filter.version = (value, operation = ns.view.Eq) => {
  value = value.termType ? value : rdf.literal(value, ns.xsd.integer);

  return Cube.filter.operation(ns.schema.version, value, operation);
};

Cube.filter.version.eq = (value) => Cube.filter.version(value, ns.view.Eq);
Cube.filter.version.ne = (value) => Cube.filter.version(value, ns.view.Ne);
Cube.filter.version.lt = (value) => Cube.filter.version(value, ns.view.Lt);
Cube.filter.version.gt = (value) => Cube.filter.version(value, ns.view.Gt);
Cube.filter.version.lte = (value) => Cube.filter.version(value, ns.view.Lte);
Cube.filter.version.gte = (value) => Cube.filter.version(value, ns.view.Gte);

module.exports = Cube;
