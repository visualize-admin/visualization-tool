import uniqBy from "lodash/uniqBy";
import ParsingClient from "sparql-http-client/ParsingClient";

import {
  BaseComponent,
  BaseDimension,
  DataCubePreview,
  Dimension,
  Measure,
  TemporalDimension,
} from "@/domain/data";
import { resolveDimensionType, resolveMeasureType } from "@/graphql/resolvers";

import * as ns from "./namespace";
import { getDataKind, getScaleType, timeFormats, timeUnits } from "./parse";
import { buildLocalizedSubQuery } from "./query-utils";

export const getCubePreview = async (
  iri: string,
  options: {
    locale: string;
    latest: Boolean;
    sparqlClient: ParsingClient;
  }
): Promise<DataCubePreview> => {
  const { sparqlClient, locale } = options;
  const quads = await sparqlClient.query.construct(
    `PREFIX cube: <https://cube.link/>
    PREFIX meta: <https://cube.link/meta/>
    PREFIX qudt: <http://qudt.org/schema/qudt/>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX schema: <http://schema.org/>
    PREFIX sh: <http://www.w3.org/ns/shacl#>
    PREFIX time: <http://www.w3.org/2006/time#>
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
    
    CONSTRUCT {
      ?cube schema:version ?cubeVersion .
      ?cube cube:observationSet ?observationSet .
      ?observationSet cube:observation ?observation .
    
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

      ?observation ?dimensionIri ?observationValue .
      ?observation ?dimensionIri ?observationValueLabel .
    } WHERE {
      VALUES ?cube { <${iri}> }
      FILTER(EXISTS { ?cube a cube:Cube . }) {}
      UNION {
        ?cube cube:observationConstraint/sh:property ?dimension .
        ?dimension sh:path ?dimensionIri .
        OPTIONAL { ?dimension sh:datatype ?dimensionDataType . }
        OPTIONAL { ?dimension rdf:type ?dimensionType . }
        OPTIONAL { ?dimension qudt:scaleType ?dimensionScaleType . }
        OPTIONAL {
          ?dimension qudt:unit ?_dimensionUnit .
          OPTIONAL { ?_dimensionUnit rdfs:label ?_dimensionUnitRdfsLabel . }
          OPTIONAL { ?_dimensionUnit qudt:symbol ?_dimensionUnitSymbol . }
          OPTIONAL { ?_dimensionUnit qudt:ucumCode ?_dimensionUnitUcumCode . }
          OPTIONAL { ?_dimensionUnit qudt:expression ?_dimensionUnitExpression . }
          OPTIONAL { ?_dimensionUnit ?_isCurrencyUnit qudt:CurrencyUnit . }
          OPTIONAL { ?_dimensionUnit qudt:currencyExponent ?_dimensionUnitCurrencyExponent . }
          BIND(STR(COALESCE(STR(?_dimensionUnitSymbol), STR(?_dimensionUnitUcumCode), STR(?_dimensionUnitExpression), STR(?_dimensionUnitRdfsLabel), "?")) AS ?_dimensionUnitLabel)
          FILTER (LANG(?_dimensionUnitRdfsLabel) = "en")
        }
        OPTIONAL {
          ?dimension qudt:hasUnit ?_dimensionHasUnit .
          OPTIONAL { ?_dimensionHasUnit rdfs:label ?_dimensionHasUnitRdfsLabel . }
          OPTIONAL { ?_dimensionHasUnit qudt:symbol ?_dimensionHasUnitSymbol . }
          OPTIONAL { ?_dimensionHasUnit qudt:ucumCode ?_dimensionHasUnitUcumCode . }
          OPTIONAL { ?_dimensionHasUnit qudt:expression ?_dimensionHasUnitExpression . }
          OPTIONAL { ?_dimensionHasUnit ?_isCurrencyHasUnit qudt:CurrencyUnit . }
          OPTIONAL { ?_dimensionHasUnit qudt:currencyExponent ?_dimensionHasUnitCurrencyExponent . }
          BIND(STR(COALESCE(STR(?_dimensionHasUnitSymbol), STR(?_dimensionHasUnitUcumCode), STR(?_dimensionHasUnitExpression), STR(?_dimensionHasUnitRdfsLabel), "?")) AS ?_dimensionHasUnitLabel)
          FILTER (LANG(?_dimensionHasUnitRdfsLabel) = "en")
        }
        BIND(COALESCE(?_dimensionUnit, ?_dimensionHasUnit) as ?dimensionUnit)
        BIND(COALESCE(?_dimensionUnitLabel, ?_dimensionHasUnitLabel) as ?dimensionUnitLabel)
        BIND(COALESCE(?_dimensionUnitIsCurrency, ?_dimensionHasUnitIsCurrency) as ?dimensionUnitIsCurrency)
        BIND(COALESCE(?_dimensionUnitCurrencyExponent, ?_dimensionHasUnitCurrencyExponent) as ?dimensionUnitCurrencyExponent)
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
      } UNION {
        ?cube cube:observationConstraint/sh:property/sh:path ?dimensionIri .
    
        { SELECT * WHERE {
          ?cube cube:observationSet ?observationSet .
          ?observationSet cube:observation ?observation .
          FILTER(NOT EXISTS { ?cube cube:observationConstraint/sh:property/sh:datatype cube:Undefined . } && NOT EXISTS { ?observation ?p ""^^cube:Undefined . })
        } LIMIT 10 }
    
        { SELECT * WHERE {
        { SELECT * WHERE {
          ?cube cube:observationSet/cube:observation ?observation .
          FILTER(NOT EXISTS { ?cube cube:observationConstraint/sh:property/sh:datatype cube:Undefined . } && NOT EXISTS { ?observation ?p ""^^cube:Undefined . })
        } LIMIT 10 }
    
          ?observation ?dimensionIri ?observationValue .
          ${buildLocalizedSubQuery(
            "observationValue",
            "schema:name",
            "observationValueLabel",
            { locale }
          )}
        }}
      }
    }`,
    { operation: "postUrlencoded" }
  );

  if (quads.length === 0) {
    throw new Error(`No cube found for ${iri}!`);
  }

  const dimensionsQuads = quads.filter(
    (quad) =>
      quad.predicate.equals(ns.sh.path) &&
      !quad.object.equals(ns.cube.observedBy) &&
      !quad.object.equals(ns.rdf.type)
  );
  const dimensions: Dimension[] = [];
  const measures: Measure[] = [];
  uniqBy(dimensionsQuads, (quad) => quad.object.value).map((quad) => {
    const dimensionQuads = quads.filter((q) => q.subject.equals(quad.subject));
    const dimensionIri = quad.object.value;
    const labelQuad = dimensionQuads.find((q) =>
      q.predicate.equals(ns.schema.name)
    );
    const descriptionQuad = dimensionQuads.find((q) =>
      q.predicate.equals(ns.schema.description)
    );
    const orderQuad = dimensionQuads.find((q) =>
      q.predicate.equals(ns.sh.order)
    );
    const typeQuads = dimensionQuads.filter((q) =>
      q.predicate.equals(ns.rdf.type)
    );
    const scaleTypeQuad = dimensionQuads.find((q) =>
      q.predicate.equals(ns.qudt.scaleType)
    );
    const scaleType = getScaleType(scaleTypeQuad?.object);
    const dataTypeQuad = dimensionQuads.find((q) =>
      q.predicate.equals(ns.sh.datatype)
    );
    const unitQuad = dimensionQuads.find((q) =>
      q.predicate.equals(ns.qudt.unit)
    );
    const unitLabelQuad = quads.find((q) => q.subject.equals(unitQuad?.object));
    const dataKindQuad = dimensionQuads.find((q) =>
      q.predicate.equals(ns.cube("meta/dataKind"))
    );
    const dataKindTypeQuad = quads.find(
      (q) =>
        q.subject.equals(dataKindQuad?.object) &&
        q.predicate.equals(ns.rdf.type)
    );
    const timeUnitTypeQuad = quads.find(
      (q) =>
        q.subject.equals(dataKindQuad?.object) &&
        q.predicate.equals(ns.time.unitType)
    );
    const isCurrencyQuad = dimensionQuads.find((q) =>
      q.predicate.equals(ns.qudt.CurrencyUnit)
    );
    const currencyExponentQuad = dimensionQuads.find((q) =>
      q.predicate.equals(ns.qudt.currencyExponent)
    );
    const isKeyDimension = typeQuads.some((q) =>
      q.object.equals(ns.cube.KeyDimension)
    );
    const isMeasureDimension = typeQuads.some((q) =>
      q.object.equals(ns.cube.MeasureDimension)
    );

    const baseComponent: BaseComponent = {
      cubeIri: iri,
      iri: dimensionIri,
      label: labelQuad?.object.value ?? "",
      description: descriptionQuad?.object.value,
      scaleType,
      unit: unitLabelQuad?.object.value,
      order:
        orderQuad?.object.termType === "Literal"
          ? parseInt(orderQuad.object.value)
          : undefined,
      isNumerical: false,
      isKeyDimension,
      values: [],
    };

    if (isMeasureDimension) {
      const isDecimal = dataTypeQuad?.object.equals(ns.xsd.decimal) ?? false;
      const result: Measure = {
        ...baseComponent,
        __typename: resolveMeasureType(scaleType),
        isCurrency: isCurrencyQuad ? true : false,
        isDecimal,
        currencyExponent: currencyExponentQuad
          ? parseInt(currencyExponentQuad.object.value)
          : undefined,
        resolution:
          dataTypeQuad?.object.equals(ns.xsd.int) ||
          dataTypeQuad?.object.equals(ns.xsd.integer)
            ? 0
            : undefined,
        isNumerical:
          dataTypeQuad?.object.equals(ns.xsd.int) ||
          dataTypeQuad?.object.equals(ns.xsd.integer) ||
          isDecimal ||
          dataTypeQuad?.object.equals(ns.xsd.float) ||
          dataTypeQuad?.object.equals(ns.xsd.double) ||
          false,
      };

      measures.push(result);
    } else {
      const dimensionType = resolveDimensionType(
        getDataKind(dataKindTypeQuad?.object),
        scaleType,
        []
      );
      const baseDimension: BaseDimension = baseComponent;

      switch (dimensionType) {
        case "TemporalDimension": {
          const timeUnit = timeUnits.get(timeUnitTypeQuad?.object.value ?? "");
          const timeFormat = timeFormats.get(dataTypeQuad?.object.value ?? "");

          if (!timeFormat || !timeUnit) {
            throw new Error(
              `Temporal dimension ${dimensionIri} is missing timeFormat or timeUnit!`
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

  const observationQuads = quads.filter((quad) =>
    quad.predicate.equals(ns.cube.observation)
  );
  const observations = uniqBy(
    observationQuads,
    (quad) => quad.object.value
  ).map((quad) => {
    const dimensionValueQuads = dimensionsQuads.map((dimensionQuad) => {
      return quads.find(
        (q) =>
          q.subject.equals(quad.object) &&
          q.predicate.equals(dimensionQuad.object)
      );
    });

    return dimensionValueQuads.reduce((acc, quad) => {
      if (!quad) return acc;

      if (!acc[quad.predicate.value]) {
        const rootObservationId = quads.filter((q) =>
          q.object.equals(quad.object)
        );

        acc[quad.predicate.value] =
          quads.find(
            (q) =>
              q.subject.equals(rootObservationId[0].subject) &&
              q.predicate.equals(quad.predicate) &&
              q.object.termType === "Literal"
          )?.object.value ?? quad.object.value;
      }

      return acc;
    }, {} as Record<string, string>);
  });

  return { dimensions, measures, observations };
};
