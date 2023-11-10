import { CubeDimension } from "rdf-cube-view-query";
import { Literal, NamedNode } from "rdf-js";

import { ExtendedCube } from "@/rdf/extended-cube";

import { Observation } from "../domain/data";

import { RelatedDimension } from "./query-hooks";
import {
  DataCubeOrganization,
  DataCubePublicationStatus,
  DataCubeTheme,
  ScaleType,
  TimeUnit,
} from "./resolver-types";

/** Types shared by graphql-codegen and resolver code */

export type ResolvedDataCube = {
  cube: ExtendedCube;
  locale: string;
  data: {
    iri: string;
    identifier: string;
    title: string;
    description: string;
    version?: string;
    datePublished?: string;
    dateModified?: string;
    publicationStatus: DataCubePublicationStatus;
    themes?: DataCubeTheme[];
    creator?: DataCubeOrganization;
    versionHistory?: string;
    contactPoint?: {
      name?: string;
      email?: string;
    };
    publisher?: string;
    landingPage?: string;
    expires?: string;
    keywords?: string[];
    workExamples?: string[];
  };
};

export type ResolvedDimension = {
  cube: ExtendedCube;
  dimension: CubeDimension;
  locale: string;
  data: {
    iri: string;
    isLiteral: boolean;
    isNumerical: boolean;
    isKeyDimension: boolean;
    isMeasureDimension: boolean;
    isCurrency: boolean;
    isDecimal: boolean;
    currencyExponent?: number;
    hasUndefinedValues: boolean;
    unit?: string;
    resolution?: number;
    dataType?: string;
    order?: number;
    name: string;
    description?: string;
    dataKind?: "Time" | "GeoCoordinates" | "GeoShape";
    related: Omit<RelatedDimension, "__typename">[];
    timeUnit?: TimeUnit;
    timeFormat?: string;
    scaleType?: ScaleType;
    hasHierarchy?: boolean;
  };
};

export type ResolvedMeasure = ResolvedDimension;

export type ResolvedObservationsQuery = {
  cube: ExtendedCube;
  locale: string;

  data: {
    query: string;
    observations: Observation[];
    observationsRaw: Record<string, Literal | NamedNode>[];
  };
};
