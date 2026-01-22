import mapKeys from "lodash/mapKeys";

import { Dimension, Measure, Observation } from "@/domain/data";
import { DEFAULT_DATA_SOURCE } from "@/domain/data-source";
import { stringifyComponentId } from "@/graphql/make-component-id";
import { CONFIGURATOR_STATE_VERSION } from "@/utils/chart-config/constants";

import { ColumnFields, ConfiguratorState, TableConfig } from "../configurator";
import { TimeUnit } from "../graphql/query-hooks";

export const states: ConfiguratorState[] = [
  {
    state: "SELECTING_DATASET",
    version: CONFIGURATOR_STATE_VERSION,
    dataSource: DEFAULT_DATA_SOURCE,
    chartConfigs: undefined,
    layout: undefined,
    activeChartKey: undefined,
  },
  {
    state: "CONFIGURING_CHART",
    version: CONFIGURATOR_STATE_VERSION,
    dataSource: DEFAULT_DATA_SOURCE,
    layout: {
      type: "tab",
      meta: {
        title: { en: "", de: "", fr: "", it: "" },
        description: { en: "", de: "", fr: "", it: "" },
        label: { en: "", de: "", fr: "", it: "" },
      },
      blocks: [{ type: "chart", key: "column", initialized: true }],
      activeField: undefined,
    },
    chartConfigs: [
      {
        key: "column",
        version: "1.2.1",
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
        annotations: [],
        limits: {},
        conversionUnitsByComponentId: {},
        chartType: "column",
        fields: {
          x: {
            componentId: "foo",
            sorting: { sortingType: "byDimensionLabel", sortingOrder: "asc" },
          },
          y: {
            componentId: "foo",
          },
          color: {
            type: "single",
            paletteId: "oranges",
            color: "#ff7f0e",
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
            active: false,
            componentIds: [],
            defaultValueOverrides: {},
            filterTypes: {},
          },
          calculation: {
            active: false,
            type: "identity",
          },
        },
        activeField: undefined,
      },
    ],
    activeChartKey: "column",
    dashboardFilters: {
      timeRange: {
        active: false,
        timeUnit: "",
        presets: {
          from: "",
          to: "",
        },
      },
      dataFilters: {
        componentIds: [],
        filters: {},
      },
    },
  },
];

export const observations: Observation[] = [
  {
    "http://environment.ld.admin.ch/foen/px/0703030000_124/dimension/1":
      "Schweiz",
    "http://environment.ld.admin.ch/foen/px/0703030000_124/dimension/2":
      "Schweiz",
    "http://environment.ld.admin.ch/foen/px/0703030000_124/measure/0": 27186645,
    "http://environment.ld.admin.ch/foen/px/0703030000_124/dimension/0": "2015",
  },
  {
    "http://environment.ld.admin.ch/foen/px/0703030000_124/dimension/1":
      "Schweiz",
    "http://environment.ld.admin.ch/foen/px/0703030000_124/dimension/2":
      "Schweiz",
    "http://environment.ld.admin.ch/foen/px/0703030000_124/measure/0": 30965437,
    "http://environment.ld.admin.ch/foen/px/0703030000_124/dimension/0": "2016",
  },
  {
    "http://environment.ld.admin.ch/foen/px/0703030000_124/dimension/1":
      "Schweiz",
    "http://environment.ld.admin.ch/foen/px/0703030000_124/dimension/2":
      "Schweiz",
    "http://environment.ld.admin.ch/foen/px/0703030000_124/measure/0": 29636529,
    "http://environment.ld.admin.ch/foen/px/0703030000_124/dimension/0": "2017",
  },
  {
    "http://environment.ld.admin.ch/foen/px/0703030000_124/dimension/1":
      "Schweiz",
    "http://environment.ld.admin.ch/foen/px/0703030000_124/dimension/2":
      "Schweiz",
    "http://environment.ld.admin.ch/foen/px/0703030000_124/measure/0": 25893434,
    "http://environment.ld.admin.ch/foen/px/0703030000_124/dimension/0": "2018",
  },
].map((observation) =>
  mapKeys(observation, (_, k) =>
    stringifyComponentId({
      unversionedCubeIri:
        "http://environment.ld.admin.ch/foen/px/0703030000_124",
      unversionedComponentIri: k,
    })
  )
);

