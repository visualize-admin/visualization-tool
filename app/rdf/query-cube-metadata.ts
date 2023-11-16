import RDF from "@rdfjs/data-model";
import { SELECT } from "@tpluscode/sparql-builder";
import keyBy from "lodash/keyBy";
import { Literal, NamedNode } from "rdf-js";
import { ParsingClient } from "sparql-http-client/ParsingClient";

import { DataCubeMetadata } from "@/domain/data";
import * as ns from "@/rdf/namespace";

import { cube, schema } from "../../app/rdf/namespace";
import {
  DataCubeOrganization,
  DataCubePublicationStatus,
  DataCubeTheme,
} from "../graphql/query-hooks";

import { pragmas } from "./create-source";
import { makeLocalesFilter } from "./query-labels";
import {
  GROUP_SEPARATOR,
  buildLocalizedSubQuery,
  makeVisualizeDatasetFilter,
} from "./query-utils";

type RawDataCubeMetadata = {
  iri: NamedNode;
  identifier: NamedNode;
  title: Literal;
  description: Literal;
  version: Literal;
  datePublished: Literal;
  dateModified: Literal;
  status: NamedNode;
  themeIris: NamedNode;
  themeLabels: Literal;
  creatorIri: NamedNode;
  creatorLabel: Literal;
  versionHistory: NamedNode;
  contactPointEmail: Literal;
  contactPointName: Literal;
  publisher: NamedNode;
  landingPage: NamedNode;
  expires: Literal;
  workExamples: NamedNode;
};

const parseRawMetadata = (cube: RawDataCubeMetadata): DataCubeMetadata => {
  const themeIris = cube.themeIris.value.split(GROUP_SEPARATOR);
  const themeLabels = cube.themeLabels.value.split(GROUP_SEPARATOR);

  return {
    iri: cube.iri.value,
    identifier: cube.identifier?.value,
    title: cube.title.value,
    description: cube.description?.value,
    version: cube.version?.value,
    datePublished: cube.datePublished?.value,
    dateModified: cube.dateModified?.value,
    publicationStatus:
      cube.status.value ===
      ns.adminVocabulary("CreativeWorkStatus/Published").value
        ? DataCubePublicationStatus.Published
        : DataCubePublicationStatus.Draft,
    themes:
      themeIris.length === themeLabels.length
        ? themeIris.map((iri, i) => ({
            iri,
            label: themeLabels[i],
          }))
        : [],
    creator:
      cube.creatorIri && cube.creatorLabel
        ? { iri: cube.creatorIri.value, label: cube.creatorLabel.value }
        : undefined,
    versionHistory: cube.versionHistory?.value,
    contactPoint: {
      email: cube.contactPointEmail?.value,
      name: cube.contactPointName?.value,
    },
    publisher: cube.publisher?.value,
    landingPage: cube.landingPage?.value,
    expires: cube.expires?.value,
    workExamples: cube.workExamples?.value.split(GROUP_SEPARATOR),
  };
};

export const getCubeMetadata = async (
  iri: string,
  { locale, sparqlClient }: { locale: string; sparqlClient: ParsingClient }
): Promise<DataCubeMetadata> => {
  const query = SELECT`
    ?iri ?identifier ?title ?description ?version ?datePublished ?dateModified ?status ?creatorIri ?creatorLabel ?versionHistory ?contactPointName ?contactPointEmail ?publisher ?landingPage ?expires
    (GROUP_CONCAT(DISTINCT ?themeIri; SEPARATOR="${GROUP_SEPARATOR}") AS ?themeIris) (GROUP_CONCAT(DISTINCT ?themeLabel; SEPARATOR="${GROUP_SEPARATOR}") AS ?themeLabels)
    (GROUP_CONCAT(DISTINCT ?subthemeIri; SEPARATOR="${GROUP_SEPARATOR}") AS ?subthemeIris) (GROUP_CONCAT(DISTINCT ?subthemeLabel; SEPARATOR="${GROUP_SEPARATOR}") AS ?subthemeLabels)
    (GROUP_CONCAT(DISTINCT ?workExample; SEPARATOR="${GROUP_SEPARATOR}") AS ?workExamples)
    `.WHERE`
    VALUES ?iri { <${iri}> }
    OPTIONAL { ?iri ${ns.dcterms.identifier} ?identifier . }
    ${buildLocalizedSubQuery("iri", "schema:name", "title", {
      locale,
    })}
    ${buildLocalizedSubQuery("iri", "schema:description", "description", {
      locale,
    })}
    OPTIONAL { ?iri ${ns.schema.version} ?version . }
    OPTIONAL { ?iri ${ns.schema.datePublished} ?datePublished . }
    OPTIONAL { ?iri ${ns.schema.dateModified} ?dateModified . }
    ?iri ${ns.schema.creativeWorkStatus} ?status .
    OPTIONAL {
      ?iri ${ns.dcterms.creator} ?creatorIri .
      GRAPH <https://lindas.admin.ch/sfa/opendataswiss> {
        ?creatorIri a ${ns.schema.Organization} ;
          ${
            ns.schema.inDefinedTermSet
          } <https://register.ld.admin.ch/opendataswiss/org> .
          ${buildLocalizedSubQuery(
            "creatorIri",
            "schema:name",
            "creatorLabel",
            { locale }
          )}
      }
    }
    OPTIONAL {
      ?iri ${ns.dcat.theme} ?themeIri .
      GRAPH <https://lindas.admin.ch/sfa/opendataswiss> {
        ?themeIri a ${ns.schema.DefinedTerm} ;
        ${
          ns.schema.inDefinedTermSet
        } <https://register.ld.admin.ch/opendataswiss/category> .
        ${buildLocalizedSubQuery("themeIri", "schema:name", "themeLabel", {
          locale,
        })}
      }
    }
    OPTIONAL { ?versionHistory ${ns.schema.hasPart} ?iri . }
    OPTIONAL {
      ?iri ${ns.dcat.contactPoint} ?contactPoint .
      ?contactPoint ${ns.vcard.fn} ?contactPointName .
      ?contactPoint ${ns.vcard.hasEmail} ?contactPointEmail .
    }
    OPTIONAL { ?iri ${ns.dcterms.publisher} ?publisher . }
    OPTIONAL { ?iri ${ns.dcat.landingPage} ?landingPage . }
    OPTIONAL { ?iri ${ns.schema.expires} ?expires . }
    OPTIONAL { ?iri ${ns.schema.workExample} ?workExample . }
  `.GROUP().BY`?iri`.THEN.BY`?identifier`.THEN.BY`?title`.THEN.BY`?description`
    .THEN.BY`?version`.THEN.BY`?datePublished`.THEN.BY`?dateModified`.THEN
    .BY`?status`.THEN.BY`?creatorIri`.THEN.BY`?creatorLabel`.THEN
    .BY`?versionHistory`.THEN.BY`?contactPointName`.THEN.BY`?contactPointEmail`
    .THEN.BY`?publisher`.THEN.BY`?landingPage`.THEN.BY`?expires`
    .prologue`${pragmas}`;

  const results = (await query.execute(sparqlClient.query, {
    operation: "postUrlencoded",
  })) as RawDataCubeMetadata[];

  if (results.length === 0) {
    throw new Error(`No cube found for ${iri}!`);
  }

  if (results.length > 1) {
    throw new Error(`Multiple cubes found for ${iri}!`);
  }

  const result = results[0];

  return parseRawMetadata(result);
};

