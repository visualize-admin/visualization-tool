const TermSet = require("@rdfjs/term-set");
const { SELECT } = require("@tpluscode/sparql-builder");
const rdf = require("rdf-ext");

const { Timer } = require("@/utils/timer");

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
    // console.log(
    //   "dimensions",
    //   this.ptr.out(ns.sh.path).map((d) => d.term.value)
    // );
    // console.log(
    //   "OC",
    //   this.ptr.out(ns.cube.observationConstraint).out(ns.sh.property).terms
    // );
    // console.log(
    //   "creative work status",
    //   this.ptr.out(ns.qudt.scaleType).term?.value
    // );
    return this.ptr
      .out(ns.cube.observationConstraint)
      .out(ns.sh.property)
      .filter(
        (property) =>
          !this.ignore.has(property.out(ns.sh.path).term) &&
          property.out(ns.sh.path).term?.value &&
          property.out(ns.sh.path).term.value !== "https://cube.link/observedBy"
      )
      .map(
        (ptr) => new CubeDimension({ term: ptr.term, dataset: this.dataset })
      );
  }

  cubeQuery() {
    const query = cubeQuery({ cube: this.term, graph: this.source.graph });
    return query.toString();
  }

  async fetchCube() {
    const timer = new Timer();
    timer.start("cubeData");
    const cubeData = await this.source.client.query.construct(this.cubeQuery());
    timer.stop();

    timer.start("addAll");
    this.dataset.addAll(cubeData);
    timer.stop();

    timer.start("quads");
    this.quads = [...this.quads, ...cubeData];
    timer.stop();
  }

  shapeQuery() {
    if (!this.source.graph || this.source.graph.termType === "DefaultGraph") {
      // return SELECT`*`.WHERE`VALUES (?subject) {
      //       (<https://environment.ld.admin.ch/foen/nfi/C-96/cube/1/shape/>)
      //     }
      //     ?subject ?predicate ?object .`;
      // return `DESCRIBE <${this.ptr.out(ns.cube.observationConstraint).value}>`;
      // return SELECT`?subject ?predicate ?object`.WHERE`
      // {
      //   VALUES (?subject) {
      //     (<https://environment.ld.admin.ch/foen/nfi/C-96/cube/1/shape/>)
      //   }
      //   ?subject ?predicate ?object .
      // } UNION {
      //   <https://environment.ld.admin.ch/foen/nfi/C-96/cube/1/shape/> ?p ?subject .
      //   ?subject a <https://cube.link/KeyDimension> .
      //   ?subject ?predicate ?object .
      // } UNION {
      //   <https://environment.ld.admin.ch/foen/nfi/C-96/cube/1/shape/> ?p ?subject .
      //   ?subject a <https://cube.link/MeasureDimension> .
      //   ?subject ?predicate ?object .
      // }`;

      return `
      CONSTRUCT {
        <https://environment.ld.admin.ch/foen/nfi/C-96/cube/1/shape/> ?predicate ?object .
        ?subject ?p1 <https://environment.ld.admin.ch/foen/nfi/C-96/cube/1/shape/> .
     }
       WHERE {
        <https://environment.ld.admin.ch/foen/nfi/C-96/cube/1/shape/> ?predicate ?object .
        ?subject ?p1 <https://environment.ld.admin.ch/foen/nfi/C-96/cube/1/shape/> .
       }`;
    }

    return `DESCRIBE <${
      this.ptr.out(ns.cube.observationConstraint).value
    }> FROM <${this.source.graph.value}>`;
  }

  async fetchShape() {
    const timer = new Timer();
    timer.start("shapeQuery");
    const query = this.shapeQuery();
    timer.stop();
    timer.start("shapeData");
    // console.log(query.build().toString());
    // const shapeData = await this.source.client.query.select(query.build(), {
    //   operation: "postUrlencoded",
    // });
    const shapeData = await this.source.client.query.construct(query);
    timer.stop();
    // console.log(JSON.stringify(shapeData));

    timer.start("shapeData - old");
    const shapeDataOld = await this.source.client.query.construct(
      `DESCRIBE <https://environment.ld.admin.ch/foen/nfi/C-96/cube/1/shape/>`
    );
    timer.stop();
    // console.log(JSON.stringify(shapeDataOld));

    timer.start("addAll");
    this.dataset.addAll(shapeData);
    timer.stop();

    timer.start("quads");
    this.quads = [...this.quads, ...shapeData];
    timer.stop();

    timer.start("properties");
    const dims = [
      "https://environment.ld.admin.ch/foen/nfi/inventory",
      "https://environment.ld.admin.ch/foen/nfi/volumePerForestArea",
      "https://environment.ld.admin.ch/foen/nfi/grid",
      "https://environment.ld.admin.ch/foen/nfi/lbhndh",
      "https://environment.ld.admin.ch/foen/nfi/evaluationType",
      "https://environment.ld.admin.ch/foen/nfi/unitOfReference",
      "https://environment.ld.admin.ch/foen/nfi/unitOfEvaluation",
    ];

    const dimensionShapes = await this.source.client.query
      .construct(`DESCRIBE * {
            #pragma describe.strategy cbd
            
            VALUES (?dim) { ${dims.map((d) => `(<${d}>)`).join(" ")} }
            <https://environment.ld.admin.ch/foen/nfi/C-96/cube/1/shape/> ?p1 ?o1 .
            ?o1 ?p2 ?dim .
            ?o1 ?p2 ?o3 .
          }
          `);
    // console.log(JSON.stringify(dimensionShapes));
    timer.stop();
    this.quads = [...this.quads, ...dimensionShapes];
  }

  async init() {
    const timer = new Timer();
    await this.fetchCube();
    timer.start("fetchShape");
    await this.fetchShape();
    timer.stop();
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
