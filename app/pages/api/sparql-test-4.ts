import { NextApiRequest, NextApiResponse } from "next";
import {
  DataCubeEntryPoint,
  DataCube,
  Dimension,
  SparqlFetcher
} from "@zazuko/query-rdf-data-cube";
import HttpsProxyAgent from "https-proxy-agent";
import { SPARQL_ENDPOINT } from "../../domain/env";
import { locales } from "../../locales/locales";

const getFetcher = () => {
  let proxyAgent;
  if (process.env.HTTPS_PROXY) {
    proxyAgent = new HttpsProxyAgent(process.env.HTTPS_PROXY);
  }

  return new SparqlFetcher(SPARQL_ENDPOINT, {
    fetchOptions: {
      agent: proxyAgent,
      method: "POST",
      headers: {
        Accept: "application/sparql-results+json",
        "Content-Type": "application/x-www-form-urlencoded; charset=utf-8"
      }
    }
  });
};

const mkTimeout = async (ms = 0) => {
  return new Promise<never>((resolve, reject) => {
    let id = setTimeout(() => {
      clearTimeout(id);
      reject(new Error("Timed out in " + ms + "ms."));
    }, ms);
  });
};

const QUERY_0 = `PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> PREFIX xsd: <http://www.w3.org/2001/XMLSchema#> PREFIX qb: <http://purl.org/linked-data/cube#> PREFIX dc11: <http://purl.org/dc/elements/1.1/> PREFIX dcterms: <http://purl.org/dc/terms/> PREFIX skos: <http://www.w3.org/2004/02/skos/core#> SELECT ?iri ?kind ?label ?scaleOfMeasure FROM <https://lindas-data.ch/graph/bafu/wald> WHERE { <http://environment.ld.admin.ch/foen/px/0703030000_124/dataset> rdf:type qb:DataSet. <http://environment.ld.admin.ch/foen/px/0703030000_124/dataset> (qb:structure/qb:component) ?componentSpec. ?componentSpec ?kind ?iri. FILTER(?kind IN(qb:attribute, qb:dimension, qb:measure)) OPTIONAL { ?iri <http://ns.bergnet.org/cube/scale/scaleOfMeasure> ?scaleOfMeasure. } OPTIONAL { ?iri (rdfs:label|skos:prefLabel) ?label_en. FILTER(LANGMATCHES(LANG(?label_en), "en"^^xsd:string)) } OPTIONAL { ?iri (rdfs:label|skos:prefLabel) ?label_de. FILTER(LANGMATCHES(LANG(?label_de), "de"^^xsd:string)) } OPTIONAL { ?iri (rdfs:label|skos:prefLabel) ?label_fr. FILTER(LANGMATCHES(LANG(?label_fr), "fr"^^xsd:string)) } OPTIONAL { ?iri (rdfs:label|skos:prefLabel) ?label_it. FILTER(LANGMATCHES(LANG(?label_it), "it"^^xsd:string)) } OPTIONAL { ?iri (rdfs:label|skos:prefLabel) ?label_. FILTER((LANG(?label_)) = ""^^xsd:string) } BIND(COALESCE(?label_en, ?label_de, ?label_fr, ?label_it, ?label_, ""^^xsd:string) AS ?label) }`;

