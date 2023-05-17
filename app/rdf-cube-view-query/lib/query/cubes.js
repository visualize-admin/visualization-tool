const rdf = require("rdf-ext");
const sparql = require("rdf-sparql-builder");
const ns = require("../namespaces.js");

function cubesQuery({ filters = [], graph = rdf.defaultGraph() } = {}) {
  const cube = rdf.variable("cube");

  const patterns = [[cube, ns.rdf.type, ns.cube.Cube]];

  for (const [index, filter] of filters.entries()) {
    const content = filter({ cube, index });

    for (const c of content) {
      patterns.push(c);
    }
  }

  return sparql.select([cube]).from(graph).where(patterns).toString();
}

module.exports = cubesQuery;
