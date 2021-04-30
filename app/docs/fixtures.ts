import { ColumnFields, ConfiguratorState, TableConfig } from "../configurator";
import { DimensionFieldsFragment } from "../graphql/query-hooks";

export const states: ConfiguratorState[] = [
  {
    state: "SELECTING_DATASET",
    dataSet: undefined,
    chartConfig: undefined,
    meta: {
      title: {
        de: "",
        fr: "",
        it: "",
        en: "",
      },
      description: {
        de: "",
        fr: "",
        it: "",
        en: "",
      },
    },
    activeField: undefined,
  },
  {
    state: "SELECTING_CHART_TYPE",
    dataSet: "foo",
    chartConfig: {
      chartType: "column",
      fields: {
        x: {
          componentIri: "foo",
          sorting: { sortingType: "byDimensionLabel", sortingOrder: "asc" },
        },
        y: { componentIri: "foo" },
      },
      filters: {},
      interactiveFiltersConfig: {
        legend: { active: false, componentIri: "" },
        time: {
          active: false,
          componentIri: "",
          presets: { type: "range", from: "", to: "" },
        },
        dataFilters: { active: false, componentIris: [] },
      },
    },
    meta: {
      title: {
        de: "",
        fr: "",
        it: "",
        en: "",
      },
      description: {
        de: "",
        fr: "",
        it: "",
        en: "",
      },
    },
    activeField: undefined,
  },
];

export const observations = [
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
];

export const fields: ColumnFields = {
  x: {
    componentIri:
      "http://environment.ld.admin.ch/foen/px/0703030000_124/dimension/0",
    sorting: { sortingType: "byDimensionLabel", sortingOrder: "asc" },
  },
  y: {
    componentIri:
      "http://environment.ld.admin.ch/foen/px/0703030000_124/measure/0",
  },
};

