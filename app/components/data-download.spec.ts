import get from "lodash/get";
import { describe, expect, it } from "vitest";

import { getFullDataDownloadFilters } from "@/components/data-download";
import { DataCubeObservationFilter } from "@/graphql/query-hooks";

describe("getFullDataDownloadFilters", () => {
  it("should not have componentIds", () => {
    const rawFilters: DataCubeObservationFilter = {
      iri: "ABC",
      componentIds: ["DEF"],
    };
    const filters = getFullDataDownloadFilters(rawFilters);
    expect(get(filters, "componentIds")).toBeFalsy();
  });
});
