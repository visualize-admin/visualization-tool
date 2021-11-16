import { SELECT } from "@tpluscode/sparql-builder";

import { sparqlClient } from "./sparql-client";
import { schema, dcat, dcterms } from "../../app/rdf/namespace";
import { DataCubeOrganization, DataCubeTheme } from "../graphql/query-hooks";
import { keyBy, mapValues } from "lodash";
import { makeLocalesFilter } from "./query-labels";

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
  ({ locale }: { locale: string }) =>
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
    }`;
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
  ({ locale }: { locale: string }) =>
  async (
    filterIris?: readonly string[]
  ): Promise<(RawDataCubeOrganization | null)[]> => {
    const query = SELECT.ALL.WHERE`
    graph   <https://lindas.admin.ch/sfa/opendataswiss> {
      ?theme a ${schema.Organization} ;
      ${makeLocalesFilter("?theme", schema.name, "?name", locale)}
    }`;
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

export const loadThemes = ({ locale }: { locale: string }) => {
  return createThemeLoader({ locale })();
};

export const loadOrganizations = ({ locale }: { locale: string }) => {
  return createOrganizationLoader({ locale })();
};

export const queryDatasetCountByOrganization = async ({
  theme,
}: {
  theme?: string;
}) => {
  const baseQuery = SELECT`(count(?iri) as ?count) ?creator`.WHERE`
    ?iri ${dcterms.creator} ?creator.
    ${theme ? `?iri <${dcat.theme.value}> <${theme}>.` : ``}
    ${makeVisualizeDatasetFilter()}
  `.build();
  const query = `${baseQuery} GROUP BY ?creator`;
  const results = await sparqlClient.query.select(query, {
    operation: "postUrlencoded",
  });
  return results.map((r) => {
    return {
      count: parseInt(r.count.value, 10),
      iri: r.creator.value,
    };
  });
};

const makeVisualizeDatasetFilter = () => {
  return `
    ?iri <${schema.workExample.value}> <https://ld.admin.ch/application/visualize>.
    ?iri <${schema.creativeWorkStatus.value}> <https://ld.admin.ch/vocabulary/CreativeWorkStatus/Published>.
    FILTER NOT EXISTS {?iri schema:expires ?expiryDate }
  `;
};

export const queryDatasetCountByTheme = async ({
  organization,
}: {
  organization?: string;
}) => {
  const baseQuery = SELECT`(count(?iri) as ?count) ?theme`.WHERE`
    ?iri ${dcat.theme} ?theme.
    ${
      organization
        ? ` 
      ?iri <${dcterms.creator.value}> <${organization}>.`
        : ``
    }
    ?theme ${
      schema.inDefinedTermSet
    } <https://register.ld.admin.ch/opendataswiss/category>.
    ${makeVisualizeDatasetFilter()}
  `.build();
  const query = `${baseQuery} GROUP BY ?theme`;
  const results = await sparqlClient.query.select(query, {
    operation: "postUrlencoded",
  });
  return results.map((r) => {
    return {
      count: parseInt(r.count.value, 10),
      iri: r.theme.value,
    };
  });
};

export const queryDatasetCountBySubTheme = async ({
  organization,
  theme,
}: {
  organization?: string;
  theme?: string;
}) => {
  const baseQuery = SELECT`(count(?iri) as ?count) ?subtheme`.WHERE`
    ?iri ${schema.about} ?subtheme.
    ${
      organization
        ? ` 
      ?iri <${dcterms.creator.value}> <${organization}>.`
        : ``
    }
    ${
      theme
        ? ` 
      ?iri <${dcat.theme.value}> <${theme}>.`
        : ``
    }
    ?iri ${schema.about} ?subtheme. 
    ${makeVisualizeDatasetFilter()}
  `.build();
  const query = `${baseQuery} GROUP BY ?subtheme`;
  const results = await sparqlClient.query.select(query, {
    operation: "postUrlencoded",
  });
  return results.map((r) => {
    return {
      count: parseInt(r.count.value, 10),
      iri: r.subtheme.value,
    };
  });
};

export const loadSubthemes = async ({
  parentIri,
  locale,
}: {
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
