import { descending } from "d3-array";
import groupBy from "lodash/groupBy";
import ParsingClient from "sparql-http-client/ParsingClient";

import { SearchCube } from "@/domain/data";
import { truthy } from "@/domain/types";
import { SearchCubeFilterType, TimeUnit } from "@/graphql/query-hooks";
import { SearchCubeFilter } from "@/graphql/resolver-types";
import { defaultLocale } from "@/locales/locales";
import { pragmas } from "@/rdf/create-source";
import { unitsToNode } from "@/rdf/mappings";
import { buildSearchCubes } from "@/rdf/parse-search-results";
import { computeScores, highlight } from "@/rdf/query-search-score-utils";
import {
  buildLocalizedSubQuery,
  formatIriToQueryNode,
  makeVisualizeDatasetFilter,
} from "@/rdf/query-utils";

const makeInFilter = (name: string, values: string[]) => {
  return `
    ${
      values.length > 0
        ? `FILTER (bound(?${name}) && ?${name} IN (${values.map(formatIriToQueryNode)}))`
        : ""
    }`;
};

/**
 * SharedDimension and TemporalDimensions filters are exclusive and cannot be done together due
 * to how the SPARQL query is done.
 */
const fanOutExclusiveFilters = (
  filters: SearchCubeFilter[] | null | undefined
): (SearchCubeFilter[] | null | undefined)[] => {
  if (!filters) {
    return [filters];
  }

  const { exclusive = [], common = [] } = groupBy(filters, (f) => {
    return f.type === SearchCubeFilterType.Termset ||
      f.type === SearchCubeFilterType.TemporalDimension
      ? "exclusive"
      : "common";
  });

  if (!exclusive.length) {
    return [common];
  }

  return exclusive.map((ef) => [ef, ...common]);
};

export const mergeSearchCubes = (
  a: SearchCube | undefined,
  b: SearchCube
): SearchCube => {
  return {
    ...a,
    ...b,
    dimensions: [...(a?.dimensions ?? []), ...(b.dimensions ?? [])],
  };
};

export const searchCubes = async ({
  query,
  locale: _locale,
  filters,
  includeDrafts,
  sparqlClient,
}: {
  query?: string | null;
  locale?: string | null;
  filters?: SearchCubeFilter[] | null;
  includeDrafts?: Boolean | null;
  sparqlClient: ParsingClient;
}) => {
  const locale = _locale ?? defaultLocale;
  // Search cubeIris along with their score
  const themeValues =
    filters
      ?.filter((x) => x.type === SearchCubeFilterType.DataCubeTheme)
      .map((v) => v.value) ?? [];
  const creatorValues =
    filters
      ?.filter((x) => x.type === SearchCubeFilterType.DataCubeOrganization)
      .map((v) => v.value) ?? [];

  const exclusiveFilters = fanOutExclusiveFilters(filters);
  const scoresQueries = exclusiveFilters.map((filters) =>
    mkScoresQuery(
      locale,
      filters,
      creatorValues,
      themeValues,
      includeDrafts,
      query
    )
  );

  const scoreResults = await Promise.all(
    scoresQueries.map((scoresQuery) =>
      sparqlClient.query.construct(scoresQuery, {
        operation: "postUrlencoded",
      })
    )
  );

  const parsedCubes = Object.values(
    scoreResults
      .map((x) => buildSearchCubes(x))
      .flatMap((d) => d)
      .reduce(
        (acc, d) => {
          acc[d.iri] = mergeSearchCubes(acc[d.iri], d);
          return acc;
        },
        {} as Record<string, SearchCube>
      )
  );

  const infoByCube = computeScores(parsedCubes, { query });

  const cubes = parsedCubes.filter(truthy);

  return cubes
    .sort((a, b) =>
      descending(infoByCube[a.iri].score, infoByCube[b.iri].score)
    )
    .map((cube) => ({
      cube,
      highlightedTitle: query ? highlight(cube.title, query) : cube.title,
      highlightedDescription:
        query && cube.description
          ? highlight(cube.description, query)
          : cube.description,
    }));
};

export type SearchResult = Awaited<ReturnType<typeof searchCubes>>[0];

