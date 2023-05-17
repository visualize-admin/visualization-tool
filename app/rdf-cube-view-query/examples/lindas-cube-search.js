const { Cube, Source } = require("..");
const namespace = require("@rdfjs/namespace");

const ns = {
  adminTerm: namespace("https://ld.admin.ch/definedTerm/"),
  schema: namespace("http://schema.org/"),
};

async function main() {
  const source = new Source({
    endpointUrl: "https://int.lindas.admin.ch/query",
  });

  // the source can be used to search for cubes and allows server side filtering
  const cubes = await source.cubes({
    filters: [
      Cube.filter.noValidThrough(),
      Cube.filter.status(ns.adminTerm("CreativeWorkStatus/Draft")),
    ],
  });

  for (const cube of cubes) {
    const iri = cube.term.value;
    const label = cube.out(ns.schema.name, { language: ["en", "de", "*"] });
    const versionHistory = cube.in(ns.schema.hasPart).value;

    console.log(`${iri}: ${label} (${versionHistory})`);
  }
}

main();
