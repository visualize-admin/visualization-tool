import {
  InteractiveFiltersConfig,
  ScatterPlotConfig,
  ScatterPlotFields,
} from "@/configurator";
import { Component, Dimension, Measure } from "@/domain/data";
import { CHART_CONFIG_VERSION } from "@/utils/chart-config/constants";

export const interactiveFiltersConfig: InteractiveFiltersConfig = {
  legend: {
    active: true,
    componentId: "",
  },
  timeRange: {
    active: false,
    componentId: "",
    presets: { type: "range", from: "", to: "" },
  },
  dataFilters: {
    active: false,
    componentIds: [],
  },
  calculation: {
    active: false,
    type: "identity",
  },
};

export const scatterplotFields: ScatterPlotFields = {
  x: {
    componentId:
      "http://environment.ld.admin.ch/foen/px/0703010000_103/measure/0",
  },
  y: {
    componentId:
      "http://environment.ld.admin.ch/foen/px/0703010000_103/measure/1",
  },
  color: {
    type: "segment",
    paletteId: "category10",
    colorMapping: {
      "http://environment.ld.admin.ch/foen/px/0703010000_103/dimension/1/0":
        "#1f77b4",
      "http://environment.ld.admin.ch/foen/px/0703010000_103/dimension/1/1":
        "#ff7f0e",
      "http://environment.ld.admin.ch/foen/px/0703010000_103/dimension/1/2":
        "#2ca02c",
      "http://environment.ld.admin.ch/foen/px/0703010000_103/dimension/1/3":
        "#d62728",
      "http://environment.ld.admin.ch/foen/px/0703010000_103/dimension/1/4":
        "#9467bd",
      "http://environment.ld.admin.ch/foen/px/0703010000_103/dimension/1/5":
        "#8c564b",
    },
  },
  segment: {
    componentId:
      "http://environment.ld.admin.ch/foen/px/0703010000_103/dimension/1",
    showValuesMapping: {},
  },
};

export const chartConfig: ScatterPlotConfig = {
  key: "scatterplot",
  version: CHART_CONFIG_VERSION,
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
  cubes: [{ iri: "", filters: {} }],
  limits: {},
  chartType: "scatterplot",
  interactiveFiltersConfig,
  fields: scatterplotFields,
  activeField: undefined,
};

export const scatterplotMeasures: Measure[] = [
  {
    id: "http://environment.ld.admin.ch/foen/px/0703010000_103/measure/0",
    label: "Anzahl Betriebe",
    __typename: "NumericalMeasure",
  },
  {
    id: "http://environment.ld.admin.ch/foen/px/0703010000_103/measure/1",
    label: "Anzahl Waldeigentümer",
    __typename: "NumericalMeasure",
  },
  {
    id: "http://environment.ld.admin.ch/foen/px/0703010000_103/measure/2",
    label: "Gesamte Waldflächen in ha",
    __typename: "NumericalMeasure",
  },
  {
    id: "http://environment.ld.admin.ch/foen/px/0703010000_103/measure/3",
    label: "Produktive Waldflächen in ha",
    __typename: "NumericalMeasure",
  },
  {
    id: "http://environment.ld.admin.ch/foen/px/0703010000_103/measure/4",
    label: "Zertifizierte Waldflächen in ha",
    __typename: "NumericalMeasure",
  },
  {
    id: "http://environment.ld.admin.ch/foen/px/0703010000_103/measure/5",
    label: "Bundeswälder in ha",
    __typename: "NumericalMeasure",
  },
  {
    id: "http://environment.ld.admin.ch/foen/px/0703010000_103/measure/6",
    label: "Staatswälder in ha",
    __typename: "NumericalMeasure",
  },
  {
    id: "http://environment.ld.admin.ch/foen/px/0703010000_103/measure/7",
    label: "Wälder der politischen Gemeinden in ha",
    __typename: "NumericalMeasure",
  },
  {
    id: "http://environment.ld.admin.ch/foen/px/0703010000_103/measure/8",
    label: "Bürgerwälder in ha",
    __typename: "NumericalMeasure",
  },
  {
    id: "http://environment.ld.admin.ch/foen/px/0703010000_103/measure/9",
    label: "Korporationswälder in ha",
    __typename: "NumericalMeasure",
  },
  {
    id: "http://environment.ld.admin.ch/foen/px/0703010000_103/measure/10",
    label: "Übrige Wälder in ha",
    __typename: "NumericalMeasure",
  },
  {
    id: "http://environment.ld.admin.ch/foen/px/0703010000_103/measure/11",
    label: "Holzproduktion Total in m3",
    __typename: "NumericalMeasure",
  },
  {
    id: "http://environment.ld.admin.ch/foen/px/0703010000_103/measure/12",
    label: "Stammholz in m3",
    __typename: "NumericalMeasure",
  },
  {
    id: "http://environment.ld.admin.ch/foen/px/0703010000_103/measure/13",
    label: "Industrieholz in m3",
    __typename: "NumericalMeasure",
  },
  {
    id: "http://environment.ld.admin.ch/foen/px/0703010000_103/measure/14",
    label: "Energieholz in m3",
    __typename: "NumericalMeasure",
  },
  {
    id: "http://environment.ld.admin.ch/foen/px/0703010000_103/measure/15",
    label: "Übrige Sortimente in m3",
    __typename: "NumericalMeasure",
  },
] as Measure[];

