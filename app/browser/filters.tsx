import {
  DataCubeOrganization,
  DataCubeTheme,
  SearchCubeFilterType,
} from "@/graphql/query-hooks";
import { BrowseParams } from "@/pages/browse";

export type DataCubeAbout = {
  __typename: "DataCubeAbout";
  iri: string;
};

export type BrowseFilter = DataCubeTheme | DataCubeOrganization | DataCubeAbout;
/** Builds the state search filters from query params */

export const getFiltersFromParams = (params: BrowseParams) => {
  const filters: BrowseFilter[] = [];
  const { type, subtype, iri, subiri, topic } = params;
  for (const [t, i] of [
    [type, iri],
    [subtype, subiri],
  ]) {
    if (t && i && (t === "theme" || t === "organization")) {
      filters.push({
        __typename:
          t === "theme"
            ? SearchCubeFilterType.DataCubeTheme
            : SearchCubeFilterType.DataCubeOrganization,
        iri: i,
      });
    }
  }

  if (topic) {
    filters.push({
      __typename: SearchCubeFilterType.DataCubeAbout,
      iri: topic,
    });
  }

  return filters;
};
