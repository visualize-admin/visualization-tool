const { CubeSource, LookupSource, Node, Source, View } = require("..");
const rdf = require("rdf-ext");
const namespace = require("@rdfjs/namespace");
const TermMap = require("@rdfjs/term-map");

const ns = {
  dc: namespace("http://purl.org/dc/elements/1.1/"),
  dh: namespace("http://ns.bergnet.org/dark-horse#"),
  schema: namespace("http://schema.org/"),
};

// creates a map with the cube dimension value as the key and the lookup path value as the value
async function createMap({
  cubeFilter,
  cubePath,
  cubeSource,
  lookupFilter,
  lookupPath,
  lookupSource,
} = {}) {
  const parent = new Node({ parent: cubeSource });
  const view = new View({ parent });

  const cubeDimension = view.createDimension({
    source: cubeSource,
    path: cubePath,
    as: "cube",
  });

  view.addDimension(cubeDimension);

  if (typeof cubeFilter === "function") {
    const filter = cubeFilter(cubeDimension);

    if (filter) {
      view.addFilter(filter);
    }
  }

  const lookupDimension = view.createDimension({
    source: lookupSource || LookupSource.fromSource(cubeSource, { parent }),
    path: lookupPath,
    join: cubeDimension,
    as: "lookup",
  });

  view.addDimension(lookupDimension);

  if (typeof lookupFilter === "function") {
    const filter = lookupFilter(lookupDimension);

    if (filter) {
      view.addFilter(filter);
    }
  }

  const observations = await view.observations();

  parent.clear();

  return new TermMap(
    observations.map((observation) => {
      return [observation.cube, observation.lookup];
    })
  );
}

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

  // now let's add all dimensions and filters
  customView
    .addDimension(dateDimension)
    .addDimension(temperatureDimension)
    .addDimension(roomDimension);

  const roomLabelMap = await createMap({
    cubePath: ns.dh.room,
    cubeSource,
    lookupFilter: (d) => d.filter.lang(["", "de", "en", "*"]),
    lookupPath: ns.schema.name,
  });

  // let's fetch the observations
  const observations = await customView.observations();

  // and join the observations with the room lookup map
  for (const observation of observations) {
    const columns = [
      observation[ns.dc.date.value].value,
      observation[ns.dh.temperature.value].value,
      // the room dimension is used to lookup the room label
      roomLabelMap.get(observation[ns.dh.room.value]).value,
    ];

    console.log(columns.join(","));
  }
}

main();
