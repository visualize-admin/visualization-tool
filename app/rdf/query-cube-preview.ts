import groupBy from "lodash/groupBy";
import uniqBy from "lodash/uniqBy";
import rdf from "rdf-ext";
import { NamedNode, Quad } from "rdf-js";
import ParsingClient from "sparql-http-client/ParsingClient";

import {
  BaseComponent,
  BaseDimension,
  DataCubePreview,
  Dimension,
  DimensionValue,
  Measure,
  Observation,
  TemporalDimension,
  TemporalEntityDimension,
} from "@/domain/data";
import { truthy } from "@/domain/types";
import { stringifyComponentId } from "@/graphql/make-component-id";
import { resolveDimensionType, resolveMeasureType } from "@/graphql/resolvers";

import * as ns from "./namespace";
import {
  getDataKind,
  getIsNumerical,
  getScaleType,
  getTimeFormat,
  getTimeUnit,
  parseNumericalTerm,
  parseResolution,
} from "./parse";
import { buildLocalizedSubQuery } from "./query-utils";

export const getCubePreview = async (
  iri: string,
  options: {
    unversionedIri: string;
    locale: string;
    sparqlClient: ParsingClient;
  }
): Promise<DataCubePreview> => {
  const { unversionedIri, sparqlClient, locale } = options;
  const qs = await sparqlClient.query.construct(
    `PREFIX cube: <https://cube.link/>
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

  ?observation ?observationPredicate ?observationValue .
  ?observation ?observationPredicate ?observationLabel .
  ?observationValue schema:position ?observationPosition .
} WHERE {
  VALUES ?cube { <${iri}> }
  FILTER(EXISTS { ?cube a cube:Cube . })
  {
    ?cube cube:observationConstraint/sh:property ?dimension .
    ?dimension sh:path ?dimensionIri .
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
      FILTER (LANG(?dimensionUnitRdfsLabel) = "${locale}" || LANG(?dimensionUnitRdfsLabel) = "en" || datatype(?dimensionUnitRdfsLabel) = xsd:string)
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
  } UNION {
    VALUES ?cube { <${iri}> }
    ?cube cube:observationConstraint/sh:property/sh:path ?observationPredicate .
    { SELECT ?observation ?observationPredicate ?observationValue ?observationLabel ?observationPosition WHERE {
    { 
#pragma evaluate on  ## improve preview speed (wrt Stardog issue 2094 on Stardog >= 10 // see also SBAR-1122)
      SELECT ?observation WHERE {
      VALUES ?cube { <${iri}> }
      ?cube cube:observationSet ?observationSet .
      ?observationSet cube:observation ?observation .
      FILTER(EXISTS { ?cube cube:observationConstraint/sh:property/sh:datatype cube:Undefined . } || NOT EXISTS { ?observation ?p ""^^cube:Undefined . })
    } LIMIT 10 }
      ?observation ?observationPredicate ?observationValue .
      ${buildLocalizedSubQuery(
        "observationValue",
        "schema:name",
        "observationLabel",
        { locale }
      )}
      OPTIONAL { ?observationValue schema:position ?observationPosition . }
      FILTER(?observationPredicate != cube:observedBy && ?observationPredicate != rdf:type)
    }}
  }
}`,
    { operation: "postUrlencoded" }
  );

  if (qs.length === 0) {
    throw Error(`No cube found for ${iri}!`);
  }

  const sQs = groupBy(qs, (q) => q.subject.value);
  const spQs = Object.fromEntries(
    Object.entries(sQs).map(([k, v]) => {
      const pQs = groupBy(v, (q) => q.predicate.value);
      return [k, pQs];
    })
  );

  const dimensions: Dimension[] = [];
  const measures: Measure[] = [];
  const observations: Observation[] = [];
  const qsDims = qs.filter(({ predicate: p }) => p.equals(ns.sh.path));
  const dimMetadataByDimIri = qsDims.reduce(
    (acc, dim) => {
      acc[dim.object.value] = {
        values: [],
        dataType: rdf.namedNode(""),
      };
      return acc;
    },
    {} as Record<string, { values: DimensionValue[]; dataType: NamedNode }>
  );
  // Only take quads that use dimension iris as predicates (observation values)
  const qUniqueObservations = uniqBy(
    qs.filter(
      ({ subject: s, predicate: p }) =>
        // Exclude situations where the subject is a blank node (e.g. dimension IRI
        // is not unique, but something like ns.schema.name)
        s.termType !== "BlankNode" && qsDims.some((q) => q.object.equals(p))
    ),
    ({ subject: s }) => s.value
  );
  qUniqueObservations.forEach(({ subject: s }) => {
    const sqDimValues = uniqBy(
      qsDims
        .map((quad) => spQs[s.value]?.[quad.object.value])
        .flat()
        .filter(truthy),
      (d) => d.predicate.value
    );
    const observation: Observation = {};
    sqDimValues.forEach((quad) => {
      const qDimIri = quad.predicate;
      const dimIri = qDimIri.value;
      const qDimValue = quad.object;
      let qPosition: Quad | undefined;

      if (!observation[dimIri]) {
        // Retrieve the label of the observation value if it's a named node
        if (qDimValue.termType === "NamedNode") {
          const sIri = qs.find((q) => q.object.equals(quad.object));
          const qLabel = qs.find(
            ({ subject: s, predicate: p, object: o }) =>
              s.equals(sIri?.subject) &&
              p.equals(qDimIri) &&
              o.termType === "Literal"
          );

          if (qLabel?.object.termType === "Literal") {
            dimMetadataByDimIri[dimIri].dataType = qLabel.object.datatype;
          }

          if (sIri?.object.value) {
            qPosition =
              spQs[sIri.object.value]?.[ns.schema.position.value]?.[0];
          }

          observation[qDimIri.value] = qLabel?.object.value ?? qDimValue.value;
        } else {
          if (qDimValue.termType === "Literal") {
            dimMetadataByDimIri[dimIri].dataType = qDimValue.datatype;
          }

          observation[qDimIri.value] = qDimValue.value;
        }
      }

      const dimensionValue: DimensionValue = {
        value: qDimValue.value,
        label: `${observation[qDimIri.value]}`,
        position: qPosition ? +qPosition.object.value : undefined,
      };
      dimMetadataByDimIri[dimIri].values.push(dimensionValue);
    });

    observations.push(
      Object.fromEntries(
        Object.entries(observation).map(([k, v]) => {
          return [
            stringifyComponentId({
              unversionedCubeIri: unversionedIri,
              unversionedComponentIri: k,
            }),
            v,
          ];
        })
      )
    );
  });

  for (const dimIri in dimMetadataByDimIri) {
    dimMetadataByDimIri[dimIri].values = uniqBy(
      dimMetadataByDimIri[dimIri].values,
      (d) => d.value
    ).sort((a, b) =>
      (a.position ?? a.label) > (b.position ?? b.label) ? 1 : -1
    );
  }

  qsDims.map(({ subject: s, object: o }) => {
    const dimIri = o.value;
    const qsDim = sQs[s.value];
    const pQsDim = groupBy(qsDim, (q) => q.predicate.value);
    const qLabel = pQsDim[ns.schema.name.value]?.[0];
    const qDesc = pQsDim[ns.schema.description.value]?.[0];
    const qOrder = pQsDim[ns.sh.order.value]?.[0];
    const qsType = pQsDim[ns.rdf.type.value];
    const qScaleType = pQsDim[ns.qudt.scaleType.value]?.[0];
    const scaleType = getScaleType(qScaleType?.object);
    const dataType = dimMetadataByDimIri[dimIri].dataType;
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
      cubeIri: iri,
      id: stringifyComponentId({
        unversionedCubeIri: unversionedIri,
        unversionedComponentIri: dimIri,
      }),
      label: qLabel?.object.value ?? "",
      description: qDesc?.object.value,
      scaleType,
      unit: qUnitLabel?.object.value,
      order: parseNumericalTerm(qOrder?.object),
      isNumerical: false,
      isKeyDimension,
      values: dimMetadataByDimIri[dimIri].values,
      relatedLimitValues: [],
    };

    if (isMeasureDimension) {
      const isDecimal = dataType.equals(ns.xsd.decimal) ?? false;
      const result: Measure = {
        ...baseComponent,
        __typename: resolveMeasureType(scaleType),
        isCurrency: qIsCurrency ? true : false,
        isDecimal,
        currencyExponent: parseNumericalTerm(qCurrencyExponent?.object),
        resolution: parseResolution(dataType),
        isNumerical: getIsNumerical(dataType),
        limits: [],
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
          const timeFormat = getTimeFormat(dataType, timeUnit);

          if (!timeFormat || !timeUnit) {
            throw Error(
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
    observations,
  };
};
