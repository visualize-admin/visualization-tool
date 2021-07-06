import namespace from "@rdfjs/namespace";

export {
  dcat,
  dcterms,
  qudt,
  rdf,
  rdfs,
  schema,
  vcard,
  time,
  xsd,
  sh,
} from "@tpluscode/rdf-ns-builders";

export const classifications = namespace(
  "http://classifications.data.admin.ch/"
);
export const schemaAdmin = namespace("https://schema.ld.admin.ch/");
export const adminTerm = namespace("https://ld.admin.ch/definedTerm/");
export const cube = namespace("https://cube.link/");
export const cubeView = namespace("https://cube.link/view/");
export const cubeMeta = namespace("https://cube.link/meta/");

export const visualizeAdmin = namespace("https://visualize.admin.ch/");