export const fields: ColumnFields = {
  x: {
    componentId: stringifyComponentId({
      unversionedCubeIri:
        "http://environment.ld.admin.ch/foen/px/0703030000_124",
      unversionedComponentIri:
        "http://environment.ld.admin.ch/foen/px/0703030000_124/dimension/0",
    }),
    sorting: { sortingType: "byDimensionLabel", sortingOrder: "asc" },
  },
  y: {
    componentId: stringifyComponentId({
      unversionedCubeIri:
        "http://environment.ld.admin.ch/foen/px/0703030000_124",
      unversionedComponentIri:
        "http://environment.ld.admin.ch/foen/px/0703030000_124/measure/0",
    }),
  },
  color: {
    type: "single",
    paletteId: "oranges",
    color: "#ff7f0e",
  },
};

export const dimensions: Dimension[] = [
  {
    cubeIri: "http://environment.ld.admin.ch/foen/px/0703030000_124",
    id: stringifyComponentId({
      unversionedCubeIri:
        "http://environment.ld.admin.ch/foen/px/0703030000_124",
      unversionedComponentIri:
        "http://environment.ld.admin.ch/foen/px/0703030000_124/dimension/0",
    }),
    label: "Jahr",
    __typename: "TemporalDimension",
    timeUnit: TimeUnit.Year,
    timeFormat: "%Y",
    isNumerical: false,
    isKeyDimension: true,
    values: [
      { value: "2000", label: "2000" },
      { value: "2020", label: "2020" },
    ],
    relatedLimitValues: [],
  },
  {
    cubeIri: "http://environment.ld.admin.ch/foen/px/0703030000_124",
    id: stringifyComponentId({
      unversionedCubeIri:
        "http://environment.ld.admin.ch/foen/px/0703030000_124",
      unversionedComponentIri:
        "http://environment.ld.admin.ch/foen/px/0703030000_124/dimension/1",
    }),
    label: "Kanton",
    __typename: "NominalDimension",
    isNumerical: false,
    isKeyDimension: true,
    values: [],
    relatedLimitValues: [],
  },
  {
    cubeIri: "http://environment.ld.admin.ch/foen/px/0703030000_124",
    id: stringifyComponentId({
      unversionedCubeIri:
        "http://environment.ld.admin.ch/foen/px/0703030000_124",
      unversionedComponentIri:
        "http://environment.ld.admin.ch/foen/px/0703030000_124/dimension/2",
    }),
    label: "Forstzone",
    __typename: "NominalDimension",
    isNumerical: false,
    isKeyDimension: false,
    values: [],
    relatedLimitValues: [],
  },
];

