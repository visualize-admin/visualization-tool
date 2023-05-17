const ParsingClient = require("sparql-http-client/ParsingClient");
const Cube = require("./Cube");
const Node = require("./Node");
const ns = require("./namespaces");
const { toTerm } = require("./utils");
const cubesQuery = require("./query/cubes.js");
const viewListQuery = require("./query/views.js");
const View = require("./View");
const createPrefixedSparqlClient = require("./PrefixedSparqlClient.js");

const DEFAULT_QUERY_PREFIX = "#pragma describe.strategy cbd";

class Source extends Node {
  constructor({
    parent,
    term,
    dataset,
    graph,
    endpointUrl,
    sourceGraph,
    user,
    password,
    queryOperation,
    queryPrefix,
  }) {
    super({
      parent,
      term,
      dataset,
      graph,
    });

    this.ptr.addOut(ns.view.endpoint, toTerm(endpointUrl));

    if (sourceGraph) {
      this.ptr.addOut(ns.view.graph, toTerm(sourceGraph));
    }

    this.user = user;
    this.password = password;
    this.queryOperation = queryOperation;
    this.queryPrefix = queryPrefix || DEFAULT_QUERY_PREFIX;
  }

  get client() {
    const client = new ParsingClient({
      endpointUrl: this.endpoint.value,
      user: this.user,
      password: this.password,
    });
    return createPrefixedSparqlClient({
      client,
      queryPrefix: this.queryPrefix,
    });
  }

  get endpoint() {
    return this.ptr.out(ns.view.endpoint).term;
  }

  get graph() {
    return this.ptr.out(ns.view.graph).term;
  }

  async cube(term) {
    const cube = new Cube({
      parent: this,
      term: toTerm(term),
      source: this,
    });

    await cube.init();

    // empty cube?
    if (cube.ptr.out().terms.length === 0) {
      return null;
    }

    return cube;
  }

  cubesQuery({ filters } = {}) {
    return cubesQuery({
      graph: this.graph,
      filters,
    });
  }

  async cubes({ filters, noShape = false } = {}) {
    const rows = await this.client.query.select(this.cubesQuery({ filters }));

    return Promise.all(
      rows.map(async (row) => {
        const cube = new Cube({
          parent: this,
          term: row.cube,
          source: this,
        });

        await cube.fetchCube();

        if (!noShape) {
          await cube.fetchShape();
        }

        return cube;
      })
    );
  }

  viewListQuery({ filters } = {}) {
    return viewListQuery({
      graph: this.graph,
      filters,
    });
  }

  async views({ filters } = {}) {
    const rows = await this.client.query.select(
      this.viewListQuery({ filters })
    );

    return Promise.all(
      rows.map(async (row) => {
        const view = new View({
          parent: this,
          term: row.view,
          source: this,
        });

        await view.fetchView();

        return view;
      })
    );
  }

  async view(term) {
    const view = new View({
      parent: this,
      term: toTerm(term),
      source: this,
    });

    await view.init();

    // empty view?
    if (view.ptr.out().terms.length === 0) {
      return null;
    }

    return view;
  }
}

module.exports = Source;
