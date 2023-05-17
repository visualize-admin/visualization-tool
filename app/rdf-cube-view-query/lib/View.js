const Dimension = require("./Dimension");
const Node = require("./Node");
const ns = require("./namespaces");
const {
  findDataset,
  findParent,
  objectSetterGetter,
  toTerm,
} = require("./utils");
const ViewQuery = require("./query/ViewQuery");
const viewDefQuery = require("./query/view.js");
const Filter = require("./Filter.js");
const rdf = require("rdf-ext");
const TermSet = require("@rdfjs/term-set");

class View extends Node {
  constructor({
    parent,
    term,
    dataset,
    graph,
    dimensions = [],
    filters = [],
    source,
  } = {}) {
    super({
      parent: parent || findParent([...dimensions, ...filters]),
      term,
      dataset: dataset || findDataset([...dimensions, ...filters]),
      graph,
    });

    this.source = source;
    this.dimensions = [];
    this.filters = [];
    this.quads = [];
    this.shapesQuads = [];

    this.ptr.addOut(ns.rdf.type, ns.view.View);

    if (!this.ptr.out(ns.view.projection).term) {
      this.ptr.addOut(ns.view.projection);
    }

    for (const dimension of dimensions) {
      this.addDimension(dimension);
    }

    for (const filter of filters) {
      this.addFilter(filter);
    }
  }

  dimension({ cubeDimension }) {
    if (cubeDimension) {
      const term = toTerm(cubeDimension);

      return this.dimensions.find((dimension) => {
        return dimension.cubeDimensions.some(
          (current) =>
            current.path.equals(cubeDimension.path) || current.path.equals(term)
        );
      });
    }

    return null;
  }

  createDimension({ aggregate, as, join, path, source }) {
    const dimension = new Dimension({
      parent: this,
      aggregate,
      as,
      join,
      path,
      source,
    });

    return dimension;
  }

  addDimension(dimension) {
    this.ptr.addOut(ns.view.dimension, toTerm(dimension));

    this.dimensions.push(dimension);

    return this;
  }

  addFilter(filter) {
    if (!filter.dimension) {
      throw Error(`filter ${filter.term} requires a dimension`);
    }
    if (!filter.operation) {
      throw Error(`filter ${filter.term} requires an operation`);
    }
    if (!(filter.arg || filter.args || filter.argList)) {
      throw Error(`filter ${filter.term} requires an argument`);
    }

    this.ptr.addOut(ns.view.filter, toTerm(filter));

    this.filters.push(filter);

    return this;
  }

  clearFilters() {
    this.filters.forEach((filter) => {
      filter.clear();
    });
    this.ptr.deleteOut(ns.view.filter);
    this.filters = [];
  }

  clearFilter(filter) {
    this.filters.forEach((x) => {
      if (x.term.equals(filter.term)) {
        x.clear();
      }
    });
    this.ptr.deleteOut(ns.view.filter, filter.term);
    this.filters = this.filters.filter((x) => !x.term.equals(filter.term));
  }

  offset(offset) {
    return objectSetterGetter(this, ns.view.offset, offset, {
      map: parseInt,
      ptr: this.ptr.out(ns.view.projection),
    });
  }

  limit(limit) {
    return objectSetterGetter(this, ns.view.limit, limit, {
      map: parseInt,
      ptr: this.ptr.out(ns.view.projection),
    });
  }

  observationsQuery({ disableDistinct } = {}) {
    return new ViewQuery(this.ptr, { disableDistinct });
  }

  async observations({ disableDistinct } = { disableDistinct: false }) {
    if (!this.dimensions.length) {
      throw Error("No dimensions");
    }

    const source = this.getMainSource();
    if (!source || !source.client) {
      throw Error("No source with client");
    }

    const { query, dimensions } = this.observationsQuery({ disableDistinct });

    const columns = dimensions.array
      .filter((d) => d.isResult)
      .map((d) => [d.variable, d.property]);
    const rows = await source.client.query.select(query, {
      operation: source.queryOperation,
    });

    return rows.map((row) => {
      const output = {};

      for (const [variable, property] of columns) {
        output[property.value] = row[variable.value];
      }

      return output;
    });
  }

