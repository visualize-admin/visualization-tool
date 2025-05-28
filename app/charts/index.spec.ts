import { schemeCategory10 } from "d3-scale-chromatic";
import { describe, expect, it } from "vitest";

import {
  getChartConfigAdjustedToChartType,
  getEnabledChartTypes,
  getInitialConfig,
} from "@/charts";
import {
  ColumnConfig,
  ComboLineDualConfig,
  ScatterPlotConfig,
  SegmentColorField,
  TableFields,
} from "@/configurator";
import { Dimension, Measure } from "@/domain/data";
import { stringifyComponentId } from "@/graphql/make-component-id";
import { TimeUnit } from "@/graphql/resolver-types";
import bathingWaterData from "@/test/__fixtures/data/DataCubeMetadataWithComponentValues-bathingWater.json";
import forestAreaData from "@/test/__fixtures/data/forest-area-by-production-region.json";

const mockDimensions: Record<string, Dimension> = {
  geoCoordinates: {
    __typename: "GeoCoordinatesDimension",
    cubeIri: "https://cube-iri",
    id: stringifyComponentId({
      unversionedCubeIri: "https://cube-iri",
      unversionedComponentIri: "geo-coordinates-dimension-iri",
    }),
    isKeyDimension: true,
    values: [],
    relatedLimitValues: [],
    isNumerical: false,
    label: "Geo coordinates dimension",
  },
  ordinal: {
    __typename: "OrdinalDimension",
    cubeIri: "https://cube-iri",
    id: stringifyComponentId({
      unversionedCubeIri: "https://cube-iri",
      unversionedComponentIri: "ordinal-dimension-iri",
    }),
    isKeyDimension: true,
    values: [],
    relatedLimitValues: [],
    isNumerical: true,
    label: "Ordinal dimension",
  },
  temporal: {
    __typename: "TemporalDimension",
    cubeIri: "https://cube-iri",
    id: stringifyComponentId({
      unversionedCubeIri: "https://cube-iri",
      unversionedComponentIri: "temporal-dimension-iri",
    }),
    isKeyDimension: true,
    values: [],
    relatedLimitValues: [],
    timeFormat: "%Y",
    timeUnit: TimeUnit.Year,
    isNumerical: true,
    label: "Temporal dimension",
  },
  temporalOrdinal: {
    __typename: "TemporalOrdinalDimension",
    cubeIri: "https://cube-iri",
    id: stringifyComponentId({
      unversionedCubeIri: "https://cube-iri",
      unversionedComponentIri: "temporal-ordinal-dimension-iri",
    }),
    isKeyDimension: true,
    values: [],
    relatedLimitValues: [],
    isNumerical: true,
    label: "Temporal ordinal dimension",
  },
  ordinal2: {
    __typename: "OrdinalDimension",
    cubeIri: "https://cube-iri",
    id: stringifyComponentId({
      unversionedCubeIri: "https://cube-iri",
      unversionedComponentIri: "ordinal-dimension-2-iri",
    }),
    isKeyDimension: true,
    values: [],
    relatedLimitValues: [],
    isNumerical: false,
    label: "Ordinal dimension 2",
  },
};

