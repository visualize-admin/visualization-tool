const { Source, View } = require("..");

async function main() {
  const queryPrefix = `#pragma describe.strategy cbd
#pragma join.hash off`;

  const source = new Source({
    endpointUrl: "https://int.lindas.admin.ch/query",
    queryPrefix,
  });

  const cube = await source.cube(
    "https://ld.stadt-zuerich.ch/statistics/ZUS-BTA-ZSA"
  );
  const view = View.fromCube(cube);

  console.log("---------");
  console.log(
    "All sources",
    view.sources().map((x) => x.endpoint)
  );

  console.log("---------");
  console.log(
    "All cubes",
    view.cubes().map((x) => x.value)
  );

  const observations = await view.observations();
  console.log("---------");
  console.log("observations length", observations.length);

  const count = await view.observationCount();
  console.log("---------");
  console.log("observations count", count);

  console.log("---------");
  for (const dimension of view.dimensions) {
    console.log(
      "dimensions",
      dimension.cubeDimensions.map((x) => x.path.value),
      "from cubes",
      dimension.cubes.map((x) => x.value)
    );
  }
}

main();
