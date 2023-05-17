const { Source } = require("..");
const rdf = require("rdf-ext");

async function main() {
  const queryPrefix = `#pragma describe.strategy cbd
#pragma join.hash off
`;
  const source = new Source({
    endpointUrl: "https://int.lindas.admin.ch/query",
    queryPrefix,
  });

  const view = await source.view(
    rdf.namedNode("https://ld.stadt-zuerich.ch/statistics/view/V000002")
  );

  const observations = await view.observations();
  console.log("---------");
  console.log("view.observations().length", observations.length);

  const count = await view.observationCount();
  console.log("---------");
  console.log("count", count);

  console.log("---------");
  console.log("All cubes", view.cubes());
}

main();