describe("initial config", () => {
  it("should create an initial table config with column order based on dimension order", () => {
    const config = getInitialConfig({
      chartType: "table",
      iris: [{ iri: "https://environment.ld.admin.ch/foen/nfi" }],
      dimensions: forestAreaData.data.dataCubeByIri
        .dimensions as any as Dimension[],
      measures: forestAreaData.data.dataCubeByIri.measures as any as Measure[],
    });

    expect(
      Object.values(config.fields as TableFields).map((x) => [
        x["componentId"],
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
      iris: [{ iri: "https://environment.ld.admin.ch/foen/nfi" }],
      dimensions: [
        mockDimensions.geoCoordinates,
        mockDimensions.ordinal,
        mockDimensions.temporalOrdinal,
        mockDimensions.ordinal2,
      ],
      measures: forestAreaData.data.dataCubeByIri.measures as any as Measure[],
    }) as ColumnConfig;

    expect(config.fields.x.componentId).toEqual(
      stringifyComponentId({
        unversionedCubeIri: "https://cube-iri",
        unversionedComponentIri: "temporal-ordinal-dimension-iri",
      })
    );
  });

  it("should create an initial column config having x axis correctly inferred (temporal > temporal ordinal)", () => {
    const config = getInitialConfig({
      chartType: "column",
      iris: [{ iri: "https://environment.ld.admin.ch/foen/nfi" }],
      dimensions: [
        mockDimensions.geoCoordinates,
        mockDimensions.ordinal,
        mockDimensions.temporalOrdinal,
        mockDimensions.temporal,
        mockDimensions.ordinal2,
      ],
      measures: forestAreaData.data.dataCubeByIri.measures as any as Measure[],
    }) as ColumnConfig;

    expect(config.fields.x.componentId).toEqual(
      stringifyComponentId({
        unversionedCubeIri: "https://cube-iri",
        unversionedComponentIri: "temporal-dimension-iri",
      })
    );
  });

  it("should create an initial scatterplot config having segment correctly defined", () => {
    const config = getInitialConfig({
      chartType: "scatterplot",
      iris: [{ iri: "https://environment.ld.admin.ch/foen/nfi" }],
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

describe("enabled chart types", () => {
  it("should allow appropriate chart types based on available dimensions", () => {
    const expectedChartTypes = [
      "area",
      "bar",
      "column",
      "line",
      "pie",
      "table",
    ];
    const { enabledChartTypes, possibleChartTypesDict } = getEnabledChartTypes({
      dimensions: bathingWaterData.data.dataCubeByIri
        .dimensions as any as Dimension[],
      measures: bathingWaterData.data.dataCubeByIri
        .measures as any as Measure[],
      cubeCount: 1,
    });

    expect(enabledChartTypes.sort()).toEqual(expectedChartTypes);
    expect(possibleChartTypesDict["comboLineSingle"].message).toBeDefined();
    expect(possibleChartTypesDict["comboLineDual"].message).toBeDefined();
    expect(possibleChartTypesDict["map"].message).toBeDefined();
  });

  it("should only allow table if there are only measures available", () => {
    const { enabledChartTypes, possibleChartTypesDict } = getEnabledChartTypes({
      dimensions: [],
      measures: [{ __typename: "NumericalMeasure" }] as any,
      cubeCount: 1,
    });

    expect(enabledChartTypes).toEqual(["table"]);
    expect(
      Object.entries(possibleChartTypesDict)
        .filter(([k]) => k !== "table")
        .every(([, { message }]) => !!message)
    ).toBe(true);
  });

  it("should only allow column, bar, map, pie and table if only geo dimensions are available", () => {
    const { enabledChartTypes, possibleChartTypesDict } = getEnabledChartTypes({
      dimensions: [{ __typename: "GeoShapesDimension" }] as any,
      measures: [{ __typename: "NumericalMeasure" }] as any,
      cubeCount: 1,
    });

    expect(enabledChartTypes.sort()).toEqual([
      "bar",
      "column",
      "map",
      "pie",
      "table",
    ]);
    expect(possibleChartTypesDict["line"].message).toBeDefined();
  });

  it("should not allow multiline chart if there are no several measures of the same unit", () => {
    const { enabledChartTypes, possibleChartTypesDict } = getEnabledChartTypes({
      dimensions: [],
      measures: [
        { __typename: "NumericalMeasure", unit: "m" },
        { __typename: "NumericalMeasure", unit: "cm" },
      ] as any,
      cubeCount: 1,
    });

    expect(enabledChartTypes).not.toContain("comboLineSingle");
    expect(possibleChartTypesDict["comboLineSingle"].message).toBeDefined();
  });
});

describe("chart type switch", () => {
  it("should correctly remove non-allowed interactive data filters", () => {
    const chartConfig: ColumnConfig = {
      key: "column",
      version: "1.4.0",
      chartType: "column",
      cubes: [
        { iri: "https://environment.ld.admin.ch/foen/ubd0104", filters: {} },
      ],
      limits: {},
      conversionUnitsByComponentId: {},
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
          componentId:
            "https://environment.ld.admin.ch/foen/ubd0104/parametertype",
        },
        y: {
          componentId: "https://environment.ld.admin.ch/foen/ubd0104/value",
        },
        color: {
          type: "segment",
          paletteId: "category10",
          colorMapping: {},
        },
      },
      interactiveFiltersConfig: {
        legend: {
          active: false,
          componentId: "",
        },
        timeRange: {
          active: false,
          componentId: "",
          presets: {
            type: "range",
            from: "",
            to: "",
          },
        },
        dataFilters: {
          active: true,
          componentIds: [
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

    expect(newConfig.interactiveFiltersConfig.dataFilters.active).toEqual(
      false
    );
    expect(newConfig.interactiveFiltersConfig.dataFilters.componentIds).toEqual(
      []
    );
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
          componentId: "",
        },
        timeRange: {
          active: false,
          componentId: "https://environment.ld.admin.ch/foen/ubd000502/jahr",
          presets: {
            type: "range",
            from: "",
            to: "",
          },
        },
        dataFilters: {
          active: false,
          componentIds: [],
        },
        calculation: {
          active: false,
          type: "identity",
        },
      },
      fields: {
        x: {
          componentId: "https://environment.ld.admin.ch/foen/ubd000502/werte",
        },
        y: {
          componentId:
            "https://environment.ld.admin.ch/foen/ubd000502/werteNichtGerundet",
        },
        color: {
          type: "segment",
          paletteId: "category10",
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
        segment: {
          componentId: "https://environment.ld.admin.ch/foen/ubd000502/jahr",
          sorting: {
            sortingType: "byAuto",
            sortingOrder: "asc",
          },
        },
      },
    } as any as ScatterPlotConfig;

    const newChartConfig = getChartConfigAdjustedToChartType({
      chartConfig: oldChartConfig,
      newChartType: "column",
      dimensions: [
        { id: "https://environment.ld.admin.ch/foen/ubd000502/jahr" },
        { id: "https://environment.ld.admin.ch/foen/ubd000502/gas" },
        { id: "https://environment.ld.admin.ch/foen/ubd000502/sektorid" },
      ] as any as Dimension[],
      measures: [
        {
          __typename: "NumericalMeasure",
          id: "https://environment.ld.admin.ch/foen/ubd000502/werte",
        },
        {
          __typename: "NumericalMeasure",
          id: "https://environment.ld.admin.ch/foen/ubd000502/werteNichtGerundet",
        },
      ] as any as Measure[],
    }) as ColumnConfig;

    expect(newChartConfig.fields.segment).toBeUndefined();
    expect(newChartConfig.fields.x.componentId).not.toEqual(
      oldChartConfig.fields.x.componentId
    );
  });

  it("should carry over colors", () => {
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
      chartType: "line",
      interactiveFiltersConfig: {
        legend: {
          active: false,
          componentId: "",
        },
        timeRange: {
          active: false,
          componentId: "https://environment.ld.admin.ch/foen/ubd000502/jahr",
          presets: {
            type: "range",
            from: "",
            to: "",
          },
        },
        dataFilters: {
          active: false,
          componentIds: [],
        },
        calculation: {
          active: false,
          type: "identity",
        },
      },
      fields: {
        x: {
          componentId: "https://environment.ld.admin.ch/foen/ubd000502/jahr",
        },
        y: {
          componentId:
            "https://environment.ld.admin.ch/foen/ubd000502/werteNichtGerundet",
        },
        color: {
          type: "segment",
          paletteId: "myCustomPaletteId",
          colorMapping: {
            A: "#AAAAAA",
            B: "#BBBBBB",
            C: "#CCCCCC",
          },
        },
        segment: {
          componentId: "https://environment.ld.admin.ch/foen/ubd000502/gas",
          sorting: {
            sortingType: "byAuto",
            sortingOrder: "asc",
          },
        },
      },
    } as any as ScatterPlotConfig;

    const newChartConfig = getChartConfigAdjustedToChartType({
      chartConfig: oldChartConfig,
      newChartType: "column",
      dimensions: [
        { id: "https://environment.ld.admin.ch/foen/ubd000502/jahr" },
        {
          id: "https://environment.ld.admin.ch/foen/ubd000502/gas",
          values: [{ value: "A" }, { value: "B" }, { value: "C" }],
        },
        { id: "https://environment.ld.admin.ch/foen/ubd000502/sektorid" },
      ] as any as Dimension[],
      measures: [
        {
          __typename: "NumericalMeasure",
          id: "https://environment.ld.admin.ch/foen/ubd000502/werte",
        },
        {
          __typename: "NumericalMeasure",
          id: "https://environment.ld.admin.ch/foen/ubd000502/werteNichtGerundet",
        },
      ] as any as Measure[],
    }) as ColumnConfig;

    expect(newChartConfig.fields.color.paletteId).toEqual(
      oldChartConfig.fields.color.paletteId
    );
    expect(newChartConfig.fields.color.type).toEqual("segment");
    expect(
      (newChartConfig.fields.color as SegmentColorField).colorMapping["A"]
    ).toEqual(
      (oldChartConfig.fields.color as SegmentColorField).colorMapping["A"]
    );
  });

  it("should prefer to use components from different cubes if merging cubes, otherwise not", () => {
    const oldChartConfig = {
      chartType: "column",
      cubes: [{ iri: "A" }],
      fields: {
        x: {
          componentId: "A_D1",
        },
        y: {
          componentId: "A_M1",
        },
        color: {
          paletteId: "category10",
          color: schemeCategory10[0],
          type: "single",
        },
      },
    } as any as ColumnConfig;
    const dimensions = [
      { id: "A_D1", cubeIri: "A" },
      { __typename: "TemporalDimension", id: "B_D1", cubeIri: "B" },
    ] as any as Dimension[];
    const measures = [
      { __typename: "NumericalMeasure", id: "A_M1", cubeIri: "A", unit: "X" },
      { __typename: "NumericalMeasure", id: "A_M2", cubeIri: "A", unit: "Y" },
      { __typename: "NumericalMeasure", id: "B_M1", cubeIri: "B", unit: "Z" },
    ] as any as Measure[];

    const newChartConfigMergingOfCubes = getChartConfigAdjustedToChartType({
      chartConfig: oldChartConfig,
      newChartType: "comboLineDual",
      dimensions,
      measures,
      isAddingNewCube: true,
    }) as ComboLineDualConfig;

    expect(
      newChartConfigMergingOfCubes.fields.y.rightAxisComponentId.startsWith("A")
    ).toEqual(true);
    expect(
      newChartConfigMergingOfCubes.fields.y.leftAxisComponentId.startsWith("B")
    ).toEqual(true);

    const newChartConfigNotMergingOfCubes = getChartConfigAdjustedToChartType({
      chartConfig: oldChartConfig,
      newChartType: "comboLineDual",
      dimensions,
      measures,
      isAddingNewCube: false,
    }) as ComboLineDualConfig;

    expect(
      newChartConfigNotMergingOfCubes.fields.y.rightAxisComponentId.startsWith(
        "A"
      )
    ).toEqual(true);
    expect(
      newChartConfigNotMergingOfCubes.fields.y.leftAxisComponentId.startsWith(
        "A"
      )
    ).toEqual(true);
  });
});