export const measures: DimensionFieldsFragment[] = [
  {
    iri: "http://environment.ld.admin.ch/foen/px/0703030000_124/measure/0",
    label: "Investitionen: Einnahmen - Total",
    __typename: "Measure",
  },
  {
    iri: "http://environment.ld.admin.ch/foen/px/0703030000_124/measure/1",
    label: "Investitionen: Einnahmen aus Beiträgen Bund und Kantone",
    __typename: "Measure",
  },
  {
    iri: "http://environment.ld.admin.ch/foen/px/0703030000_124/measure/2",
    label: "Investitionen: Einnahmen aus Beiträgen von Gemeinden und Dritten",
    __typename: "Measure",
  },
  {
    iri: "http://environment.ld.admin.ch/foen/px/0703030000_124/measure/3",
    label: "Investitionen: übrige Einnahmen",
    __typename: "Measure",
  },
  {
    iri: "http://environment.ld.admin.ch/foen/px/0703030000_124/measure/4",
    label: "Investitionen - Total",
    __typename: "Measure",
  },
  {
    iri: "http://environment.ld.admin.ch/foen/px/0703030000_124/measure/5",
    label: "Investitionen für Wirtschaftsgebäude",
    __typename: "Measure",
  },
  {
    iri: "http://environment.ld.admin.ch/foen/px/0703030000_124/measure/6",
    label: "Investitionen für Maschinen",
    __typename: "Measure",
  },
  {
    iri: "http://environment.ld.admin.ch/foen/px/0703030000_124/measure/7",
    label: "Übrige Ausgaben für Investitionen",
    __typename: "Measure",
  },
  {
    iri: "http://environment.ld.admin.ch/foen/px/0703030000_124/measure/8",
    label: "Investitionen für Erschliessungsanlagen",
    __typename: "Measure",
  },
  {
    iri: "http://environment.ld.admin.ch/foen/px/0703030000_124/measure/9",
    label: "Netto-Investitionen",
    __typename: "Measure",
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
];

export const tableMeasures = [
  {
    iri: "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/0",
    label: "Anzahl Betriebe",
    __typename: "Measure",
  },
  {
    iri: "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/1",
    label: "Anzahl Waldeigentümer",
    __typename: "Measure",
  },
  {
    iri: "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/2",
    label: "Gesamte Waldflächen (ha)",
    __typename: "Measure",
  },
  {
    iri: "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/3",
    label: "Produktive Waldflächen (ha)",
    __typename: "Measure",
  },
  {
    iri: "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/4",
    label: "Holzernte Total (m3)",
    __typename: "Measure",
  },
  {
    iri: "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/5",
    label: "Stammholz (m3)",
    __typename: "Measure",
  },
  {
    iri: "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/6",
    label: "Industrieholz (m3)",
    __typename: "Measure",
  },
  {
    iri: "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/7",
    label: "Energieholz (m3)",
    __typename: "Measure",
  },
  {
    iri: "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/8",
    label: "Übrige Sortimente (m3)",
    __typename: "Measure",
  },
];

export const tableDimensions = [
  {
    iri: "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/0",
    label: "Jahr",
    values: [
      { value: "2015", label: "2015", __typename: "DimensionValue" },
      { value: "2016", label: "2016", __typename: "DimensionValue" },
      { value: "2017", label: "2017", __typename: "DimensionValue" },
      { value: "2018", label: "2018", __typename: "DimensionValue" },
    ],
    __typename: "TemporalDimension",
  },
  {
    iri: "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/1",
    label: "Forstzone",
    values: [
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/1/0",
        label: "Schweiz",
        __typename: "DimensionValue",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/1/1",
        label: "Jura",
        __typename: "DimensionValue",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/1/2",
        label: "Mittelland",
        __typename: "DimensionValue",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/1/3",
        label: "Voralpen",
        __typename: "DimensionValue",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/1/4",
        label: "Alpen",
        __typename: "DimensionValue",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/1/5",
        label: "Alpen-Südseite",
        __typename: "DimensionValue",
      },
    ],
    __typename: "NominalDimension",
  },
  {
    iri: "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/2",
    label: "Kanton",
    values: [
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/2/0",
        label: "Schweiz",
        __typename: "DimensionValue",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/2/1",
        label: "Zürich",
        __typename: "DimensionValue",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/2/2",
        label: "Bern / Berne",
        __typename: "DimensionValue",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/2/3",
        label: "Luzern",
        __typename: "DimensionValue",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/2/4",
        label: "Uri",
        __typename: "DimensionValue",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/2/5",
        label: "Schwyz",
        __typename: "DimensionValue",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/2/6",
        label: "Obwalden",
        __typename: "DimensionValue",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/2/7",
        label: "Nidwalden",
        __typename: "DimensionValue",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/2/8",
        label: "Glarus",
        __typename: "DimensionValue",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/2/9",
        label: "Zug",
        __typename: "DimensionValue",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/2/10",
        label: "Fribourg / Freiburg",
        __typename: "DimensionValue",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/2/11",
        label: "Solothurn",
        __typename: "DimensionValue",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/2/12",
        label: "Basel-Stadt",
        __typename: "DimensionValue",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/2/13",
        label: "Basel-Landschaft",
        __typename: "DimensionValue",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/2/14",
        label: "Schaffhausen",
        __typename: "DimensionValue",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/2/15",
        label: "Appenzell Ausserrhoden",
        __typename: "DimensionValue",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/2/16",
        label: "Appenzell Innerrhoden",
        __typename: "DimensionValue",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/2/17",
        label: "St. Gallen",
        __typename: "DimensionValue",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/2/18",
        label: "Graubünden / Grigioni / Grischun",
        __typename: "DimensionValue",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/2/19",
        label: "Aargau",
        __typename: "DimensionValue",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/2/20",
        label: "Thurgau",
        __typename: "DimensionValue",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/2/21",
        label: "Ticino",
        __typename: "DimensionValue",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/2/22",
        label: "Vaud",
        __typename: "DimensionValue",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/2/23",
        label: "Valais / Wallis",
        __typename: "DimensionValue",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/2/24",
        label: "Neuchâtel",
        __typename: "DimensionValue",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/2/25",
        label: "Genève",
        __typename: "DimensionValue",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/2/26",
        label: "Jura",
        __typename: "DimensionValue",
      },
    ],
    __typename: "NominalDimension",
  },
  {
    iri: "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/3",
    label: "Grössenklasse",
    values: [
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/3/0",
        label: "Grössenklasse - Total",
        __typename: "DimensionValue",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/3/1",
        label: "150 - 249 ha",
        __typename: "DimensionValue",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/3/2",
        label: "250 - 499 ha",
        __typename: "DimensionValue",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/3/3",
        label: "500 - 999 ha",
        __typename: "DimensionValue",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/3/4",
        label: "1000 - 1999 ha",
        __typename: "DimensionValue",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/3/5",
        label: ">= 2000 ha",
        __typename: "DimensionValue",
      },
    ],
    __typename: "NominalDimension",
  },
  {
    iri: "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/4",
    label: "Steuerhoheit",
    values: [
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/4/0",
        label: "Steuerhoheit - Total",
        __typename: "DimensionValue",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/4/1",
        label: "Mit Steuerhoheit - Total",
        __typename: "DimensionValue",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/4/2",
        label: ">>Bund",
        __typename: "DimensionValue",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/4/3",
        label: ">>Kantone",
        __typename: "DimensionValue",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/4/4",
        label: ">>Gemeinden",
        __typename: "DimensionValue",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/4/5",
        label: "Ohne Steuerhoheit - Total",
        __typename: "DimensionValue",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/4/6",
        label: ">>Bürger- Burgergemeinden",
        __typename: "DimensionValue",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/4/7",
        label: ">>übrige öffentliche ohne Steuerhoheit",
        __typename: "DimensionValue",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/4/8",
        label: ">>Private",
        __typename: "DimensionValue",
      },
      {
        value:
          "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/4/9",
        label: "Gemischte (mit/ohne) - Total",
        __typename: "DimensionValue",
      },
    ],
    __typename: "NominalDimension",
  },
];
export const tableConfig: TableConfig = {
  chartType: "table",
  filters: {},
  interactiveFiltersConfig: undefined,
  settings: { showSearch: true, showAllRows: true },
  sorting: [
    {
      componentIri:
        "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/2",
      componentType: "NominalDimension",
      sortingOrder: "desc",
    },
    {
      componentIri:
        "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/5",
      componentType: "Measure",
      sortingOrder: "asc",
    },
  ],
  fields: {
    "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/0": {
      componentIri:
        "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/0",
      index: 1,
      isGroup: false,
      isHidden: false,
      isFiltered: false,
      componentType: "NominalDimension",
      columnStyle: {
        type: "text",
        textStyle: "regular",
        textColor: "monochrome700",
        columnColor: "#fff",
      },
    },
    "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/1": {
      componentIri:
        "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/1",
      index: 7,
      isGroup: false,
      isHidden: false,
      isFiltered: false,
      componentType: "NominalDimension",
      columnStyle: {
        type: "category",
        palette: "set3",
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
      componentIri:
        "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/2",
      index: 3,
      isGroup: false,
      isHidden: false,
      isFiltered: false,
      componentType: "NominalDimension",
      columnStyle: {
        type: "text",
        textStyle: "bold",
        textColor: "hotpink",
        columnColor: "gold",
      },
    },
    "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/3": {
      componentIri:
        "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/3",
      index: 4,
      isGroup: false,
      isHidden: false,
      isFiltered: false,
      componentType: "NominalDimension",
      columnStyle: {
        type: "text",
        textStyle: "regular",
        textColor: "monochrome700",
        columnColor: "pink",
      },
    },
    "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/4": {
      componentIri:
        "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/4",
      index: 5,
      isGroup: false,
      isHidden: false,
      isFiltered: false,
      componentType: "NominalDimension",
      columnStyle: {
        type: "text",
        textStyle: "regular",
        textColor: "monochrome700",
        columnColor: "#fff",
      },
    },
    "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/0": {
      componentIri:
        "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/0",
      index: 6,
      isGroup: false,
      isHidden: false,
      isFiltered: false,
      componentType: "Measure",
      columnStyle: {
        type: "text",
        textStyle: "regular",
        textColor: "monochrome700",
        columnColor: "#fff",
      },
    },
    "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/1": {
      componentIri:
        "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/1",
      index: 2,
      isGroup: false,
      isHidden: false,
      isFiltered: false,
      componentType: "Measure",
      columnStyle: {
        type: "heatmap",
        palette: "oranges",
        textStyle: "regular",
      },
    },
    "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/2": {
      componentIri:
        "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/2",
      index: 8,
      isGroup: false,
      isHidden: false,
      isFiltered: false,
      componentType: "Measure",
      columnStyle: {
        type: "text",
        textStyle: "regular",
        textColor: "monochrome700",
        columnColor: "#fff",
      },
    },
    "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/3": {
      componentIri:
        "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/3",
      index: 9,
      isGroup: false,
      isHidden: false,
      isFiltered: false,
      componentType: "Measure",
      columnStyle: {
        type: "text",
        textStyle: "regular",
        textColor: "monochrome700",
        columnColor: "#fff",
      },
    },
    "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/4": {
      componentIri:
        "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/4",
      index: 10,
      isGroup: false,
      isHidden: false,
      isFiltered: false,
      componentType: "Measure",
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
      componentIri:
        "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/5",
      index: 11,
      isGroup: false,
      isHidden: false,
      isFiltered: false,
      componentType: "Measure",
      columnStyle: { type: "heatmap", palette: "turbo", textStyle: "regular" },
    },
    "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/6": {
      componentIri:
        "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/6",
      index: 12,
      isGroup: false,
      isHidden: false,
      isFiltered: false,
      componentType: "Measure",
      columnStyle: {
        type: "heatmap",
        textStyle: "regular",
        palette: "cividis",
      },
    },
    "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/7": {
      componentIri:
        "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/7",
      index: 13,
      isGroup: false,
      isHidden: false,
      isFiltered: false,
      componentType: "Measure",
      columnStyle: {
        type: "text",
        textStyle: "regular",
        textColor: "monochrome700",
        columnColor: "#fff",
      },
    },
    "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/8": {
      componentIri:
        "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/8",
      index: 14,
      isGroup: false,
      isHidden: false,
      isFiltered: false,
      componentType: "Measure",
      columnStyle: {
        type: "text",
        textStyle: "regular",
        textColor: "monochrome700",
        columnColor: "#fff",
      },
    },
  },
};