type RawDataCubeTheme = Omit<DataCubeTheme, "__typename">;
type RawDataCubeOrganization = Omit<DataCubeOrganization, "__typename">;

const parseSparqlTheme = (sparqlTheme: any) => {
  return {
    label: sparqlTheme.name.value,
    iri: sparqlTheme.theme.value,
  } as RawDataCubeTheme;
};

const parseSparqlOrganization = (sparqlOrg: any) => {
  return {
    label: sparqlOrg.name.value,
    iri: sparqlOrg.theme.value,
  } as RawDataCubeOrganization;
};

// Handles both batch loading and loading all themes
// Batch loading is done by load all themes and then filtering according to given IRIs
export const createThemeLoader =
  ({ locale, sparqlClient }: { locale: string; sparqlClient: ParsingClient }) =>
  async (
    filterIris?: readonly string[]
  ): Promise<(RawDataCubeTheme | null)[]> => {
    const query = SELECT.ALL.WHERE`
    graph   <https://lindas.admin.ch/sfa/opendataswiss> {
      ?theme a ${schema.DefinedTerm} ;
        ${
          schema.inDefinedTermSet
        } <https://register.ld.admin.ch/opendataswiss/category>; 
        ${makeLocalesFilter("?theme", schema.name, "?name", locale)}
    }`.prologue`${pragmas}`;
    const results = await query.execute(sparqlClient.query, {
      operation: "postUrlencoded",
    });

    if (filterIris) {
      const resultsByIri = keyBy(results, (x) => x.theme.value);
      return filterIris.map((iri) => {
        const theme = resultsByIri[iri];
        return theme ? parseSparqlTheme(theme) : null;
      });
    }

    return results.map(parseSparqlTheme);
  };

export const createOrganizationLoader =
  ({ locale, sparqlClient }: { locale: string; sparqlClient: ParsingClient }) =>
  async (
    filterIris?: readonly string[]
  ): Promise<(RawDataCubeOrganization | null)[]> => {
    const query = SELECT.ALL.WHERE`
    graph   <https://lindas.admin.ch/sfa/opendataswiss> {
      ?theme a ${schema.Organization} ;
      ${makeLocalesFilter("?theme", schema.name, "?name", locale)}
    }`.prologue`${pragmas}`;
    const results = await query.execute(sparqlClient.query, {
      operation: "postUrlencoded",
    });

    if (filterIris) {
      const resultsByIri = keyBy(results, (x) => x.theme.value);
      return filterIris.map((iri) => {
        const org = resultsByIri[iri];
        return org ? parseSparqlOrganization(org) : null;
      });
    }

    return results.map(parseSparqlOrganization);
  };

export const queryLatestPublishedCubeFromUnversionedIri = async (
  sparqlClient: ParsingClient,
  unversionedIri: string
) => {
  const iri = RDF.variable("iri");
  // Check if it is a versioned cube
  const query = SELECT`${iri}`.WHERE`
    <${unversionedIri}> ${schema.hasPart} ${iri}.
    ${makeVisualizeDatasetFilter({ includeDrafts: true })}
  `
    .ORDER()
    .BY(iri, true);
  const results = await sparqlClient.query.select(query.build(), {
    operation: "postUrlencoded",
  });
  if (results.length !== 1) {
    // Check if it is an unversioned cube
    const query = SELECT`*`.WHERE`
      <${unversionedIri}> ${cube.observationConstraint} ?shape.
      ${makeVisualizeDatasetFilter({ includeDrafts: true })}
    `;
    const results = await sparqlClient.query.select(query.build(), {
      operation: "postUrlencoded",
    });
    if (results.length === 0) {
      return;
    }
    return {
      iri: unversionedIri,
    };
  }
  return {
    iri: results[0].iri.value,
  };
};
