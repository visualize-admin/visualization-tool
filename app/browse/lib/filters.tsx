import { BrowseParams } from "@/browse/lib/params";
import {
  DataCubeOrganization,
  DataCubeTermset,
  DataCubeTheme,
  SearchCubeFilterType,
} from "@/graphql/query-hooks";

export type DataCubeAbout = {
  __typename: "DataCubeAbout";
  iri: string;
};

export type BrowseFilter =
  | DataCubeTheme
  | DataCubeOrganization
  | DataCubeAbout
  | DataCubeTermset;

/** Builds the state search filters from query params */
export const getFiltersFromParams = ({
  type,
  subtype,
  subsubtype,
  iri,
  subiri,
  subsubiri,
  topic,
}: BrowseParams) => {
  const filters: BrowseFilter[] = [];

  for (const [t, i] of [
    [type, iri],
    [subtype, subiri],
    [subsubtype, subsubiri],
  ]) {
    if (t && i && (t === "theme" || t === "organization" || t === "termset")) {
      const __typename = (() => {
        switch (t) {
          case "theme":
            return SearchCubeFilterType.DataCubeTheme;
          case "organization":
            return SearchCubeFilterType.DataCubeOrganization;
          case "termset":
            return SearchCubeFilterType.DataCubeTermset;
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
    subsubtype: undefined,
    iri: undefined,
    subiri: undefined,
    subsubiri: undefined,
    topic: undefined,
  };
  let i = 0;

  for (const filter of filters) {
    const typeAttr = i === 0 ? "type" : i === 1 ? "subtype" : "subsubtype";
    const iriAttr = i === 0 ? "iri" : i === 1 ? "subiri" : "subsubiri";

    switch (filter.__typename) {
      case "DataCubeTheme":
        params[typeAttr] = "theme";
        params[iriAttr] = filter.iri;
        break;
      case "DataCubeOrganization":
        params[typeAttr] = "organization";
        params[iriAttr] = filter.iri;
        break;
      case "DataCubeAbout":
        params.topic = filter.iri;
        break;
      case "DataCubeTermset":
        params[typeAttr] = "termset";
        params[iriAttr] = filter.iri;
        break;
      default:
        const _exhaustiveCheck: never = filter;
        return _exhaustiveCheck;
    }

    i++;
  }

  return params;
};

export const encodeFilter = ({ __typename, iri }: BrowseFilter) => {
  const folder = (() => {
    switch (__typename) {
      case "DataCubeTheme":
        return "theme";
      case "DataCubeOrganization":
        return "organization";
      case "DataCubeAbout":
        return "topic";
      case "DataCubeTermset":
        return "termset";
      default:
        const _exhaustiveCheck: never = __typename;
        return _exhaustiveCheck;
    }
  })();

  return `${folder}/${encodeURIComponent(iri)}`;
};
