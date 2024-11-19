import { defaultSegmentOnChange } from "@/charts/chart-config-ui-options";
import { ColumnConfig, ScatterPlotConfig } from "@/configurator";
import { stringifyComponentId } from "@/graphql/make-component-id";
import { DEFAULT_CATEGORICAL_PALETTE_NAME } from "@/palettes";

jest.mock("../rdf/extended-cube", () => ({
  ExtendedCube: jest.fn(),
}));

describe("defaultSegmentOnChange", () => {
  const componentId = stringifyComponentId({
    unversionedCubeIri: "cube",
    unversionedComponentIri: "iri",
  });

  it("should not modify filters if selected values are empty", () => {
    const filters = { iri: { type: "single", value: "value" } };
    defaultSegmentOnChange(componentId, {
      field: "segment",
      chartConfig: { filters, fields: {} } as any as ColumnConfig,
      dimensions: [],
      measures: [],
      initializing: true,
      selectedValues: [],
    });
    expect(filters).toEqual({
      iri: {
        type: "single",
        value: "value",
      },
    });
  });

  it("should correctly modify segment", () => {
    const chartConfig = { fields: {} } as any as ScatterPlotConfig;
    defaultSegmentOnChange(componentId, {
      field: "segment",
      chartConfig,
      dimensions: [],
      measures: [],
      initializing: false,
      selectedValues: [],
    });
    expect(Object.keys(chartConfig.fields)).toEqual(["segment"]);
    expect(chartConfig.fields.segment).toEqual(
      expect.objectContaining({
        componentId,
        palette: DEFAULT_CATEGORICAL_PALETTE_NAME,
      })
    );
  });
});
