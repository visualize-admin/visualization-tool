import { Cube, CubeDimension } from "rdf-cube-view-query";
import { Literal, NamedNode } from "rdf-js";
import { Observation } from "../domain/data";

/** Types shared by graphql-codegen and resolver code */

export type ResolvedDataCube = {
  dataCube: Cube;
  locale: string;

  iri: string;
  identifier: string;
  title: string;
  description: string;
  datePublished?: string;
  status?: string;
  theme?: string;
  versionHistory?: string;
  contactPoint?: string;
  landingPage?: string;
  keywords?: string[];
};

export type ResolvedDimension = {
  dataCube: Cube;
  dimension: CubeDimension;
  locale: string;

  iri: string;
  isLiteral: boolean;
  isNumerical: boolean;
  unit?: string;
  dataType?: string;
  dataKind?: "Time" | "GeoCoordinates" | "GeoShape";
  scaleType?: "Nominal" | "Ordinal" | "Ratio" | "Interval";
  name: string;

  // dimension: RDF.Dimension;
};

export type ResolvedMeasure = ResolvedDimension;

export type ResolvedObservationsQuery = {
  dataCube: Cube;
  query: string;
  observations: Observation[];
  observationsRaw: Record<string, Literal | NamedNode>[];
};
