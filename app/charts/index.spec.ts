import { TableFields } from "@/configurator";
import { DataCubeMetadataWithComponentValuesQuery } from "@/graphql/query-hooks";

import forestAreaData from "../test/__fixtures/data/forest-area-by-production-region.json";

import { getInitialConfig } from "./index";

describe("initial config", () => {
  it("should create an initial table config with column order based on dimension order", () => {
    const config = getInitialConfig({
      chartType: "table",
      dimensions: forestAreaData.data.dataCubeByIri.dimensions as NonNullable<
        DataCubeMetadataWithComponentValuesQuery["dataCubeByIri"]
      >["dimensions"],
      measures: forestAreaData.data.dataCubeByIri.measures as NonNullable<
        DataCubeMetadataWithComponentValuesQuery["dataCubeByIri"]
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
