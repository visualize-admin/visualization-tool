import { BrowseParams } from "@/pages/browse";

import { getFiltersFromParams } from "./filters";

describe("getFiltersFromParams", () => {
  it("should work only for organization", () => {
    const params = {
      type: "organization",
      iri: "https://fake-iri-organization",
    } as BrowseParams;
    const filters = getFiltersFromParams(params);
    expect(filters).toEqual([
      {
        __typename: "DataCubeOrganization",
        iri: "https://fake-iri-organization",
      },
    ]);
  });

  it("should work for theme + organization", () => {
    const params = {
      type: "theme",
      iri: "https://fake-iri-theme",
      subtype: "organization",
      subiri: "https://fake-iri-organization",
    } as BrowseParams;
    const filters = getFiltersFromParams(params);
    expect(filters).toEqual([
      { iri: "https://fake-iri-theme", __typename: "DataCubeTheme" },
      {
        iri: "https://fake-iri-organization",
        __typename: "DataCubeOrganization",
      },
    ]);
  });

  it("should work for organization + theme", () => {
    const params = {
      type: "organization",
      iri: "https://fake-iri-organization",
      subtype: "theme",
      subiri: "https://fake-iri-theme",
    } as BrowseParams;
    const filters = getFiltersFromParams(params);
    expect(filters).toEqual([
      {
        iri: "https://fake-iri-organization",
        __typename: "DataCubeOrganization",
      },
      { iri: "https://fake-iri-theme", __typename: "DataCubeTheme" },
    ]);
  });

  it("should not assign a filter if type is other than organization/theme", () => {
    const params = {
      type: "dataset",
      iri: "https://fake-iri-dataset",
    } as BrowseParams;
    const filters = getFiltersFromParams(params);
    expect(filters).toEqual([]);
  });
});