  async observationCount({ disableDistinct } = { disableDistinct: false }) {
    const source = this.getMainSource();

    const { countQuery } = this.observationsQuery({ disableDistinct });

    const result = await source.client.query.select(countQuery, {
      operation: source.queryOperation,
    });

    if (!result.length) {
      return NaN;
    }

    return parseInt(result[0].count.value);
  }

  static fromCube(cube, sortColumns = true) {
    if (!cube) {
      throw Error("requires cube");
    }

    if (!cube.source) {
      throw Error("requires source");
    }

    cube.source.ptr
      .addOut(ns.rdf.type, ns.view.CubeSource)
      .addOut(ns.view.cube, toTerm(cube));

    const view = new View({ parent: cube, source: cube.source });
    cube.dimensions.forEach((cubeDimension) => {
      if (!cubeDimension.path) {
        throw new Error(
          `Cube dimension <${cubeDimension.ptr.term.value}> requires a path`
        );
      }
      const viewDimension = view.createDimension({
        source: cube.source,
        path: cubeDimension.path,
        as: cubeDimension.path,
      });
      view.addDimension(viewDimension);
    });

    view.setDefaultColumns(sortColumns);

    return view;
  }

  setDefaultColumns(sort) {
    const orderingColumns = this.dimensions.map((dimension) => ({
      iri: dimension.cubeDimensions[0].path.value,
      term: dimension.ptr.term,
    }));

    if (sort) {
      const collator = new Intl.Collator("en", { numeric: true });
      orderingColumns.sort((a, b) => collator.compare(a.iri, b.iri));
    }

    const projectionPtr = this.ptr.out(ns.view.projection);
    projectionPtr.addList(
      ns.view.columns,
      orderingColumns.map((dimension) => dimension.term)
    );
  }

  orderBy(orderBy) {
    const projectionPtr = this.ptr.out(ns.view.projection);

    if (typeof orderBy === "undefined") {
      if (!projectionPtr.out(ns.view.orderBy).isList()) {
        return null;
      }
      const items = [];
      for (const current of projectionPtr.out(ns.view.orderBy).list()) {
        items.push({
          dimension: current.out(ns.view.dimension).term,
          direction: current.out(ns.view.direction).term,
        });
      }
      return items;
    }

    if (orderBy === null) {
      if (projectionPtr.out(ns.view.orderBy).isList()) {
        for (const current of projectionPtr.out(ns.view.orderBy).list()) {
          current.deleteOut(ns.view.dimension);
          current.deleteOut(ns.view.direction);
        }
        projectionPtr.deleteOut(ns.view.orderBy);
      }
    } else {
      const items = [];
      for (const { dimension, direction } of orderBy) {
        const item = rdf.blankNode();
        this.dataset.add(
          rdf.quad(item, ns.view.dimension, dimension, this.graph)
        );
        this.dataset.add(
          rdf.quad(item, ns.view.direction, direction, this.graph)
        );
        items.push(item);
      }
      projectionPtr.addList(ns.view.orderBy, items);
    }
    return this;
  }

  updateProjection({ offset, limit, orderBy }) {
    this.offset(null);
    this.limit(null);
    this.orderBy(null);
    this.offset(offset);
    this.limit(limit);
    this.orderBy(orderBy);
  }

  get projectionDimensions() {
    const projectionPtr = this.ptr.out(ns.view.projection);
    if (!projectionPtr.out(ns.view.columns).isList()) {
      return null;
    }
    const columns = [...projectionPtr.out(ns.view.columns).list()];
    return columns
      .map((col) =>
        this.dimensions.find(
          (dimension) => col.value === dimension.ptr.term.value
        )
      )
      .filter((notNull) => notNull);
  }

