import {
  DataCubeOrganization,
  DataCubeTheme,
  OrganizationsQuery,
  ThemesQuery,
} from "@/graphql/query-hooks";
import { BrowseParams } from "@/pages/browse";

export type DataCubeAbout = {
  __typename: "DataCubeAbout";
  iri: string;
};

export type BrowseFilter = DataCubeTheme | DataCubeOrganization | DataCubeAbout;
/** Builds the state search filters from query params */

export const getFiltersFromParams = (
  params: BrowseParams,
  context: {
    themes?: ThemesQuery["themes"];
    organizations?: OrganizationsQuery["organizations"];
  }
) => {
  const filters: BrowseFilter[] = [];
  const { type, subtype, iri, subiri, topic } = params;
  for (const [t, i] of [
    [type, iri],
    [subtype, subiri],
  ]) {
    if (t && i && (t === "theme" || t === "organization")) {
      const container = context[
        t === "theme" ? "themes" : "organizations"
      ] as BrowseFilter[];
      const obj = container?.find((f) => i === f.iri);
      if (obj) {
        filters.push(obj);
      } else {
        break;
      }
    }
  }
  if (topic) {
    filters.push({
      __typename: "DataCubeAbout",
      iri: topic,
    });
  }

  return filters;
};
