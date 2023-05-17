const { Parser } = require("n3");
const rdf = require("rdf-ext");
const { ViewBuilder } = require("../lib/builders.js");

async function main() {
  const { dataset, term } = getSampleData();
  const { view } = ViewBuilder.fromDataset({ dataset, term });

  console.log("---------");
  console.log(
    "All sources",
    view.sources().map((x) => x.endpoint)
  );

  console.log("---------");
  console.log(
    "All cubes",
    view.cubes().map((x) => x.value)
  );

  const observations = await view.observations();
  console.log("---------");
  console.log("observations length", observations.length);

  const count = await view.observationCount();
  console.log("---------");
  console.log("observations count", count);

  await view.fetchCubesShapes();

  console.log("---------");
  console.log("shape quads count", view.shapesQuads.length);

  console.log("---------");
  console.log("shapes data", rdf.dataset().addAll(view.shapesQuads).toString());

  console.log("---------");
  for (const dimension of view.dimensions) {
    console.log(
      "dimensions",
      dimension.cubeDimensions.map((x) => x.path.value),
      "from cubes",
      dimension.cubes.map((x) => x.value)
    );
  }
}

function getSampleData() {
  const viewTTL = `

<https://example.org/view> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <https://cube.link/view/View> .
<https://example.org/view> <https://cube.link/view/dimension> _:b37 .
<https://example.org/view> <https://cube.link/view/dimension> _:b39 .
<https://example.org/view> <https://cube.link/view/dimension> _:b41 .
<https://example.org/view> <https://cube.link/view/dimension> _:b43 .
<https://example.org/view> <https://cube.link/view/dimension> _:b45 .
<https://example.org/view> <https://cube.link/view/dimension> _:b47 .
<https://example.org/view> <https://cube.link/view/dimension> _:b49 .
<https://example.org/view> <https://cube.link/view/projection> _:b36 .

_:b37 <https://cube.link/view/from> _:b38 .
_:b37 <https://cube.link/view/as> <https://ld.stadt-zuerich.ch/statistics/property/ZEIT> .
_:b39 <https://cube.link/view/from> _:b40 .
_:b39 <https://cube.link/view/as> <https://ld.stadt-zuerich.ch/statistics/property/TIME> .
_:b41 <https://cube.link/view/from> _:b42 .
_:b41 <https://cube.link/view/as> <https://ld.stadt-zuerich.ch/statistics/property/RAUM> .
_:b43 <https://cube.link/view/from> _:b44 .
_:b43 <https://cube.link/view/as> <https://ld.stadt-zuerich.ch/statistics/property/SEX> .
_:b45 <https://cube.link/view/from> _:b46 .
_:b45 <https://cube.link/view/as> <https://ld.stadt-zuerich.ch/statistics/measure/BEW> .
_:b47 <https://cube.link/view/from> _:b48 .
_:b47 <https://cube.link/view/as> <https://ld.stadt-zuerich.ch/statistics/attribute/KORREKTUR> .
_:b49 <https://cube.link/view/from> _:b50 .
_:b49 <https://cube.link/view/as> <https://cube.link/observedBy> .
_:b36 <https://cube.link/view/limit> "10"^^<http://www.w3.org/2001/XMLSchema#integer> .
_:b36 <https://cube.link/view/offset> "0"^^<http://www.w3.org/2001/XMLSchema#integer> .
_:b38 <https://cube.link/view/source> _:b34 .
_:b38 <https://cube.link/view/path> <https://ld.stadt-zuerich.ch/statistics/property/ZEIT> .
_:b34 <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <https://cube.link/view/CubeSource> .
_:b34 <https://cube.link/view/endpoint> <https://lindas.admin.ch/query> .
_:b34 <https://cube.link/view/cube> <https://ld.stadt-zuerich.ch/statistics/BEW-SEX> .

<https://ld.stadt-zuerich.ch/statistics/BEW-SEX> <https://cube.link/observationConstraint> <https://ld.stadt-zuerich.ch/statistics/BEW-SEX/shape/> .

_:b40 <https://cube.link/view/source> _:b34 .
_:b40 <https://cube.link/view/path> <https://ld.stadt-zuerich.ch/statistics/property/TIME> .
_:b42 <https://cube.link/view/source> _:b34 .
_:b42 <https://cube.link/view/path> <https://ld.stadt-zuerich.ch/statistics/property/RAUM> .
_:b44 <https://cube.link/view/source> _:b34 .
_:b44 <https://cube.link/view/path> <https://ld.stadt-zuerich.ch/statistics/property/SEX> .
_:b46 <https://cube.link/view/source> _:b34 .
_:b46 <https://cube.link/view/path> <https://ld.stadt-zuerich.ch/statistics/measure/BEW> .
_:b48 <https://cube.link/view/source> _:b34 .
_:b48 <https://cube.link/view/path> <https://ld.stadt-zuerich.ch/statistics/attribute/KORREKTUR> .

<https://ld.stadt-zuerich.ch/statistics/attribute/KORREKTUR> <http://label> "KORREKTUR" .

_:b50 <https://cube.link/view/source> _:b34 .
_:b50 <https://cube.link/view/path> <https://cube.link/observedBy> .
`;

  const parser = new Parser();

  const quads = parser.parse(viewTTL);
  const dataset = rdf.dataset().addAll(quads);
  const term = rdf.namedNode("https://example.org/view");

  return { term, dataset };
}

main();
