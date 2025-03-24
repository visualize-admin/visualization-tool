import { CubeDimension } from "rdf-cube-view-query";

import { DataCubeMetadata, Observation } from "@/domain/data";
import { RelatedDimension } from "@/graphql/query-hooks";
import { ScaleType, TimeUnit } from "@/graphql/resolver-types";
import { ExtendedCube } from "@/rdf/extended-cube";
import { Limit } from "@/rdf/limits";

export type ResolvedDataCube = {
  cube: ExtendedCube;
  locale: string;
  data: DataCubeMetadata;
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
    related: (Omit<RelatedDimension, "__typename" | "id"> & { iri: string })[];
    timeUnit?: TimeUnit;
    timeFormat?: string;
    scaleType?: ScaleType;
    hasHierarchy?: boolean;
    limits?: Limit[];
  };
};

export type ResolvedObservationsQuery = {
  cube: ExtendedCube;
  locale: string;
  data: {
    query: string;
    observations: Observation[];
  };
};
