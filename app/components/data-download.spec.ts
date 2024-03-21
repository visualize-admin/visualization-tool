import get from "lodash/get";

import { getFullDataDownloadFilters } from "@/components/data-download";
import { DataCubeObservationFilter } from "@/graphql/query-hooks";

describe("getFullDataDownloadFilters", () => {
  it("should not have componentIris", () => {
    const rawFilters: DataCubeObservationFilter[] = [
      {
        iri: "ABC",
        componentIris: ["DEF"],
      },
      {
        iri: "GHI",
      },
    ];
    const filters = getFullDataDownloadFilters(rawFilters);
    expect(filters.some((f) => get(f, "componentIris"))).toBeFalsy();
  });
});
