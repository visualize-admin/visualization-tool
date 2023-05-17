const { CubeSource, Source, View } = require("..");
const rdf = require("rdf-ext");
const namespace = require("@rdfjs/namespace");

const ns = {
  energyPricing: namespace(
    "https://energy.ld.admin.ch/elcom/electricity-price/dimension/"
  ),
  xsd: namespace("http://www.w3.org/2001/XMLSchema#"),
};

async function main() {
  // a source manages the SPARQL endpoint information + the named graph
  const source = new Source({
    endpointUrl: "https://test.lindas.admin.ch/query",
    sourceGraph: "https://lindas.admin.ch/elcom/electricityprice",
    // user: '',
    // password: ''
  });

  const cubeSource = CubeSource.fromSource(
    source,
    rdf.namedNode("https://energy.ld.admin.ch/elcom/electricity-price/cube")
  );

  // we start with an empty view
  const customView = new View({ parent: cubeSource });

  // now let's create the first dimension
  const periodDimension = customView.createDimension({
    source: cubeSource,
    path: ns.energyPricing.period,
  });

  // and we add it to the view
  customView.addDimension(periodDimension);

  // let's also create a filter for the dimension
  const periodFilter = periodDimension.filter.gte(
    rdf.literal("2015", ns.xsd.gYear)
  );

  // and we add it to the view
  customView.addFilter(periodFilter);

  // let's create a second dimension
  const municipalityDimension = customView.createDimension({
    source: cubeSource,
    path: ns.energyPricing.municipality,
  });

  // and we add it to the view
  customView.addDimension(municipalityDimension);

  // and again a filter for it
  const municipalityFilter = municipalityDimension.filter.in([
    rdf.namedNode("https://register.ld.admin.ch/municipality/3215"),
    rdf.namedNode("https://register.ld.admin.ch/municipality/58"),
  ]);

  // and add it to the view
  customView.addFilter(municipalityFilter);

  // and finally let's fetch the observations
  const observations = await customView.observations();
  console.log(`found ${observations.length} observations`);

  // maybe we also want to know how the query looks
  console.log(customView.observationsQuery().query.toString());
}

main();