export const measures: Measure[] = [
  {
    cubeIri: "http://environment.ld.admin.ch/foen/px/0703030000_124",
    id: stringifyComponentId({
      unversionedCubeIri:
        "http://environment.ld.admin.ch/foen/px/0703030000_124",
      unversionedComponentIri:
        "http://environment.ld.admin.ch/foen/px/0703030000_124/measure/0",
    }),
    label: "Investitionen: Einnahmen - Total",
    __typename: "NumericalMeasure",
    isNumerical: true,
    isKeyDimension: false,
    values: [],
    relatedLimitValues: [],
    limits: [],
  },
  {
    cubeIri: "http://environment.ld.admin.ch/foen/px/0703030000_124",
    id: stringifyComponentId({
      unversionedCubeIri:
        "http://environment.ld.admin.ch/foen/px/0703030000_124",
      unversionedComponentIri:
        "http://environment.ld.admin.ch/foen/px/0703030000_124/measure/1",
    }),
    label: "Investitionen: Einnahmen aus Beiträgen Bund und Kantone",
    __typename: "NumericalMeasure",
    isNumerical: true,
    isKeyDimension: false,
    values: [],
    relatedLimitValues: [],
    limits: [],
  },
  {
    cubeIri: "http://environment.ld.admin.ch/foen/px/0703030000_124",
    id: stringifyComponentId({
      unversionedCubeIri:
        "http://environment.ld.admin.ch/foen/px/0703030000_124",
      unversionedComponentIri:
        "http://environment.ld.admin.ch/foen/px/0703030000_124/measure/2",
    }),
    label: "Investitionen: Einnahmen aus Beiträgen von Gemeinden und Dritten",
    __typename: "NumericalMeasure",
    isNumerical: true,
    isKeyDimension: false,
    values: [],
    relatedLimitValues: [],
    limits: [],
  },
  {
    cubeIri: "http://environment.ld.admin.ch/foen/px/0703030000_124",
    id: stringifyComponentId({
      unversionedCubeIri:
        "http://environment.ld.admin.ch/foen/px/0703030000_124",
      unversionedComponentIri:
        "http://environment.ld.admin.ch/foen/px/0703030000_124/measure/3",
    }),
    label: "Investitionen: übrige Einnahmen",
    __typename: "NumericalMeasure",
    isNumerical: true,
    isKeyDimension: false,
    values: [],
    relatedLimitValues: [],
    limits: [],
  },
  {
    cubeIri: "http://environment.ld.admin.ch/foen/px/0703030000_124",
    id: stringifyComponentId({
      unversionedCubeIri:
        "http://environment.ld.admin.ch/foen/px/0703030000_124",
      unversionedComponentIri:
        "http://environment.ld.admin.ch/foen/px/0703030000_124/measure/4",
    }),
    label: "Investitionen - Total",
    __typename: "NumericalMeasure",
    isNumerical: true,
    isKeyDimension: false,
    values: [],
    relatedLimitValues: [],
    limits: [],
  },
  {
    cubeIri: "http://environment.ld.admin.ch/foen/px/0703030000_124",
    id: stringifyComponentId({
      unversionedCubeIri:
        "http://environment.ld.admin.ch/foen/px/0703030000_124",
      unversionedComponentIri:
        "http://environment.ld.admin.ch/foen/px/0703030000_124/measure/5",
    }),
    label: "Investitionen für Wirtschaftsgebäude",
    __typename: "NumericalMeasure",
    isNumerical: true,
    isKeyDimension: false,
    values: [],
    relatedLimitValues: [],
    limits: [],
  },
  {
    cubeIri: "http://environment.ld.admin.ch/foen/px/0703030000_124",
    id: stringifyComponentId({
      unversionedCubeIri:
        "http://environment.ld.admin.ch/foen/px/0703030000_124",
      unversionedComponentIri:
        "http://environment.ld.admin.ch/foen/px/0703030000_124/measure/6",
    }),
    label: "Investitionen für Maschinen",
    __typename: "NumericalMeasure",
    isNumerical: true,
    isKeyDimension: false,
    values: [],
    relatedLimitValues: [],
    limits: [],
  },
  {
    cubeIri: "http://environment.ld.admin.ch/foen/px/0703030000_124",
    id: stringifyComponentId({
      unversionedCubeIri:
        "http://environment.ld.admin.ch/foen/px/0703030000_124",
      unversionedComponentIri:
        "http://environment.ld.admin.ch/foen/px/0703030000_124/measure/7",
    }),
    label: "Übrige Ausgaben für Investitionen",
    __typename: "NumericalMeasure",
    isNumerical: true,
    isKeyDimension: false,
    values: [],
    relatedLimitValues: [],
    limits: [],
  },
  {
    cubeIri: "http://environment.ld.admin.ch/foen/px/0703030000_124",
    id: stringifyComponentId({
      unversionedCubeIri:
        "http://environment.ld.admin.ch/foen/px/0703030000_124",
      unversionedComponentIri:
        "http://environment.ld.admin.ch/foen/px/0703030000_124/measure/8",
    }),
    label: "Investitionen für Erschliessungsanlagen",
    __typename: "NumericalMeasure",
    isNumerical: true,
    isKeyDimension: false,
    values: [],
    relatedLimitValues: [],
    limits: [],
  },
  {
    cubeIri: "http://environment.ld.admin.ch/foen/px/0703030000_124",
    id: stringifyComponentId({
      unversionedCubeIri:
        "http://environment.ld.admin.ch/foen/px/0703030000_124",
      unversionedComponentIri:
        "http://environment.ld.admin.ch/foen/px/0703030000_124/measure/9",
    }),
    label: "Netto-Investitionen",
    __typename: "NumericalMeasure",
    isNumerical: true,
    isKeyDimension: false,
    values: [],
    relatedLimitValues: [],
    limits: [],
  },
];