/* @ts-ignore */
export const scatterplotDimensions: Dimension[] = [
  {
    id: "http://environment.ld.admin.ch/foen/px/0703010000_103/dimension/0",
    label: "Jahr",
    cubeIri: "https://cube",
    values: [
      { value: "2004", label: "2004", __typename: "DimensionValue" },
      { value: "2005", label: "2005", __typename: "DimensionValue" },
      { value: "2006", label: "2006", __typename: "DimensionValue" },
      { value: "2007", label: "2007", __typename: "DimensionValue" },
      { value: "2008", label: "2008", __typename: "DimensionValue" },
      { value: "2009", label: "2009", __typename: "DimensionValue" },
      { value: "2010", label: "2010", __typename: "DimensionValue" },
      { value: "2011", label: "2011", __typename: "DimensionValue" },
      { value: "2012", label: "2012", __typename: "DimensionValue" },
      { value: "2013", label: "2013", __typename: "DimensionValue" },
      { value: "2014", label: "2014", __typename: "DimensionValue" },
    ],
    __typename: "TemporalDimension",
  },
  {
    id: "http://environment.ld.admin.ch/foen/px/0703010000_103/dimension/1",
    label: "Forstzone",
    cubeIri: "https://cube",
    values: [
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_103/dimension/1/0",
        label: "Schweiz",
        __typename: "DimensionValue",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_103/dimension/1/1",
        label: "Jura",
        __typename: "DimensionValue",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_103/dimension/1/2",
        label: "Mittelland",
        __typename: "DimensionValue",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_103/dimension/1/3",
        label: "Voralpen",
        __typename: "DimensionValue",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_103/dimension/1/4",
        label: "Alpen",
        __typename: "DimensionValue",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_103/dimension/1/5",
        label: "Alpen-Südseite",
        __typename: "DimensionValue",
      },
    ],
    __typename: "NominalDimension",
  },
  {
    id: "http://environment.ld.admin.ch/foen/px/0703010000_103/dimension/2",
    label: "Kanton",
    cubeIri: "https://cube",
    values: [
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_103/dimension/2/0",
        label: "Schweiz",
        __typename: "DimensionValue",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_103/dimension/2/1",
        label: "Zürich",
        __typename: "DimensionValue",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_103/dimension/2/2",
        label: "Bern / Berne",
        __typename: "DimensionValue",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_103/dimension/2/3",
        label: "Luzern",
        __typename: "DimensionValue",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_103/dimension/2/4",
        label: "Uri",
        __typename: "DimensionValue",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_103/dimension/2/5",
        label: "Schwyz",
        __typename: "DimensionValue",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_103/dimension/2/6",
        label: "Obwalden",
        __typename: "DimensionValue",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_103/dimension/2/7",
        label: "Nidwalden",
        __typename: "DimensionValue",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_103/dimension/2/8",
        label: "Glarus",
        __typename: "DimensionValue",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_103/dimension/2/9",
        label: "Zug",
        __typename: "DimensionValue",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_103/dimension/2/10",
        label: "Fribourg / Freiburg",
        __typename: "DimensionValue",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_103/dimension/2/11",
        label: "Solothurn",
        __typename: "DimensionValue",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_103/dimension/2/12",
        label: "Basel-Stadt",
        __typename: "DimensionValue",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_103/dimension/2/13",
        label: "Basel-Landschaft",
        __typename: "DimensionValue",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_103/dimension/2/14",
        label: "Schaffhausen",
        __typename: "DimensionValue",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_103/dimension/2/15",
        label: "Appenzell Ausserrhoden",
        __typename: "DimensionValue",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_103/dimension/2/16",
        label: "Appenzell Innerrhoden",
        __typename: "DimensionValue",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_103/dimension/2/17",
        label: "St. Gallen",
        __typename: "DimensionValue",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_103/dimension/2/18",
        label: "Graubünden / Grigioni / Grischun",
        __typename: "DimensionValue",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_103/dimension/2/19",
        label: "Aargau",
        __typename: "DimensionValue",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_103/dimension/2/20",
        label: "Thurgau",
        __typename: "DimensionValue",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_103/dimension/2/21",
        label: "Ticino",
        __typename: "DimensionValue",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_103/dimension/2/22",
        label: "Vaud",
        __typename: "DimensionValue",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_103/dimension/2/23",
        label: "Valais / Wallis",
        __typename: "DimensionValue",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_103/dimension/2/24",
        label: "Neuchâtel",
        __typename: "DimensionValue",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_103/dimension/2/25",
        label: "Genève",
        __typename: "DimensionValue",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_103/dimension/2/26",
        label: "Jura",
        __typename: "DimensionValue",
      },
    ],
    __typename: "NominalDimension",
  },
  {
    id: "http://environment.ld.admin.ch/foen/px/0703010000_103/dimension/3",
    label: "Grössenklasse",
    cubeIri: "https://cube",
    values: [
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_103/dimension/3/0",
        label: "Grössenklasse - Total",
        __typename: "DimensionValue",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_103/dimension/3/1",
        label: "< 50 ha",
        __typename: "DimensionValue",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_103/dimension/3/2",
        label: "50 - 100 ha",
        __typename: "DimensionValue",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_103/dimension/3/3",
        label: "101 - 200 ha",
        __typename: "DimensionValue",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_103/dimension/3/4",
        label: "201 - 500 ha",
        __typename: "DimensionValue",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_103/dimension/3/5",
        label: "501 - 1000 ha",
        __typename: "DimensionValue",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_103/dimension/3/6",
        label: "1001 - 5000 ha",
        __typename: "DimensionValue",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_103/dimension/3/7",
        label: "> 5000 ha",
        __typename: "DimensionValue",
      },
    ],
    __typename: "NominalDimension",
  },
] as unknown as Component[];

