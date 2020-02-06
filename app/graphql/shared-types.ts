import * as RDF from "@zazuko/query-rdf-data-cube";

/** Types shared by graphql-codegen and resolver code */

export type ResolvedDataCube = RDF.DataCube;

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
  selectedFields: [string, RDF.Dimension][]
};