  cubeShapeQuery(cubeUri) {
    const source = this.getMainSource();
    if (!source.graph) {
      return `DESCRIBE <${cubeUri}> ?s
WHERE {
    <${cubeUri}> <https://cube.link/observationConstraint> ?s
}
`;
    }

    return `DESCRIBE ?s <${cubeUri}> FROM <${source.graph.value}>
WHERE {
    <${cubeUri}> <https://cube.link/observationConstraint> ?s
}
`;
  }

  async fetchCubesShapes() {
    const cubes = this.cubes();
    if (!cubes || !cubes.length) {
      throw new Error("No cubes found");
    }
    const source = this.getMainSource();
    this.shapesQuads = [];
    for (const cube of cubes) {
      const query = this.cubeShapeQuery(cube.value);
      const cubeShapeData = await source.client.query.construct(query);

      if (!cubeShapeData.length) {
        throw Error(
          `No shape data found at ${source.endpoint}, for cube ${cube.value}`
        );
      }

      this.shapesQuads = [...this.shapesQuads, ...cubeShapeData];
    }
    this.dataset.addAll(this.shapesQuads);
    this.quads = [...this.quads, ...this.shapesQuads];
  }

  fetchViewQuery() {
    const source = this.getMainSource();
    const query = viewDefQuery({ view: this.term, source: source.graph });
    return query.toString();
  }

  async fetchView() {
    const source = this.getMainSource();
    const query = this.fetchViewQuery(source);
    const viewData = await source.client.query.construct(query);
    this.dataset.addAll(viewData);
    this.quads = [...this.quads, ...viewData];
  }

  async init() {
    await this.fetchViewFull();
    this.updateEntities(this.source);
  }

  describeQuery(uri) {
    const source = this.getMainSource();
    if (!source.graph) {
      return `DESCRIBE <${uri}> ?s`;
    }
    return `DESCRIBE ?s <${uri}> FROM <${source.graph.value}>`;
  }

  async fetchViewFull() {
    const source = this.getMainSource();
    const query = this.describeQuery(this.term.value);
    const data = await source.client.query.construct(query);
    this.clear();
    this.dataset.addAll(data);
  }

  updateEntities(src) {
    this.dimensions = [];
    for (const current of this.ptr.out(ns.view.dimension).terms) {
      const sourcePtr = this.ptr
        .node(current)
        .out(ns.view.from)
        .out(ns.view.source);

      const endpointUrl = sourcePtr
        ? sourcePtr.out(ns.view.endpoint).term
        : undefined;
      const source = endpointUrl
        ? new src.constructor({
            endpointUrl: sourcePtr.out(ns.view.endpoint).term,
            sourceGraph: sourcePtr.out(ns.view.graph).term,
          })
        : undefined;

      this.dimensions.push(
        new Dimension({
          parent: this,
          term: current,
          dataset: this.dataset,
          graph: this.graph,
          source,
          createTriples: false,
        })
      );
    }

    this.filters = [];
    for (const current of this.ptr.out(ns.view.filter).terms) {
      this.filters.push(
        new Filter({
          parent: this,
          term: current,
          dataset: this.dataset,
          graph: this.graph,
          createTriples: false,
        })
      );
    }
  }

  getMainSource() {
    const sources = this.sources();
    if (!sources || sources.length === 0) {
      throw Error(
        "Needs a explicit Source or a source attached to the CubeDimensions"
      );
    }
    return sources[0];
  }

  sources() {
    const arr = this.dimensions.filter((x) => x.source).map((x) => x.source);
    if (this.source) {
      arr.push(this.source);
    }
    return [...new Map(arr.map((item, key) => [item[key], item])).values()];
  }

  cubes() {
    const cubes = new TermSet();
    this.dimensions
      .filter((x) => x.cubes)
      .map((x) => x.cubes)
      .flat()
      .forEach((cube) => cubes.add(cube));
    return [...cubes];
  }
}

module.exports = View;
