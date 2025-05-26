import { describe, expect, it } from "vitest";

import { ChartConfig } from "@/config-types";
import { getFilterReorderCubeFilters } from "@/configurator/components/chart-configurator";

describe("getFilterReorderCubeFilters", () => {
  it("should load dimension values", () => {
    const cubeFilters = getFilterReorderCubeFilters(
      { cubes: [{ filters: {} }], fields: {} } as any as ChartConfig,
      { joinByIds: [] }
    );

    expect(cubeFilters[0].loadValues).toBe(true);
  });
});
