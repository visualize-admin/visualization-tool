import uniqBy from "lodash/uniqBy";
import { Quad } from "rdf-js";
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
} from "@/domain/data";
import { truthy } from "@/domain/types";
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

// ?s ?p ?o
type ShortQuad = Omit<Quad, "subject" | "predicate" | "object"> & {
  s: Quad["subject"];
  p: Quad["predicate"];
  o: Quad["object"];
};

export const getCubePreview = async (
  iri: string,
  options: {
    locale: string;
    latest: Boolean;
    sparqlClient: ParsingClient;
  }
): Promise<DataCubePreview> => {
  const { sparqlClient, locale } = options;
  const qs: ShortQuad[] = await sparqlClient.query
    .construct(
      `
PREFIX cube: <https://cube.link/>
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

  ?observation ?observationPredicate ?observationValue .
  ?observation ?observationPredicate ?observationLabel .
  ?observationValue schema:position ?observationPosition .
} WHERE {
  VALUES ?cube { <${iri}> }
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
  } UNION {
    ?cube cube:observationConstraint/sh:property/sh:path ?observationPredicate .
    { SELECT * WHERE {
    { SELECT * WHERE {
      ?cube cube:observationSet ?observationSet .
      ?observationSet cube:observation ?observation .
      FILTER(NOT EXISTS { ?cube cube:observationConstraint/sh:property/sh:datatype cube:Undefined . } && NOT EXISTS { ?observation ?p ""^^cube:Undefined . })
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
    )
    .then((qs) => {
      return qs.map(({ subject, predicate, object, ...rest }) => {
        return { ...rest, s: subject, p: predicate, o: object };
      });
    });

  if (qs.length === 0) {
    throw new Error(`No cube found for ${iri}!`);
  }

  const qsDims = qs.filter(({ p }) => p.equals(ns.sh.path));
  const dimensions: Dimension[] = [];
  const measures: Measure[] = [];
  const observations: Observation[] = [];
  const dimValuesByDimIri: Record<string, DimensionValue[]> = qsDims.reduce(
    (acc, dim) => {
      acc[dim.o.value] = [];
      return acc;
    },
    {} as Record<string, DimensionValue[]>
  );
  // Only take quads that use dimension iris as predicates (observations values)
  const qUniqueObservations = uniqBy(
    qs.filter(({ p }) => qsDims.some((q) => q.o.equals(p))),
    ({ s }) => s.value
  );
  qUniqueObservations.forEach(({ s }) => {
    const sqDimValues = qsDims
      .map((quad) => qs.find((q) => q.s.equals(s) && q.p.equals(quad.o)))
      .filter(truthy);
    const observation: Observation = {};
    sqDimValues.forEach((quad) => {
      const qDimIri = quad.p;
      const dimIri = qDimIri.value;
      const qDimValue = quad.o;
      let sIri: ShortQuad | undefined;

      if (!observation[dimIri]) {
        // Retrieve the label of the observation value if it's a named node
        if (quad.o.termType === "NamedNode") {
          sIri = qs.find((q) => q.o.equals(quad.o));
          const qLabel = qs.find(
            (q) =>
              q.s.equals(sIri?.s) &&
              q.p.equals(qDimIri) &&
              q.o.termType === "Literal"
          );
          observation[qDimIri.value] = qLabel?.o.value ?? qDimValue.value;
        } else {
          observation[qDimIri.value] = qDimValue.value;
        }
      }

      const position = qs.find(
        (q) => q.s.equals(sIri?.o) && q.p.equals(ns.schema.position)
      )?.o.value;
      const dimensionValue: DimensionValue = {
        value: qDimValue.value,
        label: `${observation[qDimIri.value]}`,
        position: position !== undefined ? +position : undefined,
      };
      dimValuesByDimIri[dimIri].push(dimensionValue);
    });

    observations.push(observation);
  });

  for (const dimIri in dimValuesByDimIri) {
    dimValuesByDimIri[dimIri] = uniqBy(dimValuesByDimIri[dimIri], "value").sort(
      (a, b) => ((a.position ?? a.label) > (b.position ?? b.label) ? 1 : -1)
    );
  }

  qsDims.map(({ s, o }) => {
    const dimIri = o.value;
    const qsDim = qs.filter((q) => q.s.equals(s));
    const qLabel = qsDim.find((q) => q.p.equals(ns.schema.name));
    const qDesc = qsDim.find((q) => q.p.equals(ns.schema.description));
    const qOrder = qsDim.find((q) => q.p.equals(ns.sh.order));
    const qsType = qsDim.filter((q) => q.p.equals(ns.rdf.type));
    const qScaleType = qsDim.find((q) => q.p.equals(ns.qudt.scaleType));
    const scaleType = getScaleType(qScaleType?.o);
    const qDataType = qsDim.find((q) => q.p.equals(ns.sh.datatype));
    const qUnit = qsDim.find((q) => q.p.equals(ns.qudt.unit));
    const qUnitLabel = qs.find(
      (q) => q.s.equals(qUnit?.o) && q.p.equals(ns.schema.name)
    );
    const qDataKind = qsDim.find((q) => q.p.equals(ns.cube("meta/dataKind")));
    const qDataKindType = qs.find(
      (q) => q.s.equals(qDataKind?.o) && q.p.equals(ns.rdf.type)
    );
    const qTimeUnitType = qs.find(
      (q) => q.s.equals(qDataKind?.o) && q.p.equals(ns.time.unitType)
    );
    const qIsCurrency = qs.find(
      (q) => q.s.equals(qUnit?.o) && q.p.equals(ns.qudt.CurrencyUnit)
    );
    const qCurrencyExponent = qs.find(
      (q) => q.s.equals(qUnit?.o) && q.p.equals(ns.qudt.currencyExponent)
    );
    const isKeyDimension = qsType.some((q) => q.o.equals(ns.cube.KeyDimension));
    const isMeasureDimension = qsType.some((q) =>
      q.o.equals(ns.cube.MeasureDimension)
    );

    const baseComponent: BaseComponent = {
      cubeIri: iri,
      iri: dimIri,
      label: qLabel?.o.value ?? "",
      description: qDesc?.o.value,
      scaleType,
      unit: qUnitLabel?.o.value,
      order: parseNumericalTerm(qOrder?.o),
      isNumerical: false,
      isKeyDimension,
      values: dimValuesByDimIri[dimIri],
    };

    if (isMeasureDimension) {
      const isDecimal = qDataType?.o.equals(ns.xsd.decimal) ?? false;
      const result: Measure = {
        ...baseComponent,
        __typename: resolveMeasureType(scaleType),
        isCurrency: qIsCurrency ? true : false,
        isDecimal,
        currencyExponent: parseNumericalTerm(qCurrencyExponent?.o),
        resolution: parseResolution(qDataType?.o),
        isNumerical: getIsNumerical(qDataType?.o),
      };

      measures.push(result);
    } else {
      const dimensionType = resolveDimensionType(
        getDataKind(qDataKindType?.o),
        scaleType,
        []
      );
      const baseDimension: BaseDimension = baseComponent;

      switch (dimensionType) {
        case "TemporalDimension": {
          const timeUnit = getTimeUnit(qTimeUnitType?.o);
          const timeFormat = getTimeFormat(qDataType?.o);

          if (!timeFormat || !timeUnit) {
            throw new Error(
              `Temporal dimension ${dimIri} has no timeFormat or timeUnit!`
            );
          }

          const dimension: TemporalDimension = {
            ...baseDimension,
            __typename: dimensionType,
            timeFormat,
            timeUnit,
          };
          dimensions.push(dimension);
          break;
        }
        default: {
          const dimension: Exclude<Dimension, TemporalDimension> = {
            ...baseDimension,
            __typename: dimensionType,
          };
          dimensions.push(dimension);
        }
      }
    }
  });

  return { dimensions, measures, observations };
};
