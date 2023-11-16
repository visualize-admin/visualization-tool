import RDF from "@rdfjs/data-model";
import { SELECT } from "@tpluscode/sparql-builder";
import keyBy from "lodash/keyBy";
import { ParsingClient } from "sparql-http-client/ParsingClient";

import { cube, schema } from "../../app/rdf/namespace";
import { DataCubeOrganization, DataCubeTheme } from "../graphql/query-hooks";

import { pragmas } from "./create-source";
import { makeLocalesFilter } from "./query-labels";
import { makeVisualizeDatasetFilter } from "./query-utils";

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
