import { Termset } from "@/domain/data";
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

export type BrowseFilter =
  | DataCubeTheme
  | DataCubeOrganization
  | DataCubeAbout
  | (Omit<Termset, "label"> & { label?: string });

/** Builds the state search filters from query params */

export const getFiltersFromParams = (params: BrowseParams) => {
  const filters: BrowseFilter[] = [];
  const { type, subtype, iri, subiri, topic } = params;
  for (const [t, i] of [
    [type, iri],
    [subtype, subiri],
  ]) {
    if (t && i && (t === "theme" || t === "organization" || t === "termset")) {
      const __typename = (() => {
        switch (t) {
          case "theme":
            return SearchCubeFilterType.DataCubeTheme;
          case "organization":
            return SearchCubeFilterType.DataCubeOrganization;
          case "termset":
            return SearchCubeFilterType.Termset;
        }
      })();
      filters.push({
        __typename,
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
