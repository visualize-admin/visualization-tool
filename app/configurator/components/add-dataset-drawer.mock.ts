import { ConfiguratorStateConfiguringChart } from "@/configurator";

export const photovoltaikChartStateMock: ConfiguratorStateConfiguringChart = {
  version: "3.1.0",
  state: "CONFIGURING_CHART",
  dataSource: {
    type: "sparql",
    url: "https://lindas-cached.int.cluster.ldbar.ch/query",
  },
  layout: {
    activeField: "y",
    type: "tab",
    blocks: [{ type: "chart", key: "8-5RW138pTDA", initialized: true }],
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
      label: {
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
        label: {
          en: "",
          de: "",
          fr: "",
          it: "",
        },
      },
      cubes: [
        {
          iri: "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/14",
          filters: {
            "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/Kanton":
              {
                type: "single",
                value: "https://ld.admin.ch/canton/1",
              },
          },
        },
      ],
      limits: {},
      chartType: "column",
      interactiveFiltersConfig: {
        legend: {
          active: false,
          componentId: "",
        },
        timeRange: {
          active: false,
          componentId:
            "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/Jahr",
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
          componentId:
            "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/Jahr",
          sorting: {
            sortingType: "byAuto",
            sortingOrder: "asc",
          },
        },
        y: {
          componentId:
            "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/AnzahlAnlagen",
        },
        color: {
          type: "single",
          paletteId: "category10",
          color: "#1f77b4",
        },
      },
    },
  ],
  activeChartKey: "8-5RW138pTDA",
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
};
