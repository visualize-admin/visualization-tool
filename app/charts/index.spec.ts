import { ColumnConfig, ScatterPlotConfig, TableFields } from "@/configurator";
import { Dimension, Measure } from "@/domain/data";
import { TimeUnit } from "@/graphql/resolver-types";

import bathingWaterData from "../test/__fixtures/data/DataCubeMetadataWithComponentValues-bathingWater.json";
import forestAreaData from "../test/__fixtures/data/forest-area-by-production-region.json";

import {
  getChartConfigAdjustedToChartType,
  getInitialConfig,
  getPossibleChartTypes,
} from "./index";

jest.mock("../rdf/extended-cube", () => ({
  ExtendedCube: jest.fn(),
}));

const mockDimensions: Record<string, Dimension> = {
  geoCoordinates: {
    __typename: "GeoCoordinatesDimension",
    cubeIri: "https://cube-iri",
    isKeyDimension: true,
    values: [],
    iri: "geo-coordinates-dimension-iri",
    isNumerical: false,
    label: "Geo coordinates dimension",
  },
  ordinal: {
    __typename: "OrdinalDimension",
    cubeIri: "https://cube-iri",
    isKeyDimension: true,
    values: [],
    iri: "ordinal-dimension-iri",
    isNumerical: true,
    label: "Ordinal dimension",
  },
  temporal: {
    __typename: "TemporalDimension",
    cubeIri: "https://cube-iri",
    isKeyDimension: true,
    values: [],
    timeFormat: "%Y",
    timeUnit: TimeUnit.Year,
    iri: "temporal-dimension-iri",
    isNumerical: true,
    label: "Temporal dimension",
  },
  temporalOrdinal: {
    __typename: "TemporalOrdinalDimension",
    cubeIri: "https://cube-iri",
    isKeyDimension: true,
    values: [],
    iri: "temporal-ordinal-dimension-iri",
    isNumerical: true,
    label: "Temporal ordinal dimension",
  },
  ordinal2: {
    __typename: "OrdinalDimension",
    cubeIri: "https://cube-iri",
    isKeyDimension: true,
    values: [],
    iri: "ordinal-dimension-2-iri",
    isNumerical: false,
    label: "Ordinal dimension 2",
  },
};

