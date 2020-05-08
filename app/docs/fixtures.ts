import { ConfiguratorState, ColumnFields } from "../domain";
import { ComponentFieldsFragment } from "../graphql/query-hooks";

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
          sorting: { sortingField: "alphabetical", sortingOrder: "asc" },
        },
        y: { componentIri: "foo" },
      },
      filters: {},
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
    sorting: { sortingField: "alphabetical", sortingOrder: "asc" },
  },
  y: {
    componentIri:
      "http://environment.ld.admin.ch/foen/px/0703030000_124/measure/0",
  },
};

export const measures: ComponentFieldsFragment[] = [
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
