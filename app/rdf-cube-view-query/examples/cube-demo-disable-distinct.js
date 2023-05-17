const { Source, View } = require("..");
const namespace = require("@rdfjs/namespace");

const ns = {
  dc: namespace("http://purl.org/dc/elements/1.1/"),
  dh: namespace("http://ns.bergnet.org/dark-horse#"),
  schema: namespace("http://schema.org/"),
  xsd: namespace("http://www.w3.org/2001/XMLSchema#"),
};

async function main() {
  // a source manages the SPARQL endpoint information + the named graph
  const source = new Source({
    endpointUrl: "http://ld.zazuko.com/query",
    sourceGraph: "http://ld.zazuko.com/cube-demo",
    // user: '',
    // password: ''
  });

  // the source can be used to search for cubes on the endpoint in the given named graph
  const cubes = await source.cubes();

  // all available cubes are returned as an array and can be searched based on the metadata
  const thermometerCube = cubes.find((cube) => {
    // let's look for a cube that contains the string 'Thermometer' in the german name property
    return cube
      .out(ns.schema.name, { language: "de" })
      .values.some((value) => value.includes("Thermometer"));
  });

  // now let's create a view from the cube, which is required to get the observations
  const thermometerView = View.fromCube(thermometerCube);

  // with the disableDistinct flag it's possible to generate a query without DISTINCT and GROUP BY
  // that query will give you a better performance

  // WARNING!!!
  //
  // the result can be wrong if you:
  // - don't include all dimensions of the cube
  // - apply filters
  // - join with other cubes or lookups
  const { query } = thermometerView.observationsQuery({
    disableDistinct: true,
  });

  console.log(query.toString());
}

main();