export const margins = {
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
};

export const tableObservations = [
  {
    "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/6": 0,
    "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/5": 0,
    "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/4": 0,
    "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/4":
      "Steuerhoheit - Total",
    "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/3": 0,
    "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/3":
      "250 - 499 ha",
    "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/2": 0,
    "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/2":
      "Aargau",
    "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/1": 0,
    "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/1":
      "Alpen-Südseite",
    "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/0": 0,
    "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/0": "2018",
    "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/8": 0,
    "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/7": 0,
  },
  {
    "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/6": 2707,
    "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/5": 16959,
    "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/4": 37608,
    "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/4":
      "Steuerhoheit - Total",
    "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/3": 4789,
    "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/3":
      "250 - 499 ha",
    "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/2": 4882,
    "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/2":
      "Zürich",
    "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/1": 28,
    "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/1":
      "Schweiz",
    "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/0": 14,
    "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/0": "2015",
    "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/8": 72,
    "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/7": 17870,
  },
  {
    "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/6": 0,
    "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/5": 0,
    "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/4": 0,
    "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/4":
      "Steuerhoheit - Total",
    "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/3": 0,
    "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/3":
      "250 - 499 ha",
    "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/2": 0,
    "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/2":
      "Aargau",
    "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/1": 0,
    "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/1":
      "Voralpen",
    "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/0": 0,
    "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/0": "2018",
    "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/8": 0,
    "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/7": 0,
  },
  {
    "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/6": 0,
    "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/5": 0,
    "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/4": 0,
    "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/4":
      "Steuerhoheit - Total",
    "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/3": 0,
    "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/3":
      "250 - 499 ha",
    "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/2": 0,
    "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/2":
      "Valais / Wallis",
    "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/1": 0,
    "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/1":
      "Alpen-Südseite",
    "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/0": 0,
    "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/0": "2016",
    "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/8": 0,
    "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/7": 0,
  },
  {
    "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/6": 15398,
    "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/5": 47175,
    "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/4": 91021,
    "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/4":
      "Steuerhoheit - Total",
    "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/3": 13118,
    "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/3":
      "250 - 499 ha",
    "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/2": 17068,
    "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/2":
      "Bern / Berne",
    "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/1": 44,
    "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/1":
      "Schweiz",
    "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/0": 37,
    "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/0": "2017",
    "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/8": 128,
    "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/7": 28320,
  },
  {
    "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/6": 0,
    "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/5": 0,
    "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/4": 0,
    "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/4":
      "Steuerhoheit - Total",
    "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/3": 0,
    "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/3":
      "250 - 499 ha",
    "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/2": 0,
    "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/2":
      "Graubünden / Grigioni / Grischun",
    "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/1": 0,
    "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/1":
      "Voralpen",
    "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/0": 0,
    "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/0": "2016",
    "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/8": 0,
    "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/7": 0,
  },
  {
    "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/6": 0,
    "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/5": 0,
    "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/4": 0,
    "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/4":
      "Steuerhoheit - Total",
    "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/3": 0,
    "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/3":
      "250 - 499 ha",
    "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/2": 0,
    "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/2":
      "Basel-Stadt",
    "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/1": 0,
    "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/1":
      "Voralpen",
    "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/0": 0,
    "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/0": "2015",
    "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/8": 0,
    "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/7": 0,
  },
  {
    "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/6": 820,
    "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/5": 380,
    "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/4": 1930,
    "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/4":
      "Steuerhoheit - Total",
    "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/3": 295,
    "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/3":
      "250 - 499 ha",
    "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/2": 295,
    "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/2":
      "Basel-Stadt",
    "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/1": 3,
    "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/1":
      "Schweiz",
    "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/0": 1,
    "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/0": "2017",
    "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/8": 0,
    "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/7": 730,
  },
  {
    "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/6": 0,
    "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/5": 0,
    "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/4": 0,
    "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/4":
      "Steuerhoheit - Total",
    "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/3": 0,
    "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/3":
      "250 - 499 ha",
    "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/2": 0,
    "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/2":
      "Graubünden / Grigioni / Grischun",
    "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/1": 0,
    "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/1":
      "Schweiz",
    "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/0": 0,
    "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/0": "2016",
    "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/8": 0,
    "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/7": 0,
  },
  {
    "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/6": 0,
    "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/5": 0,
    "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/4": 0,
    "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/4":
      "Steuerhoheit - Total",
    "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/3": 0,
    "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/3":
      "250 - 499 ha",
    "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/2": 0,
    "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/2":
      "Basel-Stadt",
    "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/1": 0,
    "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/1":
      "Voralpen",
    "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/0": 0,
    "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/0": "2016",
    "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/8": 0,
    "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/7": 0,
  },
].map((observation) =>
  mapKeys(observation, (_, k) =>
    stringifyComponentId({
      unversionedCubeIri:
        "http://environment.ld.admin.ch/foen/px/0703010000_105",
      unversionedComponentIri: k,
    })
  )
);

