import RDF from "@rdfjs/data-model";
import { SELECT, sparql } from "@tpluscode/sparql-builder";
import keyBy from "lodash/keyBy";
import { ParsingClient } from "sparql-http-client/ParsingClient";

import { schema, dcat, dcterms, cube } from "../../app/rdf/namespace";
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

    const parsed = results.map(parseSparqlTheme);
    return parsed;
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

    const parsed = results.map(parseSparqlOrganization);
    return parsed;
  };

export const loadThemes = ({
  locale,
  sparqlClient,
}: {
  locale: string;
  sparqlClient: ParsingClient;
}) => {
  return createThemeLoader({ locale, sparqlClient })();
};

export const loadOrganizations = ({
  locale,
  sparqlClient,
}: {
  locale: string;
  sparqlClient: ParsingClient;
}) => {
  return createOrganizationLoader({ locale, sparqlClient })();
};

export const queryDatasetCountByOrganization = async ({
  sparqlClient,
  theme,
  includeDrafts,
}: {
  sparqlClient: ParsingClient;
  theme?: string;
  includeDrafts?: boolean;
}) => {
  const query = SELECT`(count(?iri) as ?count) ?creator`.WHERE`
    ?iri ${dcterms.creator} ?creator.
    ${theme ? sparql`?iri ${dcat.theme} <${theme}>.` : ``}
    ${makeVisualizeDatasetFilter({ includeDrafts })}
  `.GROUP().BY`?creator`.build();
  const results = await sparqlClient.query.select(query, {
    operation: "postUrlencoded",
  });
  return results
    .map((r) => {
      return {
        count: parseInt(r.count.value, 10),
        iri: r.creator?.value,
      };
    })
    .filter((r) => r.iri);
};

export const queryDatasetCountByTheme = async ({
  sparqlClient,
  organization,
  includeDrafts,
}: {
  sparqlClient: ParsingClient;
  organization?: string;
  includeDrafts?: boolean;
}) => {
  const query = SELECT`(count(?iri) as ?count) ?theme`.WHERE`
    ?iri ${dcat.theme} ?theme.
    ${organization ? sparql`?iri ${dcterms.creator} <${organization}>.` : ``}
    ?theme ${
      schema.inDefinedTermSet
    } <https://register.ld.admin.ch/opendataswiss/category>.
    ${makeVisualizeDatasetFilter({ includeDrafts })}
  `.GROUP().BY`?theme`.build();
  const results = await sparqlClient.query.select(query, {
    operation: "postUrlencoded",
  });
  return results
    .map((r) => {
      return {
        count: parseInt(r.count.value, 10),
        iri: r.theme?.value,
      };
    })
    .filter((r) => r.iri);
};

export const queryDatasetCountBySubTheme = async ({
  sparqlClient,
  organization,
  theme,
  includeDrafts,
}: {
  sparqlClient: ParsingClient;
  organization?: string;
  theme?: string;
  includeDrafts?: boolean;
}) => {
  const baseQuery = SELECT`(count(?iri) as ?count) ?subtheme`.WHERE`
    ?iri ${schema.about} ?subtheme.
    ${organization ? sparql`?iri ${dcterms.creator} <${organization}>.` : ``}
    ${theme ? sparql`?iri ${dcat.theme} <${theme}>.` : ``}
    ?iri ${schema.about} ?subtheme. 
    ${makeVisualizeDatasetFilter({ includeDrafts })}
  `.build();
  const query = `${baseQuery} GROUP BY ?subtheme`;
  const results = await sparqlClient.query.select(query, {
    operation: "postUrlencoded",
  });
  return results
    .map((r) => {
      return {
        count: parseInt(r.count.value, 10),
        iri: r.subtheme?.value,
      };
    })
    .filter((r) => r.iri);
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

export const loadSubthemes = async ({
  sparqlClient,
  parentIri,
  locale,
}: {
  sparqlClient: ParsingClient;
  parentIri: string;
  locale: string;
}) => {
  const query = SELECT`?iri ?label`.WHERE`
    ?iri ${schema.inDefinedTermSet} <${parentIri}>;
    ${makeLocalesFilter("?iri", schema.name, "?label", locale)}
  `.build();
  const results = await sparqlClient.query.select(query, {
    operation: "postUrlencoded",
  });
  return results.map((r) => {
    return {
      iri: r.iri.value,
      label: r.label.value,
    };
  });
};
