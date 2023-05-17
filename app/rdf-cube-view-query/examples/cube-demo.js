const { Source, View } = require("..");
const rdf = require("rdf-ext");
const namespace = require("@rdfjs/namespace");
const TermSet = require("@rdfjs/term-set");

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

  // the view could be already used to get the observations if all dimensions should be selected and not filters applied
  /* const observations = await thermometerView.observations()
  console.log(observations) */

  // the term set filled with the selected dimensions simplifies the dimensions filter code
  const selected = new TermSet([ns.dc.date, ns.dh.temperature]);

  // now we can filter the dimensions of the view to the selected dimensions
  const dimensions = thermometerView.dimensions.filter((dimension) => {
    // the cube dimension contains the property, but a view dimension could point to multiple cube dimensions
    // that's why we have to loop with .some and check the path of each cube dimension
    return dimension.cubeDimensions.some((cubeDimension) =>
      selected.has(cubeDimension.path)
    );
  });

  // let's find a specific dimension to create some filters
  const dateDimension = dimensions.find((dimension) => {
    // the path could be used again to search for a specific property
    // return dimension.cubeDimensions.some(cubeDimension => cubeDimension.path.equals(ns.dc.date))

    // it would be also possible to search for a dimension by datatype like xsd:dateTime
    return dimension.cubeDimensions.some((cubeDimension) =>
      cubeDimension.datatype.equals(ns.xsd.dateTime)
    );
  });

  // the dimension has a .filter property to build filters with the operation given as method name and the value to compare as argument
  const dateGteFilter = dateDimension.filter.gte(
    rdf.literal("2019-01-08T12:00:00.017000+00:00", ns.xsd.dateTime)
  );
  const dateLtFilter = dateDimension.filter.lt(
    rdf.literal("2019-01-12T12:00:00.017000+00:00", ns.xsd.dateTime)
  );
  const filters = [dateGteFilter, dateLtFilter];

  // now let's create again a view from a cube, but only with the selected dimensions and built filters
  const customView = new View({ dimensions, filters });

  // and finally let's fetch the observations
  const observations = await customView.observations();

  console.log(observations);

  const sizeBefore = thermometerView.ptr.dataset.size;
  thermometerView.clear();
  const sizeAfter = thermometerView.ptr.dataset.size;
  source.clear();
  const sizeEnd = thermometerView.ptr.dataset.size;

  console.log(thermometerView.ptr.dataset.toString());

  console.log(
    `dataset size before clearing view related quads ${sizeBefore} and after ${sizeAfter}`
  );
  console.log(`dataset size after clearing the initial source ${sizeEnd}`);
}

main();
