import namespace from "@rdfjs/namespace";

export {
  dcat,
  dcterms,
  geo,
  qudt,
  rdf,
  rdfs,
  schema,
  sh,
  skos,
  time,
  vcard,
  xsd,
} from "@tpluscode/rdf-ns-builders";

export const classifications = namespace(
  "http://classifications.data.admin.ch/"
);
export const schemaAdmin = namespace("https://schema.ld.admin.ch/");
export const adminTerm = namespace("https://ld.admin.ch/definedTerm/");
export const adminVocabulary = namespace("https://ld.admin.ch/vocabulary/");
export const cube = namespace("https://cube.link/");
export const cubeView = namespace("https://cube.link/view/");
export const cubeMeta = namespace("https://cube.link/meta/");
export const view = namespace("https://cube.link/view/");
export const visualizeAdmin = namespace("https://visualize.admin.ch/");
