const { CubeSource, Dimension, Source, View } = require("..");
const rdf = require("rdf-ext");
const namespace = require("@rdfjs/namespace");

const ns = {
  dc: namespace("http://purl.org/dc/elements/1.1/"),
  dh: namespace("http://ns.bergnet.org/dark-horse#"),
  xsd: namespace("http://www.w3.org/2001/XMLSchema#"),
};

async function main() {
  const dateList = [
    new Date("2019-01-02T00:00:00"),
    new Date("2019-01-06T00:00:00"),
    new Date("2019-01-10T00:00:00"),
  ];

  // a source manages the SPARQL endpoint information + the named graph
  const source = new Source({
    endpointUrl: "http://ld.zazuko.com/query",
    sourceGraph: "http://ld.zazuko.com/cube-demo",
    // user: '',
    // password: ''console.log(source.dataset.size)
  });

  // create a cube source to read a specific cube from the endpoint information of source
  const cubeSource = CubeSource.fromSource(
    source,
    "http://localhost:8080/rdf-cube-schema-example/temperature-sensor/cube"
  );

  // let's create the dimensions
  // we want to keep them, so we attach them to the source
  const dateDimension = new Dimension({
    parent: source,
    source: cubeSource,
    path: ns.dc.date,
  });

  const temperatureDimension = new Dimension({
    parent: source,
    source: cubeSource,
    path: ns.dh.temperature,
  });

  console.log(
    `dataset size before creating the dynamic view: ${source.dataset.size}`
  );

  // we loop over the date list and create a view per date with the date as a filter
  for (const date of dateList) {
    const customView = new View({ parent: source });

    // the filter is attached to the view, so it will be removed when the view is cleared
    const dateFilter = dateDimension.filter.gte(
      rdf.literal(date.toISOString(), ns.xsd.dateTime),
      { parent: customView }
    );

    // the view combines the dimensions which are reused with the filter that is created per view
    customView
      .addDimension(dateDimension)
      .addDimension(temperatureDimension)
      .addFilter(dateFilter);

    // and finally let's fetch the observations
    const observations = await customView.observations();
    console.log(`found ${observations.length} observations`);

    // maybe we also want to know how the query looks
    // console.log(customView.observationsQuery().query.toString())

    // clear the view and all attached objects
    customView.clear();
  }

  console.log(
    `dataset size after creating the dynamic view: ${source.dataset.size}`
  );
}

main();
