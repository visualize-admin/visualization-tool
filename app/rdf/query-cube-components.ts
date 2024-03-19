import groupBy from "lodash/groupBy";
import ParsingClient from "sparql-http-client/ParsingClient";

import {
  BaseComponent,
  BaseDimension,
  DataCubeComponents,
  Dimension,
  Measure,
  TemporalDimension,
  TemporalEntityDimension,
} from "@/domain/data";
import { resolveDimensionType, resolveMeasureType } from "@/graphql/resolvers";
import * as ns from "@/rdf/namespace";
import {
  getDataKind,
  getIsNumerical,
  getScaleType,
  getTimeFormat,
  getTimeUnit,
  parseNumericalTerm,
  parseResolution,
} from "@/rdf/parse";
import { buildLocalizedSubQuery } from "@/rdf/query-utils";

export const getCubeComponentsMetadata = async (
  cubeIri: string,
  options: {
    locale: string;
    sparqlClient: ParsingClient;
  }
): Promise<DataCubeComponents> => {
  const { locale, sparqlClient } = options;
  const query = `PREFIX cube: <https://cube.link/>
PREFIX meta: <https://cube.link/meta/>
PREFIX qudt: <http://qudt.org/schema/qudt/>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX schema: <http://schema.org/>
PREFIX sh: <http://www.w3.org/ns/shacl#>
PREFIX time: <http://www.w3.org/2006/time#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

CONSTRUCT {
  ?dimension sh:path ?dimensionIri .
  ?dimension sh:datatype ?dimensionDataType .
  ?dimension rdf:type ?dimensionType .
  ?dimension qudt:scaleType ?dimensionScaleType .
  ?dimension qudt:unit ?dimensionUnit .
  ?dimensionUnit schema:name ?dimensionUnitLabel .
  ?dimensionUnit qudt:CurrencyUnit ?dimensionUnitIsCurrency .
  ?dimensionUnit qudt:currencyExponent ?dimensionUnitCurrencyExponent .
  ?dimension sh:order ?dimensionOrder .
  ?dimension meta:dataKind ?dimensionDataKind .
  ?dimensionDataKind rdf:type ?dimensionDataKindType .
  ?dimensionDataKind time:unitType ?dimensionTimeUnitType .
  ?dimension schema:name ?dimensionLabel .
  ?dimension schema:description ?dimensionDescription .
} WHERE {
  VALUES ?cube { <${cubeIri}> }
  FILTER(EXISTS { ?cube a cube:Cube . }) {}
  UNION {
    ?cube cube:observationConstraint/sh:property ?dimension .
    ?dimension sh:path ?dimensionIri .
    OPTIONAL { ?dimension sh:datatype ?dimensionDataType . }
    OPTIONAL { ?dimension sh:or/rdf:rest*/rdf:first/sh:datatype ?dimensionDataType . }
    OPTIONAL { ?dimension rdf:type ?dimensionType . }
    OPTIONAL { ?dimension qudt:scaleType ?dimensionScaleType . }
    OPTIONAL {
      { ?dimension qudt:unit ?dimensionUnit . }
      UNION { ?dimension qudt:hasUnit ?dimensionUnit . }
      OPTIONAL { ?dimensionUnit rdfs:label ?dimensionUnitRdfsLabel . }
      OPTIONAL { ?dimensionUnit qudt:symbol ?dimensionUnitSymbol . }
      OPTIONAL { ?dimensionUnit qudt:ucumCode ?dimensionUnitUcumCode . }
      OPTIONAL { ?dimensionUnit qudt:expression ?dimensionUnitExpression . }
      OPTIONAL { ?dimensionUnit ?dimensionUnitIsCurrency qudt:CurrencyUnit . }
      OPTIONAL { ?dimensionUnit qudt:currencyExponent ?dimensionUnitCurrencyExponent . }
      BIND(STR(COALESCE(STR(?dimensionUnitSymbol), STR(?dimensionUnitUcumCode), STR(?dimensionUnitExpression), STR(?dimensionUnitRdfsLabel))) AS ?dimensionUnitLabel)
      FILTER (LANG(?dimensionUnitRdfsLabel) = "en")
    }
    OPTIONAL { ?dimension sh:order ?dimensionOrder . }
    OPTIONAL {
      ?dimension meta:dataKind ?dimensionDataKind .
      ?dimensionDataKind rdf:type ?dimensionDataKindType .
    }
    OPTIONAL {
      ?dimension meta:dataKind ?dimensionDataKind .
      ?dimensionDataKind time:unitType ?dimensionTimeUnitType .
    }
    ${buildLocalizedSubQuery("dimension", "schema:name", "dimensionLabel", {
      locale,
    })}
    ${buildLocalizedSubQuery(
      "dimension",
      "schema:description",
      "dimensionDescription",
      { locale }
    )}
    FILTER(?dimensionIri != cube:observedBy && ?dimensionIri != rdf:type)
  }
}`;

  const qs = await sparqlClient.query.construct(query);
  const sQs = groupBy(qs, (q) => q.subject.value);
  const spQs = Object.fromEntries(
    Object.entries(sQs).map(([k, v]) => {
      const pQs = groupBy(v, (q) => q.predicate.value);
      return [k, pQs];
    })
  );

  const dimensions: Dimension[] = [];
  const measures: Measure[] = [];
  const qsDims = qs.filter(({ predicate: p }) => p.equals(ns.sh.path));
  qsDims.map(({ subject, object }) => {
    const dimIri = object.value;
    const qsDim = sQs[subject.value];
    const pQsDim = groupBy(qsDim, (q) => q.predicate.value);
    const qLabel = pQsDim[ns.schema.name.value]?.[0];
    const qDesc = pQsDim[ns.schema.description.value]?.[0];
    const qOrder = pQsDim[ns.sh.order.value]?.[0];
    const qsType = pQsDim[ns.rdf.type.value];
    const qScaleType = pQsDim[ns.qudt.scaleType.value]?.[0];
    const scaleType = getScaleType(qScaleType?.object);
    const qDataType = qsDim.find((q) => q.predicate.equals(ns.sh.datatype));
    const qUnit = pQsDim[ns.qudt.unit.value]?.[0];
    const qUnitLabel = spQs[qUnit?.object.value]?.[ns.schema.name.value]?.[0];
    const qDataKind = pQsDim[ns.cube("meta/dataKind").value]?.[0];
    const qDataKindType =
      spQs[qDataKind?.object.value]?.[ns.rdf.type.value]?.[0];
    const qTimeUnitType =
      spQs[qDataKind?.object.value]?.[ns.time.unitType.value]?.[0];
    const qIsCurrency =
      spQs[qUnit?.object.value]?.[ns.qudt.CurrencyUnit.value]?.[0];
    const qCurrencyExponent =
      spQs[qUnit?.object.value]?.[ns.qudt.currencyExponent.value]?.[0];
    const isKeyDimension = qsType?.some((q) =>
      q.object.equals(ns.cube.KeyDimension)
    );
    const isMeasureDimension = qsType?.some((q) =>
      q.object.equals(ns.cube.MeasureDimension)
    );

    const baseComponent: BaseComponent = {
      cubeIri,
      iri: dimIri,
      label: qLabel?.object.value ?? "",
      description: qDesc?.object.value,
      scaleType,
      unit: qUnitLabel?.object.value,
      order: parseNumericalTerm(qOrder?.object),
      isNumerical: false,
      isKeyDimension,
      // FIX TYPE!
      values: [],
    };

    if (isMeasureDimension) {
      const isDecimal = qDataType?.equals(ns.xsd.decimal) ?? false;
      const result: Measure = {
        ...baseComponent,
        __typename: resolveMeasureType(scaleType),
        isCurrency: qIsCurrency ? true : false,
        isDecimal,
        currencyExponent: parseNumericalTerm(qCurrencyExponent?.object),
        resolution: parseResolution(qDataType?.object),
        isNumerical: getIsNumerical(qDataType?.object),
      };

      measures.push(result);
    } else {
      const timeUnit = getTimeUnit(qTimeUnitType?.object);
      const dimensionType = resolveDimensionType(
        getDataKind(qDataKindType?.object),
        scaleType,
        timeUnit,
        []
      );
      const baseDimension: BaseDimension = baseComponent;

      switch (dimensionType) {
        case "TemporalDimension":
        case "TemporalEntityDimension": {
          const timeFormat = getTimeFormat(qDataType?.object, timeUnit);

          if (!timeFormat || !timeUnit) {
            throw new Error(
              `Temporal dimension ${dimIri} has no timeFormat or timeUnit!`
            );
          }

          const dimension: TemporalDimension | TemporalEntityDimension = {
            ...baseDimension,
            __typename: dimensionType,
            timeFormat,
            timeUnit,
          };
          dimensions.push(dimension);
          break;
        }
        default: {
          const dimension: Exclude<
            Dimension,
            TemporalDimension | TemporalEntityDimension
          > = {
            ...baseDimension,
            __typename: dimensionType,
          };
          dimensions.push(dimension);
        }
      }
    }
  });

  return {
    dimensions,
    measures,
  };
};
