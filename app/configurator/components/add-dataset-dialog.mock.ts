import { ConfiguratorStateConfiguringChart } from "@/configurator";

export const photovoltaikChartStateMock: ConfiguratorStateConfiguringChart = {
  version: "3.1.0",
  state: "CONFIGURING_CHART",
  dataSource: {
    type: "sparql",
    url: "https://int.lindas.admin.ch/query",
  },
  layout: {
    activeField: "y",
    type: "tab",
    meta: {
      title: {
        de: "",
        en: "",
        fr: "",
        it: "",
      },
      description: {
        de: "",
        en: "",
        fr: "",
        it: "",
      },
    },
  },
  chartConfigs: [
    {
      activeField: "y",
      key: "8-5RW138pTDA",
      version: "3.1.0",
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
          iri: "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/14",
          publishIri:
            "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/14",
          filters: {
            "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/Kanton":
              {
                type: "single",
                value: "https://ld.admin.ch/canton/1",
              },
          },
        },
      ],
      chartType: "column",
      interactiveFiltersConfig: {
        legend: {
          active: false,
          componentIri: "",
        },
        timeRange: {
          active: false,
          componentIri:
            "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/Jahr",
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
          componentIri:
            "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/Jahr",
          sorting: {
            sortingType: "byAuto",
            sortingOrder: "asc",
          },
        },
        y: {
          componentIri:
            "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/AnzahlAnlagen",
        },
      },
    },
  ],
  activeChartKey: "8-5RW138pTDA",
  dashboardFilters: {
    timeRangeFilters: [],
  },
};
