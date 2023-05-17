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

  await view.fetchCubesShapes();

  console.log("---------");
  for (const dimension of view.dimensions) {
    for (const cubeDimension of dimension.cubeDimensions) {
      console.log("Path", cubeDimension.path.value);
      for (const current of cubeDimension.in) {
        console.log("\t", current.value);
      }
    }
  }
}

function getSampleData() {
  const viewTTL = `
<https://example.org/view> a <https://cube.link/view/View> ;
\t<https://cube.link/view/dimension> [
\t\t<https://cube.link/view/from> [
\t\t\t<https://cube.link/view/source> _:b0_b41 ;
\t\t\t<https://cube.link/view/path> <https://ld.stadt-zuerich.ch/statistics/property/ZEIT> ;
\t\t] ;
\t\t<https://cube.link/view/as> <https://ld.stadt-zuerich.ch/statistics/property/ZEIT> ;
\t], [
\t\t<https://cube.link/view/from> [
\t\t\t<https://cube.link/view/source> _:b0_b41 ;
\t\t\t<https://cube.link/view/path> <https://ld.stadt-zuerich.ch/statistics/property/ALT> ;
\t\t] ;
\t\t<https://cube.link/view/as> <https://ld.stadt-zuerich.ch/statistics/property/ALT> ;
\t], [
\t\t<https://cube.link/view/from> [
\t\t\t<https://cube.link/view/source> _:b0_b41 ;
\t\t\t<https://cube.link/view/path> <https://cube.link/observedBy> ;
\t\t] ;
\t\t<https://cube.link/view/as> <https://cube.link/observedBy> ;
\t] ;
\t<https://cube.link/view/projection> [
\t\t<https://cube.link/view/offset> 10 ;
\t\t<https://cube.link/view/limit> 10 ;
\t] .

_:b0_b41 a <https://cube.link/view/CubeSource> ;
\t<https://cube.link/view/endpoint> <https://ld.stadt-zuerich.ch/query> ;
\t<https://cube.link/view/cube> <https://ld.stadt-zuerich.ch/statistics/GES-ALT-SEX> .
`;

  const parser = new Parser();

  const quads = parser.parse(viewTTL);
  const dataset = rdf.dataset().addAll(quads);
  const term = rdf.namedNode("https://example.org/view");

  return { term, dataset };
}

main();
