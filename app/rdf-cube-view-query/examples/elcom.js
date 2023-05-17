const { Source, View } = require("..");
const rdf = require("rdf-ext");
const namespace = require("@rdfjs/namespace");

const ns = {
  energyPricing: namespace(
    "https://energy.ld.admin.ch/elcom/electricity-price/dimension/"
  ),
  schema: namespace("http://schema.org/"),
};

async function main() {
  // a source manages the SPARQL endpoint information + the named graph
  const source = new Source({
    endpointUrl: "https://test.lindas.admin.ch/query",
    sourceGraph: "https://lindas.admin.ch/elcom/electricityprice",
    // user: '',
    // password: ''
  });

  // the source can be used to search for cubes on the endpoint in the given named graph
  /* const cubes = await source.cubes()

  // all available cubes are returned as an array and can be searched based on the metadata
  const tariffsCube = cubes.find(cube => {
    // let's look for a cube "Electricity tariff per provider"
    return cube.out(ns.schema.name).terms
      .filter(term => term.language === 'en')
      .some(term => term.value === 'Electricity tariff per provider')
  }) */

  // or if you know what you are looking for, just use the IRI
  const tariffsCube = await source.cube(
    "https://energy.ld.admin.ch/elcom/electricity-price/cube"
  );

  // now let's create a view from the cube, which is required to get the observations
  const tariffsView = View.fromCube(tariffsCube);

  const dimensions = tariffsView.dimensions;

  // let's find the period dimension based on the IRI of the cube dimension
  const periodDimension = tariffsView.dimension({
    cubeDimension: ns.energyPricing.period,
  });

  // the datatype and ranges are available from the cube dimension
  const periodDatatype = periodDimension.cubeDimensions[0].datatype;
  const periodMin = parseInt(
    periodDimension.cubeDimensions[0].minInclusive.value
  );
  const periodMax = parseInt(
    periodDimension.cubeDimensions[0].maxInclusive.value
  );

  // which allows us to create a new filter that is in the range of the data and has a matching datatype
  const periodMean = Math.floor((periodMin + periodMax) * 0.5);
  const periodFilter = periodDimension.filter.gte(
    rdf.literal(periodMean, periodDatatype)
  );

  // let's find the municipality dimension based on the IRI of the cube dimension
  const municipalityDimension = tariffsView.dimension({
    cubeDimension: ns.energyPricing.municipality,
  });

  // the municipality dimension as an option list available in the cube dimension as in property
  const municipalities = municipalityDimension.cubeDimensions[0].in;

  // let's use two municipalities from the list in the filter
  const municipalityFilter = municipalityDimension.filter.in(
    municipalities.slice(0, 2)
  );

  const filters = [periodFilter, municipalityFilter];

  // now let's create again a view from a cube, but only with the selected dimensions and built filters
  const customView = new View({ dimensions, filters });

  // the following view would be the same as in the elcom-without-cube example
  // const customView = new View({ dimensions: [periodDimension, municipalityDimension], filters })

  // and finally let's fetch the observations
  const observations = await customView.observations();
  console.log(`found ${observations.length} observations`);

  // maybe we also want to know how the query looks
  console.log(customView.observationsQuery().query.toString());
}

main();
