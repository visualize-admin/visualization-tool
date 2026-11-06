import { expect, it } from "vitest";

import { hashStringToObject, objectToHashString } from "@/utils/hash-utils";

it("should persist chart configs as is", () => {
  const configuratorState = {
    version: "4.5.0",
    state: "CONFIGURING_CHART",
    dataSource: {
      type: "sparql",
      url: "https://cached.lindas.admin.ch/query",
    },
    activeField: undefined,
    fakePropertyToTestNumbersParsing: 12345.6789,
    fakePropertyToTestNumbersParsing2: "12345.6789",
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
          en: "Very long description with equal sign (=) and new\n\nlines\n\n!",
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

it("should not allow prototype pollution via __proto__ path segments", () => {
  const hashString =
    "#__proto____SEP__pollutedKey=pwned||__proto____SEP__dangerouslySetInnerHTML=%7B%7D||__proto____SEP____html=%3Cimg%20src=x%20onerror=alert(1)%3E";

  hashStringToObject(hashString);

  expect(({} as any).pollutedKey).toBeUndefined();
  expect(({} as any).dangerouslySetInnerHTML).toBeUndefined();
  expect(({} as any).__html).toBeUndefined();
});

it("should not allow prototype pollution via constructor/prototype path segments", () => {
  const hashString =
    "#constructor__SEP__prototype__SEP__pollutedKey=pwned||a__SEP__constructor__SEP__prototype__SEP__pollutedKey2=pwned2||b__SEP____proto____SEP__pollutedKey3=pwned3";

  const result = hashStringToObject(hashString);

  expect(({} as any).pollutedKey).toBeUndefined();
  expect(({} as any).pollutedKey2).toBeUndefined();
  expect(({} as any).pollutedKey3).toBeUndefined();
  expect(result).toEqual({});
});

it("should not traverse inherited object properties when unflattening", () => {
  const hashString =
    "#hasOwnProperty__SEP__pollutedKey=pwned||valueOf__SEP__pollutedKey2=pwned2||toString__SEP__pollutedKey3=pwned3";

  const result = hashStringToObject(hashString);

  // The walk must create own properties instead of descending into the
  // shared built-in functions found on Object.prototype.
  expect(({} as any).pollutedKey).toBeUndefined();
  expect(({} as any).pollutedKey2).toBeUndefined();
  expect(({} as any).pollutedKey3).toBeUndefined();
  expect(result.hasOwnProperty).toBeDefined();
});
