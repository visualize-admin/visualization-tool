import { Cube, CubeDimension } from "rdf-cube-view-query";
import { Literal, NamedNode } from "rdf-js";
import { Observation } from "../domain/data";
import { DataCubePublicationStatus } from "./resolver-types";

/** Types shared by graphql-codegen and resolver code */

export type ResolvedDataCube = {
  cube: Cube;
  locale: string;
  data: {
    iri: string;
    identifier: string;
    title: string;
    description: string;
    datePublished?: string;
    publicationStatus: DataCubePublicationStatus;
    theme?: string;
    versionHistory?: string;
    contactPoint?: string;
    landingPage?: string;
    keywords?: string[];
  };
};

export type ResolvedDimension = {
  cube: Cube;
  dimension: CubeDimension;
  locale: string;
  data: {
    iri: string;
    isLiteral: boolean;
    isNumerical: boolean;
    hasUndefinedValues: boolean;
    unit?: string;
    dataType?: string;
    dataKind?: "Time" | "GeoCoordinates" | "GeoShape";
    scaleType?: "Nominal" | "Ordinal" | "Ratio" | "Interval";
    name: string;
  };

  // dimension: RDF.Dimension;
};

export type ResolvedMeasure = ResolvedDimension;

export type ResolvedObservationsQuery = {
  cube: Cube;
  locale: string;

  data: {
    query: string;
    observations: Observation[];
    observationsRaw: Record<string, Literal | NamedNode>[];
  };
};