const QUERY =
  'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\nPREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\nPREFIX xsd: <http://www.w3.org/2001/XMLSchema#>\nPREFIX qb: <http://purl.org/linked-data/cube#>\nPREFIX dc11: <http://purl.org/dc/elements/1.1/>\nPREFIX dcterms: <http://purl.org/dc/terms/>\nPREFIX skos: <http://www.w3.org/2004/02/skos/core#>\nSELECT ?dim0 ?dim0Label ?dim1 ?dim1Label ?dim2 ?dim2Label FROM <https://lindas-data.ch/graph/bafu/wald>\nWHERE {\n  ?observation rdf:type qb:Observation.\n  ?observation qb:dataSet <http://environment.ld.admin.ch/foen/px/0703030000_124/dataset>.\n  ?observation <http://environment.ld.admin.ch/foen/px/0703030000_124/dimension/0> ?dim0.\n  ?observation <http://environment.ld.admin.ch/foen/px/0703030000_124/dimension/1> ?dim1.\n  ?observation <http://environment.ld.admin.ch/foen/px/0703030000_124/dimension/2> ?dim2.\n  OPTIONAL {\n    ?dim0 (rdfs:label|skos:prefLabel) ?dim0Label_en.\n    FILTER(LANGMATCHES(LANG(?dim0Label_en), "en"^^xsd:string))\n  }\n  OPTIONAL {\n    ?dim0 (rdfs:label|skos:prefLabel) ?dim0Label_de.\n    FILTER(LANGMATCHES(LANG(?dim0Label_de), "de"^^xsd:string))\n  }\n  OPTIONAL {\n    ?dim0 (rdfs:label|skos:prefLabel) ?dim0Label_fr.\n    FILTER(LANGMATCHES(LANG(?dim0Label_fr), "fr"^^xsd:string))\n  }\n  OPTIONAL {\n    ?dim0 (rdfs:label|skos:prefLabel) ?dim0Label_it.\n    FILTER(LANGMATCHES(LANG(?dim0Label_it), "it"^^xsd:string))\n  }\n  OPTIONAL {\n    ?dim0 (rdfs:label|skos:prefLabel) ?dim0Label_.\n    FILTER((LANG(?dim0Label_)) = ""^^xsd:string)\n  }\n  BIND(COALESCE(?dim0Label_en, ?dim0Label_de, ?dim0Label_fr, ?dim0Label_it, ?dim0Label_, ""^^xsd:string) AS ?dim0Label)\n  OPTIONAL {\n    ?dim1 (rdfs:label|skos:prefLabel) ?dim1Label_en.\n    FILTER(LANGMATCHES(LANG(?dim1Label_en), "en"^^xsd:string))\n  }\n  OPTIONAL {\n    ?dim1 (rdfs:label|skos:prefLabel) ?dim1Label_de.\n    FILTER(LANGMATCHES(LANG(?dim1Label_de), "de"^^xsd:string))\n  }\n  OPTIONAL {\n    ?dim1 (rdfs:label|skos:prefLabel) ?dim1Label_fr.\n    FILTER(LANGMATCHES(LANG(?dim1Label_fr), "fr"^^xsd:string))\n  }\n  OPTIONAL {\n    ?dim1 (rdfs:label|skos:prefLabel) ?dim1Label_it.\n    FILTER(LANGMATCHES(LANG(?dim1Label_it), "it"^^xsd:string))\n  }\n  OPTIONAL {\n    ?dim1 (rdfs:label|skos:prefLabel) ?dim1Label_.\n    FILTER((LANG(?dim1Label_)) = ""^^xsd:string)\n  }\n  BIND(COALESCE(?dim1Label_en, ?dim1Label_de, ?dim1Label_fr, ?dim1Label_it, ?dim1Label_, ""^^xsd:string) AS ?dim1Label)\n  OPTIONAL {\n    ?dim2 (rdfs:label|skos:prefLabel) ?dim2Label_en.\n    FILTER(LANGMATCHES(LANG(?dim2Label_en), "en"^^xsd:string))\n  }\n  OPTIONAL {\n    ?dim2 (rdfs:label|skos:prefLabel) ?dim2Label_de.\n    FILTER(LANGMATCHES(LANG(?dim2Label_de), "de"^^xsd:string))\n  }\n  OPTIONAL {\n    ?dim2 (rdfs:label|skos:prefLabel) ?dim2Label_fr.\n    FILTER(LANGMATCHES(LANG(?dim2Label_fr), "fr"^^xsd:string))\n  }\n  OPTIONAL {\n    ?dim2 (rdfs:label|skos:prefLabel) ?dim2Label_it.\n    FILTER(LANGMATCHES(LANG(?dim2Label_it), "it"^^xsd:string))\n  }\n  OPTIONAL {\n    ?dim2 (rdfs:label|skos:prefLabel) ?dim2Label_.\n    FILTER((LANG(?dim2Label_)) = ""^^xsd:string)\n  }\n  BIND(COALESCE(?dim2Label_en, ?dim2Label_de, ?dim2Label_fr, ?dim2Label_it, ?dim2Label_, ""^^xsd:string) AS ?dim2Label)\n}';

/**
 * Endpoint to write configuration to.
 */
export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;

  // Emulate two requests
  const fetchTest = async () => {
    const fetcher = getFetcher();

    console.time("QUERY COMPONENTS");
    const result = await fetcher.select(QUERY_0);
    console.timeEnd("QUERY COMPONENTS");
    console.time("QUERY OBSERVATIONS");
    const result2 = await fetcher.select(QUERY);
    console.timeEnd("QUERY OBSERVATIONS");
    return [result, result2];
  };

  switch (method) {
    case "GET":
      try {
        const result = await Promise.race([mkTimeout(10000), fetchTest()]);

        res.status(200).json(result);
      } catch (e) {
        console.error(e);
        res.status(500).json({ message: e.message ?? "Something went wrong!" });
      }

      break;
    default:
      res.setHeader("Allow", ["GET"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
};
