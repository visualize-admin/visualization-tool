const rdf = require("rdf-ext");
const sparql = require("rdf-sparql-builder");
const ns = require("../namespaces.js");

function viewListQuery({ filters = [], graph = rdf.defaultGraph() } = {}) {
  const view = rdf.variable("view");

  const patterns = [[view, ns.rdf.type, ns.view.View]];

  for (const [index, filter] of filters.entries()) {
    const content = filter({ view, index });

    for (const c of content) {
      patterns.push(c);
    }
  }

  return sparql.select([view]).from(graph).where(patterns).toString();
}

module.exports = viewListQuery;
