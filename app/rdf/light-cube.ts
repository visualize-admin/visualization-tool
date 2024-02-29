import groupBy from "lodash/groupBy";
import ParsingClient from "sparql-http-client/ParsingClient";

import {
  BaseComponent,
  BaseDimension,
  DataCubeMetadata,
  Dimension,
  Measure,
  TemporalDimension,
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
import { getCubeMetadata } from "@/rdf/query-cube-metadata";
import { buildLocalizedSubQuery } from "@/rdf/query-utils";

type LightCubeOptions = {
  iri: string;
  locale: string;
  sparqlClient: ParsingClient;
};

/** `LightCube` is a specialized data fetching class containing methods
 * for fetching _just enough_ data related to different aspects of a cube.
 */
export class LightCube {
  public iri: string;
  private locale: string;
  public metadata: DataCubeMetadata | undefined;
  public dimensions: Dimension[] = [];
  public measures: Measure[] = [];
  private sparqlClient: ParsingClient;

  constructor(options: LightCubeOptions) {
    const { iri, locale, sparqlClient } = options;
    this.iri = iri;
    this.locale = locale;
    this.sparqlClient = sparqlClient;
  }

  /** Use to potentially promote the cube to newest version. */
  public async init(latest: boolean) {
    if (!latest) {
      return this;
    }

    const query = `PREFIX schema: <http://schema.org/>

SELECT ?iri WHERE {
  ?versionHistory schema:hasPart  <${this.iri}> .
  ?versionHistory schema:hasPart ?iri .
  ?iri schema:version ?version .
}
ORDER BY DESC(?version)
LIMIT 1`;

    const result = await this.sparqlClient.query.select(query);
    const latestIri = result[0]?.iri?.value;

    if (latestIri && latestIri !== this.iri) {
      return new LightCube({
        iri: latestIri,
        locale: this.locale,
        sparqlClient: this.sparqlClient,
      });
    }

    return this;
  }

  public async fetchMetadata() {
    this.metadata = await getCubeMetadata(this.iri, {
      locale: this.locale,
      sparqlClient: this.sparqlClient,
    });

    return this.metadata;
  }

  public async fetchComponents() {
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
  VALUES ?cube { <${this.iri}> }
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
      locale: this.locale,
    })}
    ${buildLocalizedSubQuery(
      "dimension",
      "schema:description",
      "dimensionDescription",
      { locale: this.locale }
    )}
    FILTER(?dimensionIri != cube:observedBy && ?dimensionIri != rdf:type)
  }
}`;

    const qs = await this.sparqlClient.query.construct(query);
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
        cubeIri: this.iri,
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
        const dimensionType = resolveDimensionType(
          getDataKind(qDataKindType?.object),
          scaleType,
          []
        );
        const baseDimension: BaseDimension = baseComponent;

        switch (dimensionType) {
          case "TemporalDimension": {
            const timeUnit = getTimeUnit(qTimeUnitType?.object);
            const timeFormat = getTimeFormat(qDataType?.object);

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

    return { dimensions, measures };
  }
}
