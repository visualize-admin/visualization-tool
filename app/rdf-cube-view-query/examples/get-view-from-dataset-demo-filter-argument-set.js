const { Parser } = require("n3");
const rdf = require("rdf-ext");
const { ViewBuilder } = require("../lib/builders.js");
const { Source } = require("../index.js");

async function main() {
  const source = new Source({
    endpointUrl: "https://ld.integ.stadt-zuerich.ch/query",
  });

  const { dataset, term } = getSampleData();
  const { view } = ViewBuilder.fromDataset({ dataset, source, term });

  console.log("---------");
  console.log(
    "All sources",
    view.sources().map((x) => x.endpoint)
  );

  console.log("---------");
  console.log(
    "All filters",
    view.filters.map(
      (x) =>
        `dimension:${x.dimension.value} operation:${x.operation.value} arg:${
          x.arg?.value
        } args:${x.args?.map((y) => y.value)}`
    )
  );

  console.log("---------");
  console.log(
    "All cubes",
    view.cubes().map((x) => x.value)
  );

  const { query } = view.observationsQuery();
  console.log(query.toString());

  const count = await view.observationCount();
  console.log("---------");
  console.log("observations count", count);

  await view.fetchCubesShapes();

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
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .

<http://example.org>
   rdf:type <https://cube.link/view/View> ;
   <https://cube.link/view/dimension> _:b18 ,
      _:b20 ,
      _:b22 ,
      _:b24 ,
      _:b377_b375 ;
   <https://cube.link/view/filter> _:b323 ;
   <https://cube.link/view/projection> _:b2 ;
   <urn:ssz:source> <source/o2C8J1Ol_jDWmx8-jkh2e> .
_:b2
   <https://cube.link/view/columns> _:b19 .
<source/o2C8J1Ol_jDWmx8-jkh2e>
   rdf:type <https://cube.link/view/CubeSource> ;
   rdfs:label "Wirtschaftliche Umzüge nach Umzugsquartier, Umzugskreis" ;
   <https://cube.link/view/cube> <https://ld.stadt-zuerich.ch/statistics/000045> ;
   <urn:ssz:keyFigure> <https://ld.stadt-zuerich.ch/statistics/measure/UMZ> .
_:b18
   rdf:type <https://cube.link/view/Dimension> ;
   rdfs:label "Measure Umzüge von Personen (wirtschaftlich) (Wirtschaftliche Umzüge nach Umzugsquartier, Umzugskreis)" ;
   <https://cube.link/view/from> _:b19 ;
   <urn:ssz:generated> true .
_:b20
   rdf:first _:b20 ;
   rdf:rest _:b21 ;
   rdf:type <https://cube.link/view/Dimension> ;
   rdfs:label "Key Zeit" ;
   <https://cube.link/view/from> _:b21 ;
   <urn:ssz:generated> true .
_:b22
   rdf:first _:b24 ;
   rdf:rest rdf:nil ;
   rdf:type <https://cube.link/view/Dimension> ;
   rdfs:label "Key Raum" ;
   <https://cube.link/view/from> _:b23 ;
   <urn:ssz:generated> true .
_:b24
   rdf:type <https://cube.link/view/Dimension> ;
   rdfs:label "Key Ort" ;
   <https://cube.link/view/from> _:b25 ;
   <urn:ssz:generated> true .
_:b377_b375
   rdf:type <https://cube.link/view/Dimension> ,
      <urn:ssz:FilterDimension> ;
   <https://cube.link/view/from> _:b377_b376 .
_:b323
   rdf:type <https://cube.link/view/Filter> ;
   <https://cube.link/view/argument> <https://ld.stadt-zuerich.ch/statistics/code/R00022> ,
      <https://ld.stadt-zuerich.ch/statistics/code/R00074> ,
      <https://ld.stadt-zuerich.ch/statistics/code/R00073> ,
      <https://ld.stadt-zuerich.ch/statistics/code/R00071> ;
   <https://cube.link/view/dimension> _:b377_b375 ;
   <https://cube.link/view/operation> <https://cube.link/view/In> ;
   <urn:ssz:baseDimension> _:b22 ;
   <urn:ssz:filterTermSet> <https://ld.stadt-zuerich.ch/statistics/termset/QuartiereZH> .
_:b19
   rdf:first _:b18 ;
   rdf:rest _:b20 ;
   <https://cube.link/view/path> <https://ld.stadt-zuerich.ch/statistics/measure/UMZ> ;
   <https://cube.link/view/source> <source/o2C8J1Ol_jDWmx8-jkh2e> .
_:b21
   rdf:first _:b22 ;
   rdf:rest _:b22 ;
   <https://cube.link/view/path> <https://ld.stadt-zuerich.ch/statistics/property/ZEIT> ;
   <https://cube.link/view/source> <source/o2C8J1Ol_jDWmx8-jkh2e> .
_:b23
   <https://cube.link/view/path> <https://ld.stadt-zuerich.ch/statistics/property/RAUM> ;
   <https://cube.link/view/source> <source/o2C8J1Ol_jDWmx8-jkh2e> .
_:b25
   <https://cube.link/view/path> <https://ld.stadt-zuerich.ch/statistics/property/ORT> ;
   <https://cube.link/view/source> <source/o2C8J1Ol_jDWmx8-jkh2e> .
_:b377_b376
   <https://cube.link/view/path> <https://ld.stadt-zuerich.ch/statistics/property/RAUM> ;
   <https://cube.link/view/source> <source/o2C8J1Ol_jDWmx8-jkh2e> .

`;
  const parser = new Parser();

  const quads = parser.parse(viewTTL);
  const dataset = rdf.dataset().addAll(quads);
  const term = rdf.namedNode("http://example.org");

  return { term, dataset };
}

main();
