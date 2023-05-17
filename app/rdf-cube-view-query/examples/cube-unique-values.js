/**
 * This example shows how to retrieve unique values for a particular dimension
 * (here, dates) given a filter on another dimension (here room).
 */

const { CubeSource, Source, View } = require("..");
const rdf = require("rdf-ext");
const namespace = require("@rdfjs/namespace");

const ns = {
  dh: namespace("http://ns.bergnet.org/dark-horse#"),
  dc: namespace("http://purl.org/dc/elements/1.1/"),
  schema: namespace("http://schema.org/"),
};

async function main() {
  const source = new Source({
    endpointUrl: "http://ld.zazuko.com/query",
    sourceGraph: "http://ld.zazuko.com/cube-demo",
  });

  const cubeSource = CubeSource.fromSource(
    source,
    rdf.namedNode(
      "http://example.org/rdf-cube-schema-example/temperature-sensor/cube"
    )
  );

  const room1 = rdf.namedNode(
    "http://example.org/rdf-cube-schema-example/building1/level1/room1"
  );
  const customView = new View({ parent: cubeSource });
  const dateDimension = customView.createDimension({
    source: cubeSource,
    path: ns.dc.date,
  });
  const roomDimension = customView.createDimension({
    source: cubeSource,
    path: ns.dh.room,
  });
  customView
    .addDimension(dateDimension) // We are only interested in getting unique values for dates
    // And we add the room filter to retrieve dates for observations that have the room 1
    .addFilter(roomDimension.filter.eq(room1));

  // Uncomment to see the resulting sparql query
  // console.log(customView.observationsQuery().query.toString());
  const observations = await customView.observations();

  for (const observation of observations) {
    console.log(observation[ns.dc.date.value].value);
  }
}

main();
