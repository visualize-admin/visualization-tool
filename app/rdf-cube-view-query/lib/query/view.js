const rdf = require("rdf-ext");
const sparql = require("rdf-sparql-builder");
const ns = require("../namespaces.js");

function viewDefQuery({ view, graph = rdf.defaultGraph() } = {}) {
  const viewURI = `<${view.value}>`;
  const predicate = rdf.variable("predicate");
  const object = rdf.variable("object");
  const sProjection = rdf.variable("sProjection");
  const pProjection = rdf.variable("pProjection");
  const oProjection = rdf.variable("oProjection");

  return sparql
    .construct([
      [viewURI, predicate, object],
      [sProjection, pProjection, oProjection],
    ])
    .from(graph)
    .where([
      [viewURI, predicate, object],
      sparql.optional([
        [viewURI, ns.view.projection, sProjection],
        [sProjection, pProjection, oProjection],
      ]),
    ])
    .toString();
}

module.exports = viewDefQuery;
