const { CubeSource, LookupSource, Source, View } = require("..");
const rdf = require("rdf-ext");
const namespace = require("@rdfjs/namespace");

const ns = {
  dc: namespace("http://purl.org/dc/elements/1.1/"),
  dh: namespace("http://ns.bergnet.org/dark-horse#"),
  schema: namespace("http://schema.org/"),
};

async function main() {
  // a source manages the SPARQL endpoint information + the named graph
  const source = new Source({
    endpointUrl: "http://ld.zazuko.com/query",
    sourceGraph: "http://ld.zazuko.com/cube-demo",
    // user: '',
    // password: ''
  });

  // let's create a cube and lookup source based on the existing source
  const cubeSource = CubeSource.fromSource(
    source,
    rdf.namedNode(
      "http://example.org/rdf-cube-schema-example/temperature-sensor/cube"
    )
  );
  const lookupSource = LookupSource.fromSource(source);

  // we start with an empty view
  const customView = new View({ parent: cubeSource });

  // now let's create the dimensions
  const dateDimension = customView.createDimension({
    source: cubeSource,
    path: ns.dc.date,
  });

  const temperatureDimension = customView.createDimension({
    source: cubeSource,
    path: ns.dh.temperature,
  });

  const roomDimension = customView.createDimension({
    source: cubeSource,
    path: ns.dh.room,
  });

  // lookup dimensions need an addition join property pointing to the dimension used to join this dimension
  const roomLabelDimension = customView.createDimension({
    source: lookupSource,
    path: ns.schema.name,
    join: roomDimension,
  });

  // it's possible to filter for labels in a specific language using an array as priority list
  const roomLabelLanguageFilter = roomLabelDimension.filter.lang([
    "",
    "de",
    "en",
    "*",
  ]);

  // now let's add all dimensions and filters
  customView
    .addDimension(dateDimension)
    .addDimension(temperatureDimension)
    .addDimension(roomLabelDimension)
    .addDimension(roomDimension)
    .addFilter(roomLabelLanguageFilter)
    .limit(5);

  // and finally let's fetch the observations
  const observations = await customView.observations();
  console.log(`found ${observations.length} observations (using limit 5)`);

  const count = await customView.observationCount();
  console.log(`found ${count} observations (using .observationCount())`);

  // maybe we also want to know how the query looks
  console.log(customView.observationsQuery().query.toString());
}

main();
