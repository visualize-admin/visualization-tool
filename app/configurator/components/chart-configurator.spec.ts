// eslint-disable-next-line import/order
import { RDFCubeViewQueryMock } from "@/test/cube-view-query-mock";
RDFCubeViewQueryMock;

import { ChartConfig } from "@/config-types";
import { getFilterReorderCubeFilters } from "@/configurator/components/chart-configurator";

describe("getFilterReorderCubeFilters", () => {
  it("should load dimension values", () => {
    const cubeFilters = getFilterReorderCubeFilters(
      { cubes: [{ filters: {} }], fields: {} } as any as ChartConfig,
      { joinByIris: [] }
    );
    expect(cubeFilters[0].loadValues).toBe(true);
  });
});
