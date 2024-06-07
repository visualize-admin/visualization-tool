import get from "lodash/get";

import { getFullDataDownloadFilters } from "@/components/data-download";
import { DataCubeObservationFilter } from "@/graphql/query-hooks";

describe("getFullDataDownloadFilters", () => {
  it("should not have componentIris", () => {
    const rawFilters: DataCubeObservationFilter = {
      iri: "ABC",
      componentIris: ["DEF"],
    };
    const filters = getFullDataDownloadFilters(rawFilters);
    expect(get(filters, "componentIris")).toBeFalsy();
  });
});
