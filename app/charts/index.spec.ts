import { TableFields } from "@/configurator";
import { ComponentsQuery } from "@/graphql/query-hooks";

import bathingWaterData from "../test/__fixtures/data/DataCubeMetadataWithComponentValues-bathingWater.json";
import forestAreaData from "../test/__fixtures/data/forest-area-by-production-region.json";

import { getInitialConfig, getPossibleChartType } from "./index";

describe("initial config", () => {
  it("should create an initial table config with column order based on dimension order", () => {
    const config = getInitialConfig({
      chartType: "table",
      dimensions: forestAreaData.data.dataCubeByIri.dimensions as NonNullable<
        ComponentsQuery["dataCubeByIri"]
      >["dimensions"],
      measures: forestAreaData.data.dataCubeByIri.measures as NonNullable<
        ComponentsQuery["dataCubeByIri"]
      >["measures"],
    });
    expect(
      Object.values(config.fields as TableFields).map((x) => [
        x["componentIri"],
        x["index"],
      ])
    ).toEqual([
      ["https://environment.ld.admin.ch/foen/nfi/inventory", 0],
      ["https://environment.ld.admin.ch/foen/nfi/prodreg", 1],
      ["https://environment.ld.admin.ch/foen/nfi/struk", 2],
      ["https://environment.ld.admin.ch/foen/nfi/unitOfEvaluation", 3],
      ["https://environment.ld.admin.ch/foen/nfi/forestArea", 4],
      ["https://environment.ld.admin.ch/foen/nfi/standardErrorForestArea", 5],
      ["https://environment.ld.admin.ch/foen/nfi/grid", 6],
      ["https://environment.ld.admin.ch/foen/nfi/evaluationType", 7],
    ]);
  });
});

describe("possible chart types", () => {
  it("should allow appropriate chart types based on available dimensions", () => {
    const expectedChartTypes = ["area", "column", "line", "pie", "table"];
    const possibleChartTypes = getPossibleChartType({
      dimensions: bathingWaterData.data.dataCubeByIri.dimensions as NonNullable<
        ComponentsQuery["dataCubeByIri"]
      >["dimensions"],
      measures: bathingWaterData.data.dataCubeByIri.measures as NonNullable<
        ComponentsQuery["dataCubeByIri"]
      >["measures"],
    }).sort();

    expect(possibleChartTypes).toEqual(expectedChartTypes);
  });

  it("should only allow table if there are only measures available", () => {
    const possibleChartTypes = getPossibleChartType({
      dimensions: [],
      measures: [{ __typename: "NumericalMeasure" }] as any,
    });

    expect(possibleChartTypes).toEqual(["table"]);
  });

  it("should only allow column, map, pie and table if only geo dimensions are available", () => {
    const possibleChartTypes = getPossibleChartType({
      dimensions: [{ __typename: "GeoShapesDimension" }] as any,
      measures: [{ __typename: "NumericalMeasure" }] as any,
    }).sort();

    expect(possibleChartTypes).toEqual(["column", "map", "pie", "table"]);
  });
});