const mkScoresQuery = (
  locale: string,
  filters: SearchCubeFilter[] | null | undefined,
  creatorValues: string[],
  themeValues: string[],
  includeDrafts: Boolean | null | undefined,
  query: string | null | undefined
) => {
  return `
  ${pragmas}
  # HOTFIX WRT Stardog v9.2.1 bug see https://control.vshn.net/tickets/sbar-1066
  #pragma join.bind off

  PREFIX meta: <https://cube.link/meta/>
  PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
  PREFIX schema: <http://schema.org/>
  PREFIX sh: <http://www.w3.org/ns/shacl#>
  PREFIX cube: <https://cube.link/>
  PREFIX cubeMeta: <https://cube.link/meta/>
  PREFIX dcterms: <http://purl.org/dc/terms/>
  PREFIX dcat: <http://www.w3.org/ns/dcat#>
  PREFIX visualize: <https://visualize.admin.ch/>
  PREFIX time: <http://www.w3.org/2006/time#>

  CONSTRUCT {
    ?iri a cube:Cube ;
      cube:observationConstraint ?shape;
      dcat:theme ?themeIri;
      dcterms:publisher ?publisher ;
      schema:about ?subthemeIri;
      schema:creativeWorkStatus ?status ;
      schema:creator ?creatorIri ;
      schema:datePublished ?datePublished;
      schema:description ?description ;
      schema:name ?title ;
      schema:workExample <https://ld.admin.ch/application/visualize> ;
      visualize:hasDimension ?dimensionIri.

    ?dimensionIri
      visualize:hasTermset ?termsetIri ;
      visualize:hasTimeUnit ?unitType ;
      schema:name ?dimensionLabel .
      
    ?termsetIri schema:name ?termsetLabel .
    ?creatorIri schema:name ?creatorLabel .
    ?themeIri schema:name ?themeLabel .
    ?subthemeIri schema:inDefinedTermSet ?subthemeTermset ;
                  schema:name ?subthemeLabel .
  }
    WHERE {
      ?iri a cube:Cube .
      ${buildLocalizedSubQuery("iri", "schema:name", "title", {
        locale,
      })}
      ${buildLocalizedSubQuery("iri", "schema:description", "description", {
        locale,
      })}

      ${filters
        ?.map((df) => {
          if (df.type === SearchCubeFilterType.TemporalDimension) {
            const value = df.value as TimeUnit;
            const unitNode = unitsToNode.get(value);
            if (!unitNode) {
              throw new Error(`Invalid temporal unit used ${value}`);
            }

            return `
            ?iri cube:observationConstraint ?shape .
            ?shape sh:property ?dimension .
            ?dimension
              sh:path ?dimensionIri ;
              cubeMeta:dataKind/time:unitType ?unitType ;
              cubeMeta:dataKind/time:unitType <${unitNode}>.

            ${buildLocalizedSubQuery(
              "dimension",
              "schema:name",
              "dimensionLabel",
              {
                locale,
              }
            )}
          `;
          } else if (df.type === SearchCubeFilterType.Termset) {
            const sharedDimensions = df.value.split(";");
            return `
            VALUES (?termsetIri) {${sharedDimensions.map((sd) => `(<${sd}>)`).join(" ")}}
            ?iri a cube:Cube .
            ?iri cube:observationConstraint/sh:property ?dimension .
            ?dimension a cube:KeyDimension .
            ?dimension sh:in/rdf:first ?value.
            ?dimension sh:path ?dimensionIri .
            ${buildLocalizedSubQuery(
              "dimension",
              "schema:name",
              "dimensionLabel",
              {
                locale,
              }
            )}
      
            ?value schema:inDefinedTermSet ?termsetIri .
            ${buildLocalizedSubQuery("termsetIri", "schema:name", "termsetLabel", { locale })}`;
          }
        })
        .filter(truthy)
        .join("\n")}

      # Publisher, creator status, datePublished
      OPTIONAL { ?iri dcterms:publisher ?publisher . }
      ?iri schema:creativeWorkStatus ?status .
      OPTIONAL { ?iri schema:datePublished ?datePublished . }

      ${creatorValues.length ? makeInFilter("creatorIri", creatorValues) : ""}
      OPTIONAL {
        ?iri dcterms:creator ?creatorIri .
        GRAPH <https://lindas.admin.ch/sfa/opendataswiss> {
          ?creatorIri a schema:Organization ;
            schema:inDefinedTermSet <https://register.ld.admin.ch/opendataswiss/org> .
            ${buildLocalizedSubQuery(
              "creatorIri",
              "schema:name",
              "creatorLabel",
              { locale }
            )}
        }
      }

      OPTIONAL {
        ?iri dcat:theme ?themeIri .
        GRAPH <https://lindas.admin.ch/sfa/opendataswiss> {
          ?themeIri a schema:DefinedTerm ;
          schema:inDefinedTermSet <https://register.ld.admin.ch/opendataswiss/category> .
          ${buildLocalizedSubQuery("themeIri", "schema:name", "themeLabel", {
            locale,
          })}
        }
      }
      ${
        themeValues.length
          ? `
      VALUES ?theme { ${themeValues.map(formatIriToQueryNode).join(" ")} }
      ?iri dcat:theme ?theme .
      `
          : ""
      }

      # Add more subtheme termsets here when they are available
       ${
         creatorValues.includes(
           "https://register.ld.admin.ch/opendataswiss/org/bundesamt-fur-umwelt-bafu"
         )
           ? `
      OPTIONAL {
        ?iri schema:about ?subthemeIri .
        VALUES (?subthemeGraph ?subthemeTermset) { (<https://lindas.admin.ch/foen/themes> <https://register.ld.admin.ch/foen/theme>) }
        GRAPH ?subthemeGraph {
          ?subthemeIri a schema:DefinedTerm ;
          schema:inDefinedTermSet ?subthemeTermset .
        }
        ${buildLocalizedSubQuery(
          "subthemeIri",
          "schema:name",
          "subthemeLabel",
          { locale }
        )}
      } 
      `
           : ""
       }

      ${makeVisualizeDatasetFilter({
        includeDrafts: !!includeDrafts,
        cubeIriVar: "?iri",
      }).toString()}

      ${
        query
          ? `
      VALUES ?keyword {${query
        .split(" ")
        .map((d) => `"${d}"`)
        .join(" ")}}

      FILTER(
        CONTAINS(LCASE(?title_de), LCASE(?keyword)) ||
        CONTAINS(LCASE(?title_fr), LCASE(?keyword)) ||
        CONTAINS(LCASE(?title_it), LCASE(?keyword)) ||
        CONTAINS(LCASE(?title_en), LCASE(?keyword)) ||
        CONTAINS(LCASE(?title_),   LCASE(?keyword)) ||
      
        CONTAINS(LCASE(?description_de), LCASE(?keyword)) ||
        CONTAINS(LCASE(?description_fr), LCASE(?keyword)) ||
        CONTAINS(LCASE(?description_it), LCASE(?keyword)) ||
        CONTAINS(LCASE(?description_en), LCASE(?keyword)) ||
        CONTAINS(LCASE(?description_),   LCASE(?keyword)) ||
          
        CONTAINS(LCASE(?creatorLabel_de), LCASE(?keyword)) || 
        CONTAINS(LCASE(?creatorLabel_fr), LCASE(?keyword)) || 
        CONTAINS(LCASE(?creatorLabel_it), LCASE(?keyword)) || 
        CONTAINS(LCASE(?creatorLabel_en), LCASE(?keyword)) || 
        CONTAINS(LCASE(?creatorLabel_),   LCASE(?keyword)) || 
          
        CONTAINS(LCASE(?themeLabel_de), LCASE(?keyword)) || 
        CONTAINS(LCASE(?themeLabel_fr), LCASE(?keyword)) || 
        CONTAINS(LCASE(?themeLabel_it), LCASE(?keyword)) || 
        CONTAINS(LCASE(?themeLabel_en), LCASE(?keyword)) || 
        CONTAINS(LCASE(?themeLabel_),   LCASE(?keyword)) || 
          
        CONTAINS(LCASE(?subthemeLabel_de), LCASE(?keyword)) || 
        CONTAINS(LCASE(?subthemeLabel_fr), LCASE(?keyword)) || 
        CONTAINS(LCASE(?subthemeLabel_it), LCASE(?keyword)) || 
        CONTAINS(LCASE(?subthemeLabel_en), LCASE(?keyword)) || 
        CONTAINS(LCASE(?subthemeLabel_),   LCASE(?keyword)) || 
          
        CONTAINS(LCASE(?publisher), LCASE(?keyword))
      )`
          : ""
      }
    
    }`;
};
