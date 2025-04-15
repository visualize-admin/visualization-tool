import { hashStringToObject, objectToHashString } from "@/utils/hash-utils";

it("should persist chart configs as is", () => {
  const configuratorState = {
    version: "4.5.0",
    state: "CONFIGURING_CHART",
    dataSource: {
      type: "sparql",
      url: "https://lindas-cached.cluster.ldbar.ch/query",
    },
    activeField: undefined,
    layout: {
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
        label: {
          de: "",
          en: "",
          fr: "",
          it: "",
        },
      },
      blocks: [
        {
          type: "chart",
          key: "snny_xUeArWR",
          initialized: false,
        },
      ],
    },
    chartConfigs: [
      {
        key: "snny_xUeArWR",
        version: "4.4.0",
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
            iri: "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/10",
            filters: {
              "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/Kanton":
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
              "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/Jahr",
            presets: {
              type: "range",
              from: "",
              to: "",
            },
          },
          dataFilters: {
            active: false,
            componentIds: [],
            defaultOpen: true,
          },
          calculation: {
            active: false,
            type: "identity",
          },
        },
        fields: {
          x: {
            componentId:
              "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/Jahr",
            sorting: {
              sortingType: "byAuto",
              sortingOrder: "asc",
            },
          },
          y: {
            componentId:
              "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/InstallierteLeistungkW",
          },
          color: {
            type: "single",
            paletteId: "category10",
            color: "#1D4ED8",
          },
        },
      },
    ],
    activeChartKey: "snny_xUeArWR",
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

  const hashString = objectToHashString(configuratorState);
  const configuratorStateFromHashString = hashStringToObject(hashString);

  expect(configuratorState).toEqual(configuratorStateFromHashString);
});
