import {
  ConfiguratorState,
  ConfiguratorStateConfiguringChart,
} from "@/configurator";

export const chartConfigMock = {
  columnCovid19: {
    version: "1.2.1",
    chartType: "column",
    filters: {
      "https://environment.ld.admin.ch/foen/COVID19VaccPersons_v2/georegion": {
        type: "single",
        value: "https://ld.admin.ch/canton/1",
      },
      "https://environment.ld.admin.ch/foen/COVID19VaccPersons_v2/type": {
        type: "single",
        value:
          "https://environment.ld.admin.ch/foen/COVID19VaccPersons_v2/type/COVID19AtLeastOneDosePersons",
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
        active: false,
        componentIris: [],
      },
    },
    fields: {
      x: {
        componentIri:
          "https://environment.ld.admin.ch/foen/COVID19VaccPersons_v2/date",
        sorting: {
          sortingType: "byDimensionLabel",
          sortingOrder: "asc",
        },
      },
      y: {
        componentIri:
          "https://environment.ld.admin.ch/foen/COVID19VaccPersons_v2/entries",
      },
    },
  },
};

export const configStateMock = {
  map: {
    state: "CONFIGURING_CHART",
    version: "3.1.0",
    dataSource: { type: "sparql", url: "https://lindas.admin.ch" },
    layout: {
      activeField: "none",
      type: "singleURLs",
      publishableChartKeys: [],
      meta: {} as ConfiguratorStateConfiguringChart["layout"]["meta"],
    },
    chartConfigs: [
      {
        key: "abc",
        chartType: "map",
        version: "3.1.0",
        meta: {} as ConfiguratorStateConfiguringChart["chartConfigs"][0]["meta"],
        interactiveFiltersConfig:
          {} as ConfiguratorStateConfiguringChart["chartConfigs"][0]["interactiveFiltersConfig"],
        baseLayer: {} as Extract<
          ConfiguratorStateConfiguringChart["chartConfigs"][0],
          { chartType: "map" }
        >["baseLayer"],
        activeField: "",
        cubes: [{ iri: "https://first-dataset", filters: {} }],

        fields: {
          areaLayer: {
            componentIri: "year-period-1",
            color: {
              type: "categorical",
              componentIri: "year-period-1",
              palette: "dimension",
              colorMapping: {
                red: "green",
                green: "blue",
                blue: "red",
              },
            },
          },
        },
      },
    ],
    activeChartKey: "abc",
  },
} satisfies Record<string, ConfiguratorState>;