describe("initial config", () => {
  it("should create an initial table config with column order based on dimension order", () => {
    const config = getInitialConfig({
      chartType: "table",
      iris: [
        {
          iri: "https://environment.ld.admin.ch/foen/nfi",
          publishIri: "https://environment.ld.admin.ch/foen/nfi",
        },
      ],
      dimensions: forestAreaData.data.dataCubeByIri
        .dimensions as any as Dimension[],
      measures: forestAreaData.data.dataCubeByIri.measures as any as Measure[],
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

  it("should create an initial column config having x axis correctly inferred (temporal ordinal)", () => {
    const config = getInitialConfig({
      chartType: "column",
      iris: [
        {
          iri: "https://environment.ld.admin.ch/foen/nfi",
          publishIri: "https://environment.ld.admin.ch/foen/nfi",
        },
      ],
      dimensions: [
        mockDimensions.geoCoordinates,
        mockDimensions.ordinal,
        mockDimensions.temporalOrdinal,
        mockDimensions.ordinal2,
      ],
      measures: forestAreaData.data.dataCubeByIri.measures as any as Measure[],
    }) as ColumnConfig;

    expect(config.fields.x.componentIri).toEqual(
      "temporal-ordinal-dimension-iri"
    );
  });

  it("should create an initial column config having x axis correctly inferred (temporal > temporal ordinal)", () => {
    const config = getInitialConfig({
      chartType: "column",
      iris: [
        {
          iri: "https://environment.ld.admin.ch/foen/nfi",
          publishIri: "https://environment.ld.admin.ch/foen/nfi",
        },
      ],
      dimensions: [
        mockDimensions.geoCoordinates,
        mockDimensions.ordinal,
        mockDimensions.temporalOrdinal,
        mockDimensions.temporal,
        mockDimensions.ordinal2,
      ],
      measures: forestAreaData.data.dataCubeByIri.measures as any as Measure[],
    }) as ColumnConfig;

    expect(config.fields.x.componentIri).toEqual("temporal-dimension-iri");
  });

  it("should create an initial scatterplot config having segment correctly defined", () => {
    const config = getInitialConfig({
      chartType: "scatterplot",
      iris: [
        {
          iri: "https://environment.ld.admin.ch/foen/nfi",
          publishIri: "https://environment.ld.admin.ch/foen/nfi",
        },
      ],
      dimensions: [
        mockDimensions.geoCoordinates,
        mockDimensions.ordinal,
        mockDimensions.temporalOrdinal,
        mockDimensions.temporal,
        mockDimensions.ordinal2,
      ],
      measures: forestAreaData.data.dataCubeByIri.measures as any as Measure[],
    }) as ColumnConfig;

    expect(config.fields.segment).toBeDefined();
    expect((config.fields as any).palette).toBeUndefined();
  });
});

describe("possible chart types", () => {
  it("should allow appropriate chart types based on available dimensions", () => {
    const expectedChartTypes = ["area", "column", "line", "pie", "table"];
    const possibleChartTypes = getPossibleChartTypes({
      dimensions: bathingWaterData.data.dataCubeByIri
        .dimensions as any as Dimension[],
      measures: bathingWaterData.data.dataCubeByIri
        .measures as any as Measure[],
      cubeCount: 1,
    }).sort();

    expect(possibleChartTypes).toEqual(expectedChartTypes);
  });

  it("should only allow table if there are only measures available", () => {
    const possibleChartTypes = getPossibleChartTypes({
      dimensions: [],
      measures: [{ __typename: "NumericalMeasure" }] as any,
      cubeCount: 1,
    });

    expect(possibleChartTypes).toEqual(["table"]);
  });

  it("should only allow column, map, pie and table if only geo dimensions are available", () => {
    const possibleChartTypes = getPossibleChartTypes({
      dimensions: [{ __typename: "GeoShapesDimension" }] as any,
      measures: [{ __typename: "NumericalMeasure" }] as any,
      cubeCount: 1,
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
      cubeCount: 1,
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
      cubes: [
        {
          iri: "https://environment.ld.admin.ch/foen/ubd0104",
          publishIri: "https://environment.ld.admin.ch/foen/ubd0104",
          filters: {},
        },
      ],
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
        label: {
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
        .dimensions as any as Dimension[],
      measures: bathingWaterData.data.dataCubeByIri.measures as Measure[],
    });

    expect(newConfig.interactiveFiltersConfig?.dataFilters.active).toEqual(
      false
    );
    expect(
      newConfig.interactiveFiltersConfig?.dataFilters.componentIris
    ).toEqual([]);
  });

  it("should not carry over not-allowed segment", () => {
    const oldChartConfig = {
      key: "Mudrp4YuP8Ki",
      version: "3.0.0",
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
      cubes: [
        {
          iri: "https://environment.ld.admin.ch/foen/ubd000502/4",
          filters: {
            "https://environment.ld.admin.ch/foen/ubd000502/gas": {
              type: "single",
              value: "https://ld.admin.ch/cube/dimension/testdimension/test1",
            },
            "https://environment.ld.admin.ch/foen/ubd000502/sektorid": {
              type: "single",
              value:
                "https://environment.ld.admin.ch/vocabulary/ghg_emission_sectors_co2_ordinance/3",
            },
          },
        },
      ],
      activeField: "segment",
      chartType: "scatterplot",
      interactiveFiltersConfig: {
        legend: {
          active: false,
          componentIri: "",
        },
        timeRange: {
          active: false,
          componentIri: "https://environment.ld.admin.ch/foen/ubd000502/jahr",
          presets: {
            type: "range",
            from: "",
            to: "",
          },
        },
        dataFilters: {
          active: false,
          componentIris: [],
        },
        calculation: {
          active: false,
          type: "identity",
        },
      },
      fields: {
        x: {
          componentIri: "https://environment.ld.admin.ch/foen/ubd000502/werte",
        },
        y: {
          componentIri:
            "https://environment.ld.admin.ch/foen/ubd000502/werteNichtGerundet",
        },
        segment: {
          componentIri: "https://environment.ld.admin.ch/foen/ubd000502/jahr",
          palette: "category10",
          sorting: {
            sortingType: "byAuto",
            sortingOrder: "asc",
          },
          colorMapping: {
            "1990": "#1f77b4",
            "1991": "#ff7f0e",
            "1992": "#2ca02c",
            "1993": "#d62728",
            "1994": "#9467bd",
            "1995": "#8c564b",
            "1996": "#e377c2",
            "1997": "#7f7f7f",
            "1998": "#bcbd22",
            "1999": "#17becf",
            "2000": "#1f77b4",
            "2001": "#ff7f0e",
            "2002": "#2ca02c",
            "2003": "#d62728",
            "2004": "#9467bd",
            "2005": "#8c564b",
            "2006": "#e377c2",
            "2007": "#7f7f7f",
            "2008": "#bcbd22",
            "2009": "#17becf",
            "2010": "#1f77b4",
            "2011": "#ff7f0e",
            "2012": "#2ca02c",
            "2013": "#d62728",
            "2014": "#9467bd",
            "2015": "#8c564b",
            "2016": "#e377c2",
            "2017": "#7f7f7f",
            "2018": "#bcbd22",
            "2019": "#17becf",
            "2020": "#1f77b4",
            "2021": "#ff7f0e",
          },
        },
      },
    } as any as ScatterPlotConfig;

    const newChartConfig = getChartConfigAdjustedToChartType({
      chartConfig: oldChartConfig,
      newChartType: "column",
      dimensions: [
        { iri: "https://environment.ld.admin.ch/foen/ubd000502/jahr" },
        { iri: "https://environment.ld.admin.ch/foen/ubd000502/gas" },
        { iri: "https://environment.ld.admin.ch/foen/ubd000502/sektorid" },
      ] as any as Dimension[],
      measures: [
        {
          __typename: "NumericalMeasure",
          iri: "https://environment.ld.admin.ch/foen/ubd000502/werte",
        },
        {
          __typename: "NumericalMeasure",
          iri: "https://environment.ld.admin.ch/foen/ubd000502/werteNichtGerundet",
        },
      ] as any as Measure[],
    }) as ColumnConfig;

    expect(newChartConfig.fields.segment).toBeUndefined();
    expect(newChartConfig.fields.x.componentIri).not.toEqual(
      oldChartConfig.fields.x.componentIri
    );
  });
});
