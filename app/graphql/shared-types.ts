import * as RDF from "@zazuko/query-rdf-data-cube";
import { Cube } from "rdf-cube-view-query";

/** Types shared by graphql-codegen and resolver code */

export type ResolvedDataCube = {
  dataCube: Cube;

  iri: string;
  identifier?: string;
  title?: string;
  description?: string;
  datePublished?: string;
  status?: string;
  theme?: string;
  versionHistory?: string;
  contactPoint?: string;
  landingPage?: string;
  keywords?: string[];
};

export type ResolvedDimension = {
  dataCube: RDF.DataCube;
  dimension: RDF.Dimension;
};

export type ResolvedMeasure = {
  dataCube: RDF.DataCube;
  measure: RDF.Measure;
};

export type ResolvedObservationsQuery = {
  dataCube: RDF.DataCube;
  query: RDF.Query;
  selectedFields: [string, RDF.Dimension | RDF.Measure | RDF.Attribute][];
};
