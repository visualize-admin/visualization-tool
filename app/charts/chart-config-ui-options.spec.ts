import { ColumnConfig } from "@/configurator";

import { defaultSegmentOnChange } from "./chart-config-ui-options";

jest.mock("rdf-cube-view-query", () => ({
  Node: class {
    constructor() {}
  },
  Source: class {
    constructor() {}
  },
  Cube: class {
    constructor() {}
  },
}));

jest.mock("../rdf/extended-cube", () => ({
  ExtendedCube: jest.fn(),
}));

describe("defaultSegmentOnChange", () => {
  it("should not modify filters if selected values are empty", () => {
    const filters = { iri: { type: "single", value: "value" } };
    defaultSegmentOnChange("iri", {
      field: "segment",
      chartConfig: { filters, fields: {} } as any as ColumnConfig,
      dimensions: [],
      measures: [],
      initializing: true,
      selectedValues: [],
    });
    expect(filters).toEqual({ iri: { type: "single", value: "value" } });
  });
});
