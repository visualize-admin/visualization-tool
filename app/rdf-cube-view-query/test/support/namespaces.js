const namespace = require("@rdfjs/namespace");

const ns = {
  cube: namespace("https://cube.link/"),
  ex: namespace("http://example.org/"),
  rdf: namespace("http://www.w3.org/1999/02/22-rdf-syntax-ns#"),
  sh: namespace("http://www.w3.org/ns/shacl#"),
  view: namespace("https://cube.link/view/"),
  xsd: namespace("http://www.w3.org/2001/XMLSchema#"),
};

module.exports = ns;
