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

export const getParamsFromFilters = (filters: BrowseFilter[]) => {
  const params: BrowseParams = {
    type: undefined,
    subtype: undefined,
    iri: undefined,
    subiri: undefined,
    topic: undefined,
  };
  let i = 0;
  for (const filter of filters) {
    const typeAttr = i === 0 ? "type" : ("subtype" as const);
    const iriAttr = i === 0 ? "iri" : ("subiri" as const);
    switch (filter.__typename) {
      case SearchCubeFilterType.DataCubeTheme:
        params[typeAttr] = "theme";
        params[iriAttr] = filter.iri;
        break;
      case SearchCubeFilterType.DataCubeOrganization:
        params[typeAttr] = "organization";
        params[iriAttr] = filter.iri;
        break;
      case SearchCubeFilterType.DataCubeAbout:
        params.topic = filter.iri;
        break;
      case SearchCubeFilterType.Termset:
        params[typeAttr] = "termset";
        params[iriAttr] = filter.iri;
        break;
    }
    i++;
  }
  return params;
};
