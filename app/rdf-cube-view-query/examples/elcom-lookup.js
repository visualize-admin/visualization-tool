const { LookupSource, Source, View } = require("..");
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

  const tariffsCube = await source.cube(
    "https://energy.ld.admin.ch/elcom/electricity-price/cube"
  );

  // let's create the lookup source based on the existing source
  const lookup = LookupSource.fromSource(source);

  // now let's create a view from the cube, which is required to get the observations
  const tariffsView = View.fromCube(tariffsCube);

  const customView = new View({ parent: source });

  const operatorDimension = tariffsView.dimension({
    cubeDimension: ns.energyPricing.operator,
  });
  const operatorLabelDimension = customView.createDimension({
    source: lookup,
    path: ns.schema.name,
    join: operatorDimension,
    as: ns.energyPricing.operatorLabel,
  });

  const operatorLabelLanguageFilter = operatorLabelDimension.filter.lang([
    "de",
    "en",
    "*",
  ]);

  customView
    .addDimension(operatorDimension)
    .addDimension(operatorLabelDimension)
    .addFilter(operatorLabelLanguageFilter);

  // and finally let's fetch the observations
  const observations = await customView.observations();
  console.log(`found ${observations.length} observations`);
  console.log(observations);

  // maybe we also want to know how the query looks
  console.log(customView.observationsQuery().query.toString());
}

main();