export const scatterplotObservations = [
  {
    "http://environment.ld.admin.ch/foen/px/0703010000_103/dimension/1":
      "Alpen",
    "http://environment.ld.admin.ch/foen/px/0703010000_103/dimension/3":
      "Grössenklasse - Total",
    "http://environment.ld.admin.ch/foen/px/0703010000_103/dimension/2":
      "Schweiz",
    "http://environment.ld.admin.ch/foen/px/0703010000_103/measure/1": 1086,
    "http://environment.ld.admin.ch/foen/px/0703010000_103/measure/0": 390,
    "http://environment.ld.admin.ch/foen/px/0703010000_103/dimension/0": "2004",
  },
  {
    "http://environment.ld.admin.ch/foen/px/0703010000_103/dimension/1":
      "Alpen-Südseite",
    "http://environment.ld.admin.ch/foen/px/0703010000_103/dimension/3":
      "Grössenklasse - Total",
    "http://environment.ld.admin.ch/foen/px/0703010000_103/dimension/2":
      "Schweiz",
    "http://environment.ld.admin.ch/foen/px/0703010000_103/measure/1": 379,
    "http://environment.ld.admin.ch/foen/px/0703010000_103/measure/0": 366,
    "http://environment.ld.admin.ch/foen/px/0703010000_103/dimension/0": "2004",
  },
  {
    "http://environment.ld.admin.ch/foen/px/0703010000_103/dimension/1": "Jura",
    "http://environment.ld.admin.ch/foen/px/0703010000_103/dimension/3":
      "Grössenklasse - Total",
    "http://environment.ld.admin.ch/foen/px/0703010000_103/dimension/2":
      "Schweiz",
    "http://environment.ld.admin.ch/foen/px/0703010000_103/measure/1": 988,
    "http://environment.ld.admin.ch/foen/px/0703010000_103/measure/0": 409,
    "http://environment.ld.admin.ch/foen/px/0703010000_103/dimension/0": "2004",
  },
  {
    "http://environment.ld.admin.ch/foen/px/0703010000_103/dimension/1":
      "Mittelland",
    "http://environment.ld.admin.ch/foen/px/0703010000_103/dimension/3":
      "Grössenklasse - Total",
    "http://environment.ld.admin.ch/foen/px/0703010000_103/dimension/2":
      "Schweiz",
    "http://environment.ld.admin.ch/foen/px/0703010000_103/measure/1": 1507,
    "http://environment.ld.admin.ch/foen/px/0703010000_103/measure/0": 1266,
    "http://environment.ld.admin.ch/foen/px/0703010000_103/dimension/0": "2004",
  },
  {
    "http://environment.ld.admin.ch/foen/px/0703010000_103/dimension/1":
      "Schweiz",
    "http://environment.ld.admin.ch/foen/px/0703010000_103/dimension/3":
      "Grössenklasse - Total",
    "http://environment.ld.admin.ch/foen/px/0703010000_103/dimension/2":
      "Schweiz",
    "http://environment.ld.admin.ch/foen/px/0703010000_103/measure/1": 4663,
    "http://environment.ld.admin.ch/foen/px/0703010000_103/measure/0": 3040,
    "http://environment.ld.admin.ch/foen/px/0703010000_103/dimension/0": "2004",
  },
  {
    "http://environment.ld.admin.ch/foen/px/0703010000_103/dimension/1":
      "Voralpen",
    "http://environment.ld.admin.ch/foen/px/0703010000_103/dimension/3":
      "Grössenklasse - Total",
    "http://environment.ld.admin.ch/foen/px/0703010000_103/dimension/2":
      "Schweiz",
    "http://environment.ld.admin.ch/foen/px/0703010000_103/measure/1": 703,
    "http://environment.ld.admin.ch/foen/px/0703010000_103/measure/0": 609,
    "http://environment.ld.admin.ch/foen/px/0703010000_103/dimension/0": "2004",
  },
];
