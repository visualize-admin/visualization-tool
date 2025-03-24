import { SELECT } from "@tpluscode/sparql-builder";
import { Literal, NamedNode } from "rdf-js";
import { ParsingClient } from "sparql-http-client/ParsingClient";

import { DataCubeMetadata } from "@/domain/data";
import { DataCubePublicationStatus } from "@/graphql/query-hooks";
import { pragmas } from "@/rdf/create-source";
import * as ns from "@/rdf/namespace";
import { buildLocalizedSubQuery, GROUP_SEPARATOR } from "@/rdf/query-utils";

type RawDataCubeMetadata = {
  iri: NamedNode;
  unversionedIri: NamedNode;
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
    unversionedIri: cube.unversionedIri?.value,
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
    ?iri ?identifier ?title ?description ?version ?datePublished ?dateModified ?status ?creatorIri ?creatorLabel ?unversionedIri ?contactPointName ?contactPointEmail ?publisher ?landingPage ?expires
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
    OPTIONAL { ?unversionedIri ${ns.schema.hasPart} ?iri . }
    OPTIONAL {
      ?iri ${ns.dcat.contactPoint} ?contactPoint .
      ?contactPoint ${ns.vcard.fn} ?contactPointName .
      ?contactPoint ${ns.vcard.hasEmail} ?contactPointEmail .
    }
    OPTIONAL { ?iri ${ns.dcterms.publisher} ?publisher . }
    ${buildLocalizedSubQuery("iri", "dcat:landingPage", "landingPage", {
      locale,
      fallbackToNonLocalized: true,
    })}
    OPTIONAL { ?iri ${ns.schema.expires} ?expires . }
    OPTIONAL { ?iri ${ns.schema.workExample} ?workExample . }
  `.GROUP().BY`?iri`.THEN.BY`?identifier`.THEN.BY`?title`.THEN.BY`?description`
    .THEN.BY`?version`.THEN.BY`?datePublished`.THEN.BY`?dateModified`.THEN
    .BY`?status`.THEN.BY`?creatorIri`.THEN.BY`?creatorLabel`.THEN
    .BY`?unversionedIri`.THEN.BY`?contactPointName`.THEN.BY`?contactPointEmail`
    .THEN.BY`?publisher`.THEN.BY`?landingPage`.THEN.BY`?expires`
    .prologue`${pragmas}`;

  const results = (await query.execute(sparqlClient.query, {
    operation: "postUrlencoded",
  })) as RawDataCubeMetadata[];

  if (results.length === 0) {
    throw Error(`No cube found for ${iri}!`);
  }

  if (results.length > 1) {
    throw Error(`Multiple cubes found for ${iri}!`);
  }

  const result = results[0];

  return parseRawMetadata(result);
};