export const tableMeasures: Measure[] = [
  {
    __typename: "NumericalMeasure",
    cubeIri: "https://cube",
    id: stringifyComponentId({
      unversionedCubeIri: "https://cube",
      unversionedComponentIri:
        "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/0",
    }),
    label: "Anzahl Betriebe",
    isNumerical: false,
    isKeyDimension: false,
    values: [],
    relatedLimitValues: [],
    limits: [],
  },
  {
    __typename: "NumericalMeasure",
    cubeIri: "https://cube",
    id: stringifyComponentId({
      unversionedCubeIri: "https://cube",
      unversionedComponentIri:
        "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/1",
    }),
    label: "Anzahl Waldeigentümer",
    isNumerical: false,
    isKeyDimension: false,
    values: [],
    relatedLimitValues: [],
    limits: [],
  },
  {
    __typename: "NumericalMeasure",
    cubeIri: "https://cube",
    id: stringifyComponentId({
      unversionedCubeIri: "https://cube",
      unversionedComponentIri:
        "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/2",
    }),
    label: "Gesamte Waldflächen (ha)",
    isNumerical: false,
    isKeyDimension: false,
    values: [],
    relatedLimitValues: [],
    limits: [],
  },
  {
    __typename: "NumericalMeasure",
    cubeIri: "https://cube",
    id: stringifyComponentId({
      unversionedCubeIri: "https://cube",
      unversionedComponentIri:
        "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/3",
    }),
    label: "Produktive Waldflächen (ha)",
    isNumerical: false,
    isKeyDimension: false,
    values: [],
    relatedLimitValues: [],
    limits: [],
  },
  {
    __typename: "NumericalMeasure",
    cubeIri: "https://cube",
    id: stringifyComponentId({
      unversionedCubeIri: "https://cube",
      unversionedComponentIri:
        "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/4",
    }),
    label: "Holzernte Total (m3)",
    isNumerical: false,
    isKeyDimension: false,
    values: [],
    relatedLimitValues: [],
    limits: [],
  },
  {
    __typename: "NumericalMeasure",
    cubeIri: "https://cube",
    id: stringifyComponentId({
      unversionedCubeIri: "https://cube",
      unversionedComponentIri:
        "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/5",
    }),
    label: "Stammholz (m3)",
    isNumerical: false,
    isKeyDimension: false,
    values: [],
    relatedLimitValues: [],
    limits: [],
  },
  {
    __typename: "NumericalMeasure",
    cubeIri: "https://cube",
    id: stringifyComponentId({
      unversionedCubeIri: "https://cube",
      unversionedComponentIri:
        "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/6",
    }),
    label: "Industrieholz (m3)",
    isNumerical: false,
    isKeyDimension: false,
    values: [],
    relatedLimitValues: [],
    limits: [],
  },
  {
    __typename: "NumericalMeasure",
    cubeIri: "https://cube",
    id: stringifyComponentId({
      unversionedCubeIri: "https://cube",
      unversionedComponentIri:
        "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/7",
    }),
    label: "Energieholz (m3)",
    isNumerical: false,
    isKeyDimension: false,
    values: [],
    relatedLimitValues: [],
    limits: [],
  },
  {
    __typename: "NumericalMeasure",
    cubeIri: "https://cube",
    id: stringifyComponentId({
      unversionedCubeIri: "https://cube",
      unversionedComponentIri:
        "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/8",
    }),
    label: "Übrige Sortimente (m3)",
    isNumerical: false,
    isKeyDimension: false,
    values: [],
    relatedLimitValues: [],
    limits: [],
  },
];

