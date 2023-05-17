const Source = require("./Source");
const ns = require("./namespaces");

class LookupSource extends Source {
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
      endpointUrl,
      sourceGraph,
      user,
      password,
      queryOperation,
      queryPrefix,
    });

    this.ptr.addOut(ns.rdf.type, ns.view.LookupSource);
  }

  static fromSource(source, { parent, term, dataset, graph } = {}) {
    return new LookupSource({
      parent: parent || source,
      term,
      dataset: dataset || source.dataset,
      graph,
      endpointUrl: source.endpoint.value,
      sourceGraph: source.graph,
      user: source.user,
      password: source.password,
      queryOperation: source.queryOperation,
      queryPrefix: source.queryPrefix,
    });
  }
}

module.exports = LookupSource;
