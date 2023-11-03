import { ColumnConfig, TableFields } from "@/configurator";
import { ComponentsQuery } from "@/graphql/query-hooks";
import { DataCubeMetadata } from "@/graphql/types";

import bathingWaterData from "../test/__fixtures/data/DataCubeMetadataWithComponentValues-bathingWater.json";
import forestAreaData from "../test/__fixtures/data/forest-area-by-production-region.json";

import {
  getChartConfigAdjustedToChartType,
  getInitialConfig,
  getPossibleChartTypes,
} from "./index";

describe("initial config", () => {
  it("should create an initial table config with column order based on dimension order", () => {
    const config = getInitialConfig({
      chartType: "table",
      dataSet: "https://environment.ld.admin.ch/foen/nfi",
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
    const possibleChartTypes = getPossibleChartTypes({
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
    const possibleChartTypes = getPossibleChartTypes({
      dimensions: [],
      measures: [{ __typename: "NumericalMeasure" }] as any,
    });

    expect(possibleChartTypes).toEqual(["table"]);
  });

  it("should only allow column, map, pie and table if only geo dimensions are available", () => {
    const possibleChartTypes = getPossibleChartTypes({
      dimensions: [{ __typename: "GeoShapesDimension" }] as any,
      measures: [{ __typename: "NumericalMeasure" }] as any,
    }).sort();

    expect(possibleChartTypes).toEqual(["column", "map", "pie", "table"]);
  });

  it("should not allow multiline chart if there are no several measures of the same unit", () => {
    const possibleChartTypes = getPossibleChartTypes({
      dimensions: [],
      measures: [
        { __typename: "NumericalMeasure", unit: "m" },
        { __typename: "NumericalMeasure", unit: "cm" },
      ] as any,
    });

    expect(possibleChartTypes).not.toContain("comboLineSingle");
  });
});

describe("chart type switch", () => {
  it("should correctly remove non-allowed interactive data filters", () => {
    const chartConfig: ColumnConfig = {
      key: "column",
      version: "1.4.0",
      chartType: "column",
      dataSet: "https://environment.ld.admin.ch/foen/ubd0104",
      filters: {},
      meta: {
        title: {
          en: "",
          de: "",
          fr: "",
          it: "",
        },
        description: {
          en: "",
          de: "",
          fr: "",
          it: "",
        },
      },
      fields: {
        x: {
          componentIri:
            "https://environment.ld.admin.ch/foen/ubd0104/parametertype",
        },
        y: {
          componentIri: "https://environment.ld.admin.ch/foen/ubd0104/value",
        },
      },
      interactiveFiltersConfig: {
        legend: {
          active: false,
          componentIri: "",
        },
        timeRange: {
          active: false,
          componentIri: "",
          presets: {
            type: "range",
            from: "",
            to: "",
          },
        },
        dataFilters: {
          active: true,
          componentIris: [
            "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing",
          ],
        },
        calculation: {
          active: false,
          type: "identity",
        },
      },
      activeField: undefined,
    };
    const newConfig = getChartConfigAdjustedToChartType({
      chartConfig,
      newChartType: "line",
      dimensions: bathingWaterData.data.dataCubeByIri
        .dimensions as DataCubeMetadata["dimensions"],
      measures: bathingWaterData.data.dataCubeByIri
        .measures as DataCubeMetadata["measures"],
    });

    expect(newConfig.interactiveFiltersConfig?.dataFilters.active).toEqual(
      false
    );
    expect(
      newConfig.interactiveFiltersConfig?.dataFilters.componentIris
    ).toEqual([]);
  });
});