export const tableDimensions: Dimension[] = [
  {
    __typename: "TemporalDimension",
    cubeIri: "https://cube",
    id: stringifyComponentId({
      unversionedCubeIri: "https://cube",
      unversionedComponentIri:
        "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/0",
    }),
    label: "Jahr",
    values: [
      { value: "2015", label: "2015" },
      { value: "2016", label: "2016" },
      { value: "2017", label: "2017" },
      { value: "2018", label: "2018" },
    ],
    relatedLimitValues: [],
    isNumerical: false,
    isKeyDimension: false,
    timeUnit: TimeUnit.Year,
    timeFormat: "%Y",
  },
  {
    cubeIri: "https://cube",
    id: stringifyComponentId({
      unversionedCubeIri: "https://cube",
      unversionedComponentIri:
        "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/1",
    }),
    label: "Forstzone",
    isNumerical: false,
    isKeyDimension: false,
    values: [
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/1/0",
        label: "Schweiz",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/1/1",
        label: "Jura",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/1/2",
        label: "Mittelland",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/1/3",
        label: "Voralpen",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/1/4",
        label: "Alpen",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/1/5",
        label: "Alpen-Südseite",
      },
    ],
    relatedLimitValues: [],
    __typename: "NominalDimension",
  },
  {
    cubeIri: "https://cube",
    id: stringifyComponentId({
      unversionedCubeIri: "https://cube",
      unversionedComponentIri:
        "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/2",
    }),
    label: "Kanton",
    isNumerical: false,
    isKeyDimension: false,
    values: [
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/2/0",
        label: "Schweiz",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/2/1",
        label: "Zürich",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/2/2",
        label: "Bern / Berne",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/2/3",
        label: "Luzern",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/2/4",
        label: "Uri",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/2/5",
        label: "Schwyz",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/2/6",
        label: "Obwalden",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/2/7",
        label: "Nidwalden",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/2/8",
        label: "Glarus",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/2/9",
        label: "Zug",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/2/10",
        label: "Fribourg / Freiburg",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/2/11",
        label: "Solothurn",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/2/12",
        label: "Basel-Stadt",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/2/13",
        label: "Basel-Landschaft",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/2/14",
        label: "Schaffhausen",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/2/15",
        label: "Appenzell Ausserrhoden",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/2/16",
        label: "Appenzell Innerrhoden",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/2/17",
        label: "St. Gallen",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/2/18",
        label: "Graubünden / Grigioni / Grischun",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/2/19",
        label: "Aargau",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/2/20",
        label: "Thurgau",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/2/21",
        label: "Ticino",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/2/22",
        label: "Vaud",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/2/23",
        label: "Valais / Wallis",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/2/24",
        label: "Neuchâtel",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/2/25",
        label: "Genève",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/2/26",
        label: "Jura",
      },
    ],
    relatedLimitValues: [],
    __typename: "NominalDimension",
  },
  {
    cubeIri: "https://cube",
    id: stringifyComponentId({
      unversionedCubeIri: "https://cube",
      unversionedComponentIri:
        "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/3",
    }),
    label: "Grössenklasse",
    isNumerical: false,
    isKeyDimension: false,
    values: [
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/3/0",
        label: "Grössenklasse - Total",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/3/1",
        label: "150 - 249 ha",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/3/2",
        label: "250 - 499 ha",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/3/3",
        label: "500 - 999 ha",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/3/4",
        label: "1000 - 1999 ha",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/3/5",
        label: ">= 2000 ha",
      },
    ],
    relatedLimitValues: [],
    __typename: "NominalDimension",
  },
  {
    cubeIri: "https://cube",
    id: stringifyComponentId({
      unversionedCubeIri: "https://cube",
      unversionedComponentIri:
        "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/4",
    }),
    label: "Steuerhoheit",
    isNumerical: false,
    isKeyDimension: false,
    values: [
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/4/0",
        label: "Steuerhoheit - Total",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/4/1",
        label: "Mit Steuerhoheit - Total",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/4/2",
        label: ">>Bund",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/4/3",
        label: ">>Kantone",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/4/4",
        label: ">>Gemeinden",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/4/5",
        label: "Ohne Steuerhoheit - Total",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/4/6",
        label: ">>Bürger- Burgergemeinden",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/4/7",
        label: ">>übrige öffentliche ohne Steuerhoheit",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/4/8",
        label: ">>Private",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/4/9",
        label: "Gemischte (mit/ohne) - Total",
      },
    ],
    relatedLimitValues: [],
    __typename: "NominalDimension",
  },
];
export const tableConfig: TableConfig = {
  key: "table",
  version: "1.2.1",
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
  annotations: [],
  limits: {},
  conversionUnitsByComponentId: {},
  chartType: "table",
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
      active: false,
      componentIds: [],
      defaultValueOverrides: {},
      filterTypes: {},
      defaultOpen: true,
    },
    calculation: {
      active: false,
      type: "identity",
    },
  },
  settings: { showSearch: true, showAllRows: true, limitColumnWidths: false },
  links: {
    enabled: false,
    baseUrl: "",
    componentId: "",
    targetComponentId: "",
  },
  sorting: [
    {
      componentId:
        "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/2",
      componentType: "NominalDimension",
      sortingOrder: "desc",
    },
    {
      componentId:
        "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/5",
      componentType: "NumericalMeasure",
      sortingOrder: "asc",
    },
  ],
  fields: {
    "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/0": {
      componentId:
        "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/0",
      index: 1,
      isGroup: false,
      isHidden: false,
      componentType: "NominalDimension",
      columnStyle: {
        type: "text",
        textStyle: "regular",
        textColor: "grey.700",
        columnColor: "#fff",
      },
    },
    "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/1": {
      componentId:
        "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/1",
      index: 7,
      isGroup: false,
      isHidden: false,
      componentType: "NominalDimension",
      columnStyle: {
        type: "category",
        paletteId: "set3",
        textStyle: "bold",
        colorMapping: {
          "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/1/0":
            "#ff0055",
          "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/1/1":
            "#fdcdac",
          "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/1/2":
            "#ff6600",
          "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/1/3":
            "#f4cae4",
          "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/1/4":
            "#e6f5c9",
          "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/1/5":
            "#fff2ae",
        },
      },
    },
    "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/2": {
      componentId:
        "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/2",
      index: 3,
      isGroup: false,
      isHidden: false,
      componentType: "NominalDimension",
      columnStyle: {
        type: "text",
        textStyle: "bold",
        textColor: "hotpink",
        columnColor: "gold",
      },
    },
    "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/3": {
      componentId:
        "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/3",
      index: 4,
      isGroup: false,
      isHidden: false,
      componentType: "NominalDimension",
      columnStyle: {
        type: "text",
        textStyle: "regular",
        textColor: "grey.700",
        columnColor: "pink",
      },
    },
    "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/4": {
      componentId:
        "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/4",
      index: 5,
      isGroup: false,
      isHidden: false,
      componentType: "NominalDimension",
      columnStyle: {
        type: "text",
        textStyle: "regular",
        textColor: "grey.700",
        columnColor: "#fff",
      },
    },
    "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/0": {
      componentId:
        "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/0",
      index: 6,
      isGroup: false,
      isHidden: false,
      componentType: "NumericalMeasure",
      columnStyle: {
        type: "text",
        textStyle: "regular",
        textColor: "grey.700",
        columnColor: "#fff",
      },
    },
    "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/1": {
      componentId:
        "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/1",
      index: 2,
      isGroup: false,
      isHidden: false,
      componentType: "NumericalMeasure",
      columnStyle: {
        type: "heatmap",
        paletteId: "BrBG",
        textStyle: "regular",
      },
    },
    "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/2": {
      componentId:
        "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/2",
      index: 8,
      isGroup: false,
      isHidden: false,
      componentType: "NumericalMeasure",
      columnStyle: {
        type: "text",
        textStyle: "regular",
        textColor: "grey.700",
        columnColor: "#fff",
      },
    },
    "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/3": {
      componentId:
        "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/3",
      index: 9,
      isGroup: false,
      isHidden: false,
      componentType: "NumericalMeasure",
      columnStyle: {
        type: "text",
        textStyle: "regular",
        textColor: "grey.700",
        columnColor: "#fff",
      },
    },
    "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/4": {
      componentId:
        "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/4",
      index: 10,
      isGroup: false,
      isHidden: false,
      componentType: "NumericalMeasure",
      columnStyle: {
        type: "bar",
        textStyle: "regular",
        barColorPositive: "hotpink",
        barColorNegative: "LightSeaGreen",
        barColorBackground: "#ccc",
        barShowBackground: true,
      },
    },
    "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/5": {
      componentId:
        "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/5",
      index: 11,
      isGroup: false,
      isHidden: false,
      componentType: "NumericalMeasure",
      columnStyle: { type: "heatmap", paletteId: "PRGn", textStyle: "regular" },
    },
    "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/6": {
      componentId:
        "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/6",
      index: 12,
      isGroup: false,
      isHidden: false,
      componentType: "NumericalMeasure",
      columnStyle: {
        type: "heatmap",
        textStyle: "regular",
        paletteId: "PiYG",
      },
    },
    "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/7": {
      componentId:
        "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/7",
      index: 13,
      isGroup: false,
      isHidden: false,
      componentType: "NumericalMeasure",
      columnStyle: {
        type: "text",
        textStyle: "regular",
        textColor: "grey.700",
        columnColor: "#fff",
      },
    },
    "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/8": {
      componentId:
        "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/8",
      index: 14,
      isGroup: false,
      isHidden: false,
      componentType: "NumericalMeasure",
      columnStyle: {
        type: "text",
        textStyle: "regular",
        textColor: "grey.700",
        columnColor: "#fff",
      },
    },
  },
  activeField: undefined,
};
