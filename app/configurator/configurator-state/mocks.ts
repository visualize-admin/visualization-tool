import { DEFAULT_OTHER_COLOR_FIELD_OPACITY } from "@/charts/map/constants";
import {
  ChartConfig,
  ConfiguratorState,
  ConfiguratorStateConfiguringChart,
} from "@/configurator";
import { Dimension, Measure } from "@/domain/data";
import { stringifyComponentId } from "@/graphql/make-component-id";
import { ScaleType, TimeUnit } from "@/graphql/resolver-types";
import {
  CHART_CONFIG_VERSION,
  CONFIGURATOR_STATE_VERSION,
} from "@/utils/chart-config/constants";

export const configStateMock = {
  map: {
    state: "CONFIGURING_CHART",
    version: CONFIGURATOR_STATE_VERSION,
    dataSource: { type: "sparql", url: "https://lindas.admin.ch" },
    layout: {
      activeField: "none",
      type: "singleURLs",
      publishableChartKeys: [],
      meta: {} as ConfiguratorStateConfiguringChart["layout"]["meta"],
      blocks: [{ type: "chart", key: "abc", initialized: true }],
    },
    chartConfigs: [
      {
        key: "abc",
        chartType: "map",
        version: CHART_CONFIG_VERSION,
        meta: {} as ConfiguratorStateConfiguringChart["chartConfigs"][0]["meta"],
        interactiveFiltersConfig:
          {} as ConfiguratorStateConfiguringChart["chartConfigs"][0]["interactiveFiltersConfig"],
        baseLayer: {} as Extract<
          ConfiguratorStateConfiguringChart["chartConfigs"][0],
          { chartType: "map" }
        >["baseLayer"],
        activeField: "",
        cubes: [{ iri: "https://first-dataset", filters: {} }],
        limits: {},
        fields: {
          areaLayer: {
            componentId: "year-period-1",
            color: {
              type: "categorical",
              componentId: "year-period-1",
              paletteId: "dimension",
              colorMapping: {
                red: "green",
                green: "blue",
                blue: "red",
              },
              opacity: DEFAULT_OTHER_COLOR_FIELD_OPACITY,
            },
          },
        },
      },
    ],
    activeChartKey: "abc",
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
  groupedColumnChart: {
    version: CONFIGURATOR_STATE_VERSION,
    state: "CONFIGURING_CHART",
    dataSource: {
      type: "sparql",
      url: "https://test.lindas.admin.ch/query",
    },
    layout: {
      type: "tab",
      activeField: undefined,
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
      blocks: [{ type: "chart", key: "2of7iJAjccuj", initialized: true }],
    },
    chartConfigs: [
      {
        key: "2of7iJAjccuj",
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
        cubes: [
          {
            iri: "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/2",
            filters: {},
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
              "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/anzahlanlagen",
          },
          color: {
            type: "segment",
            paletteId: "category10",
            colorMapping: {
              "https://ld.admin.ch/canton/1": "#1f77b4",
              "https://ld.admin.ch/canton/10": "#ff7f0e",
              "https://ld.admin.ch/canton/11": "#2ca02c",
              "https://ld.admin.ch/canton/12": "#d62728",
              "https://ld.admin.ch/canton/13": "#9467bd",
              "https://ld.admin.ch/canton/14": "#8c564b",
              "https://ld.admin.ch/canton/15": "#e377c2",
              "https://ld.admin.ch/canton/16": "#7f7f7f",
              "https://ld.admin.ch/canton/17": "#bcbd22",
              "https://ld.admin.ch/canton/18": "#17becf",
              "https://ld.admin.ch/canton/19": "#1f77b4",
              "https://ld.admin.ch/canton/2": "#ff7f0e",
              "https://ld.admin.ch/canton/20": "#2ca02c",
              "https://ld.admin.ch/canton/21": "#d62728",
              "https://ld.admin.ch/canton/22": "#9467bd",
              "https://ld.admin.ch/canton/23": "#8c564b",
              "https://ld.admin.ch/canton/24": "#e377c2",
              "https://ld.admin.ch/canton/25": "#7f7f7f",
              "https://ld.admin.ch/canton/26": "#bcbd22",
              "https://ld.admin.ch/canton/3": "#17becf",
              "https://ld.admin.ch/canton/4": "#1f77b4",
              "https://ld.admin.ch/canton/5": "#ff7f0e",
              "https://ld.admin.ch/canton/6": "#2ca02c",
              "https://ld.admin.ch/canton/7": "#d62728",
              "https://ld.admin.ch/canton/8": "#9467bd",
              "https://ld.admin.ch/canton/9": "#8c564b",
            },
          },
          segment: {
            componentId:
              "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/Kanton",
            sorting: {
              sortingType: "byAuto",
              sortingOrder: "asc",
            },
            type: "stacked",
            showValuesMapping: {},
          },
        },
        activeField: "segment",
      },
    ],
    activeChartKey: "2of7iJAjccuj",
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
} satisfies Record<string, ConfiguratorState>;

export const groupedColumnChartDimensions: Dimension[] = [
  {
    __typename: "TemporalDimension",
    timeFormat: "%Y",
    timeUnit: TimeUnit.Year,
    cubeIri:
      "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/2",
    id: stringifyComponentId({
      unversionedCubeIri:
        "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen",
      unversionedComponentIri:
        "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/Jahr",
    }),
    label: "Jahr",
    description: "Jahr",
    unit: "yr",
    scaleType: ScaleType.Interval,
    dataType: "http://www.w3.org/2001/XMLSchema#gYear",
    isNumerical: false,
    isKeyDimension: true,
    values: [
      { value: "2014", label: "2014" },
      { value: "2015", label: "2015" },
      { value: "2016", label: "2016" },
      { value: "2017", label: "2017" },
      { value: "2018", label: "2018" },
      { value: "2019", label: "2019" },
      { value: "2020", label: "2020" },
      { value: "2021", label: "2021" },
    ],
    related: [],
    hierarchy: null,
  },
  {
    __typename: "GeoShapesDimension",
    cubeIri:
      "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/2",
    id: stringifyComponentId({
      unversionedCubeIri:
        "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen",
      unversionedComponentIri:
        "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/Kanton",
    }),
    label: "Kanton",
    description: "Kanton",
    scaleType: ScaleType.Nominal,
    isNumerical: false,
    isKeyDimension: true,
    values: [
      {
        value: "https://ld.admin.ch/canton/1",
        label: "Zurich",
        alternateName: "ZH",
        identifier: "1",
        geometry:
          "https://geo.ld.admin.ch/boundaries/canton/geometry-g1/1:2023",
      },
      {
        value: "https://ld.admin.ch/canton/10",
        label: "Fribourg",
        alternateName: "FR",
        identifier: "10",
        geometry:
          "https://geo.ld.admin.ch/boundaries/canton/geometry-g1/10:2023",
      },
      {
        value: "https://ld.admin.ch/canton/11",
        label: "Solothurn",
        alternateName: "SO",
        identifier: "11",
        geometry:
          "https://geo.ld.admin.ch/boundaries/canton/geometry-g1/11:2023",
      },
      {
        value: "https://ld.admin.ch/canton/12",
        label: "Basel Stadt",
        alternateName: "BS",
        identifier: "12",
        geometry:
          "https://geo.ld.admin.ch/boundaries/canton/geometry-g1/12:2023",
      },
      {
        value: "https://ld.admin.ch/canton/13",
        label: "Basel Landschaft",
        alternateName: "BL",
        identifier: "13",
        geometry:
          "https://geo.ld.admin.ch/boundaries/canton/geometry-g1/13:2023",
      },
      {
        value: "https://ld.admin.ch/canton/14",
        label: "Schaffhausen",
        alternateName: "SH",
        identifier: "14",
        geometry:
          "https://geo.ld.admin.ch/boundaries/canton/geometry-g1/14:2023",
      },
      {
        value: "https://ld.admin.ch/canton/15",
        label: "Appenzell Ausserrhoden",
        alternateName: "AR",
        identifier: "15",
        geometry:
          "https://geo.ld.admin.ch/boundaries/canton/geometry-g1/15:2023",
      },
      {
        value: "https://ld.admin.ch/canton/16",
        label: "Appenzell Innerrhoden",
        alternateName: "AI",
        identifier: "16",
        geometry:
          "https://geo.ld.admin.ch/boundaries/canton/geometry-g1/16:2023",
      },
      {
        value: "https://ld.admin.ch/canton/17",
        label: "St Gallen",
        alternateName: "SG",
        identifier: "17",
        geometry:
          "https://geo.ld.admin.ch/boundaries/canton/geometry-g1/17:2023",
      },
      {
        value: "https://ld.admin.ch/canton/18",
        label: "Grisons",
        alternateName: "GR",
        identifier: "18",
        geometry:
          "https://geo.ld.admin.ch/boundaries/canton/geometry-g1/18:2023",
      },
      {
        value: "https://ld.admin.ch/canton/19",
        label: "Aargau",
        alternateName: "AG",
        identifier: "19",
        geometry:
          "https://geo.ld.admin.ch/boundaries/canton/geometry-g1/19:2023",
      },
      {
        value: "https://ld.admin.ch/canton/2",
        label: "Bern",
        alternateName: "BE",
        identifier: "2",
        geometry:
          "https://geo.ld.admin.ch/boundaries/canton/geometry-g1/2:2023",
      },
      {
        value: "https://ld.admin.ch/canton/20",
        label: "Thurgau",
        alternateName: "TG",
        identifier: "20",
        geometry:
          "https://geo.ld.admin.ch/boundaries/canton/geometry-g1/20:2023",
      },
      {
        value: "https://ld.admin.ch/canton/21",
        label: "Ticino",
        alternateName: "TI",
        identifier: "21",
        geometry:
          "https://geo.ld.admin.ch/boundaries/canton/geometry-g1/21:2023",
      },
      {
        value: "https://ld.admin.ch/canton/22",
        label: "Vaud",
        alternateName: "VD",
        identifier: "22",
        geometry:
          "https://geo.ld.admin.ch/boundaries/canton/geometry-g1/22:2023",
      },
      {
        value: "https://ld.admin.ch/canton/23",
        label: "Valais",
        alternateName: "VS",
        identifier: "23",
        geometry:
          "https://geo.ld.admin.ch/boundaries/canton/geometry-g1/23:2023",
      },
      {
        value: "https://ld.admin.ch/canton/24",
        label: "Neuchâtel",
        alternateName: "NE",
        identifier: "24",
        geometry:
          "https://geo.ld.admin.ch/boundaries/canton/geometry-g1/24:2023",
      },
      {
        value: "https://ld.admin.ch/canton/25",
        label: "Geneva",
        alternateName: "GE",
        identifier: "25",
        geometry:
          "https://geo.ld.admin.ch/boundaries/canton/geometry-g1/25:2023",
      },
      {
        value: "https://ld.admin.ch/canton/26",
        label: "Jura",
        alternateName: "JU",
        identifier: "26",
        geometry:
          "https://geo.ld.admin.ch/boundaries/canton/geometry-g1/26:2023",
      },
      {
        value: "https://ld.admin.ch/canton/3",
        label: "Lucerne",
        alternateName: "LU",
        identifier: "3",
        geometry:
          "https://geo.ld.admin.ch/boundaries/canton/geometry-g1/3:2023",
      },
      {
        value: "https://ld.admin.ch/canton/4",
        label: "Uri",
        alternateName: "UR",
        identifier: "4",
        geometry:
          "https://geo.ld.admin.ch/boundaries/canton/geometry-g1/4:2023",
      },
      {
        value: "https://ld.admin.ch/canton/5",
        label: "Schwyz",
        alternateName: "SZ",
        identifier: "5",
        geometry:
          "https://geo.ld.admin.ch/boundaries/canton/geometry-g1/5:2023",
      },
      {
        value: "https://ld.admin.ch/canton/6",
        label: "Obwalden",
        alternateName: "OW",
        identifier: "6",
        geometry:
          "https://geo.ld.admin.ch/boundaries/canton/geometry-g1/6:2023",
      },
      {
        value: "https://ld.admin.ch/canton/7",
        label: "Nidwalden",
        alternateName: "NW",
        identifier: "7",
        geometry:
          "https://geo.ld.admin.ch/boundaries/canton/geometry-g1/7:2023",
      },
      {
        value: "https://ld.admin.ch/canton/8",
        label: "Glarus",
        alternateName: "GL",
        identifier: "8",
        geometry:
          "https://geo.ld.admin.ch/boundaries/canton/geometry-g1/8:2023",
      },
      {
        value: "https://ld.admin.ch/canton/9",
        label: "Zug",
        alternateName: "ZG",
        identifier: "9",
        geometry:
          "https://geo.ld.admin.ch/boundaries/canton/geometry-g1/9:2023",
      },
    ],
    related: [],
    hierarchy: null,
  },
];

export const groupedColumnChartMeasures: Measure[] = [
  {
    __typename: "NumericalMeasure",
    isCurrency: false,
    isDecimal: false,
    cubeIri:
      "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/2",
    id: stringifyComponentId({
      unversionedCubeIri:
        "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen",
      unversionedComponentIri:
        "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/anzahlanlagen",
    }),
    label: "Anzahl Anlagen",
    description: "Anzahl Anlagen pro Jahr",
    scaleType: ScaleType.Ratio,
    isNumerical: false,
    isKeyDimension: false,
    values: [
      { value: "", label: "" },
      { value: "10", label: "10" },
      { value: "103", label: "103" },
      { value: "1030", label: "1030" },
      { value: "1034", label: "1034" },
      { value: "107", label: "107" },
      { value: "111", label: "111" },
      { value: "1138", label: "1138" },
      { value: "115", label: "115" },
      { value: "1153", label: "1153" },
      { value: "117", label: "117" },
      { value: "118", label: "118" },
      { value: "1181", label: "1181" },
      { value: "12", label: "12" },
      { value: "120", label: "120" },
      { value: "1205", label: "1205" },
      { value: "122", label: "122" },
      { value: "1250", label: "1250" },
      { value: "1269", label: "1269" },
      { value: "129", label: "129" },
      { value: "13", label: "13" },
      { value: "132", label: "132" },
      { value: "134", label: "134" },
      { value: "1343", label: "1343" },
      { value: "1358", label: "1358" },
      { value: "137", label: "137" },
      { value: "138", label: "138" },
      { value: "1390", label: "1390" },
      { value: "1403", label: "1403" },
      { value: "141", label: "141" },
      { value: "1413", label: "1413" },
      { value: "142", label: "142" },
      { value: "1421", label: "1421" },
      { value: "143", label: "143" },
      { value: "145", label: "145" },
      { value: "146", label: "146" },
      { value: "1462", label: "1462" },
      { value: "1469", label: "1469" },
      { value: "147", label: "147" },
      { value: "15", label: "15" },
      { value: "160", label: "160" },
      { value: "1613", label: "1613" },
      { value: "1618", label: "1618" },
      { value: "163", label: "163" },
      { value: "164", label: "164" },
      { value: "1657", label: "1657" },
      { value: "168", label: "168" },
      { value: "1735", label: "1735" },
      { value: "176", label: "176" },
      { value: "1806", label: "1806" },
      { value: "184", label: "184" },
      { value: "1910", label: "1910" },
      { value: "192", label: "192" },
      { value: "195", label: "195" },
      { value: "20", label: "20" },
      { value: "203", label: "203" },
      { value: "2031", label: "2031" },
      { value: "205", label: "205" },
      { value: "2054", label: "2054" },
      { value: "2125", label: "2125" },
      { value: "219", label: "219" },
      { value: "225", label: "225" },
      { value: "2303", label: "2303" },
      { value: "236", label: "236" },
      { value: "2414", label: "2414" },
      { value: "2423", label: "2423" },
      { value: "25", label: "25" },
      { value: "250", label: "250" },
      { value: "252", label: "252" },
      { value: "27", label: "27" },
      { value: "270", label: "270" },
      { value: "28", label: "28" },
      { value: "29", label: "29" },
      { value: "298", label: "298" },
      { value: "2997", label: "2997" },
      { value: "30", label: "30" },
      { value: "307", label: "307" },
      { value: "31", label: "31" },
      { value: "321", label: "321" },
      { value: "326", label: "326" },
      { value: "341", label: "341" },
      { value: "343", label: "343" },
      { value: "3558", label: "3558" },
      { value: "3596", label: "3596" },
      { value: "361", label: "361" },
      { value: "364", label: "364" },
      { value: "37", label: "37" },
      { value: "376", label: "376" },
      { value: "377", label: "377" },
      { value: "38", label: "38" },
      { value: "387", label: "387" },
      { value: "39", label: "39" },
      { value: "390", label: "390" },
      { value: "398", label: "398" },
      { value: "399", label: "399" },
      { value: "402", label: "402" },
      { value: "41", label: "41" },
      { value: "410", label: "410" },
      { value: "413", label: "413" },
      { value: "415", label: "415" },
      { value: "42", label: "42" },
      { value: "420", label: "420" },
      { value: "426", label: "426" },
      { value: "43", label: "43" },
      { value: "45", label: "45" },
      { value: "458", label: "458" },
      { value: "463", label: "463" },
      { value: "468", label: "468" },
      { value: "47", label: "47" },
      { value: "48", label: "48" },
      { value: "481", label: "481" },
      { value: "482", label: "482" },
      { value: "496", label: "496" },
      { value: "497", label: "497" },
      { value: "50", label: "50" },
      { value: "51", label: "51" },
      { value: "510", label: "510" },
      { value: "52", label: "52" },
      { value: "526", label: "526" },
      { value: "532", label: "532" },
      { value: "568", label: "568" },
      { value: "570", label: "570" },
      { value: "572", label: "572" },
      { value: "575", label: "575" },
      { value: "584", label: "584" },
      { value: "586", label: "586" },
      { value: "59", label: "59" },
      { value: "608", label: "608" },
      { value: "609", label: "609" },
      { value: "611", label: "611" },
      { value: "627", label: "627" },
      { value: "63", label: "63" },
      { value: "641", label: "641" },
      { value: "643", label: "643" },
      { value: "65", label: "65" },
      { value: "669", label: "669" },
      { value: "676", label: "676" },
      { value: "68", label: "68" },
      { value: "682", label: "682" },
      { value: "69", label: "69" },
      { value: "696", label: "696" },
      { value: "7", label: "7" },
      { value: "709", label: "709" },
      { value: "71", label: "71" },
      { value: "727", label: "727" },
      { value: "728", label: "728" },
      { value: "730", label: "730" },
      { value: "735", label: "735" },
      { value: "74", label: "74" },
      { value: "75", label: "75" },
      { value: "752", label: "752" },
      { value: "764", label: "764" },
      { value: "77", label: "77" },
      { value: "772", label: "772" },
      { value: "777", label: "777" },
      { value: "78", label: "78" },
      { value: "793", label: "793" },
      { value: "796", label: "796" },
      { value: "810", label: "810" },
      { value: "857", label: "857" },
      { value: "870", label: "870" },
      { value: "872", label: "872" },
      { value: "877", label: "877" },
      { value: "88", label: "88" },
      { value: "91", label: "91" },
      { value: "939", label: "939" },
      { value: "948", label: "948" },
      { value: "95", label: "95" },
      { value: "963", label: "963" },
      { value: "97", label: "97" },
      { value: "99", label: "99" },
      { value: "992", label: "992" },
    ],
    related: [],
    limits: [],
  },
  {
    __typename: "NumericalMeasure",
    isCurrency: false,
    isDecimal: false,
    cubeIri:
      "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/2",
    id: stringifyComponentId({
      unversionedCubeIri:
        "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen",
      unversionedComponentIri:
        "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/installierteleistungKw",
    }),
    label: "Installierte Leistung Kw",
    description: "Installierte Leistung in Kw",
    unit: "kW",
    scaleType: ScaleType.Ratio,
    isNumerical: false,
    isKeyDimension: false,
    values: [
      { value: "", label: "" },
      { value: "1006.58", label: "1006.58" },
      { value: "101.28", label: "101.28" },
      { value: "1032.23", label: "1032.23" },
      { value: "1038.35", label: "1038.35" },
      { value: "10415.9", label: "10415.9" },
      { value: "1056.81", label: "1056.81" },
      { value: "1067.53", label: "1067.53" },
      { value: "10728.63", label: "10728.63" },
      { value: "10764.11", label: "10764.11" },
      { value: "1095.12", label: "1095.12" },
      { value: "1100.87", label: "1100.87" },
      { value: "11077.74", label: "11077.74" },
      { value: "11343.42", label: "11343.42" },
      { value: "11388.17", label: "11388.17" },
      { value: "11611.16", label: "11611.16" },
      { value: "11785.94", label: "11785.94" },
      { value: "118.21", label: "118.21" },
      { value: "11866.82", label: "11866.82" },
      { value: "11889.91", label: "11889.91" },
      { value: "12080.04", label: "12080.04" },
      { value: "12487.12", label: "12487.12" },
      { value: "12521.17", label: "12521.17" },
      { value: "12703.22", label: "12703.22" },
      { value: "13030.98", label: "13030.98" },
      { value: "13134.59", label: "13134.59" },
      { value: "1323.09", label: "1323.09" },
      { value: "1323.93", label: "1323.93" },
      { value: "1324.44", label: "1324.44" },
      { value: "13662.08", label: "13662.08" },
      { value: "140.71", label: "140.71" },
      { value: "14062.04", label: "14062.04" },
      { value: "1424.51", label: "1424.51" },
      { value: "14316.4", label: "14316.4" },
      { value: "1474.81", label: "1474.81" },
      { value: "1477.54", label: "1477.54" },
      { value: "152.35", label: "152.35" },
      { value: "1537.79", label: "1537.79" },
      { value: "15586.71", label: "15586.71" },
      { value: "15808.79", label: "15808.79" },
      { value: "15845.65", label: "15845.65" },
      { value: "16395.23", label: "16395.23" },
      { value: "16559.87", label: "16559.87" },
      { value: "1660.49", label: "1660.49" },
      { value: "169.02", label: "169.02" },
      { value: "17214.77", label: "17214.77" },
      { value: "1733.12", label: "1733.12" },
      { value: "17534.8", label: "17534.8" },
      { value: "1765.89", label: "1765.89" },
      { value: "1792.63", label: "1792.63" },
      { value: "1830.19", label: "1830.19" },
      { value: "18301.59", label: "18301.59" },
      { value: "184.5", label: "184.5" },
      { value: "1917.66", label: "1917.66" },
      { value: "19253.9", label: "19253.9" },
      { value: "19396.56", label: "19396.56" },
      { value: "1966.93", label: "1966.93" },
      { value: "197.08", label: "197.08" },
      { value: "2026.03", label: "2026.03" },
      { value: "2058.93", label: "2058.93" },
      { value: "212.33", label: "212.33" },
      { value: "21320.3", label: "21320.3" },
      { value: "2139.65", label: "2139.65" },
      { value: "21396.58", label: "21396.58" },
      { value: "21565.12", label: "21565.12" },
      { value: "21969.67", label: "21969.67" },
      { value: "22898.69", label: "22898.69" },
      { value: "2521.33", label: "2521.33" },
      { value: "2554.85", label: "2554.85" },
      { value: "2557.92", label: "2557.92" },
      { value: "2580.74", label: "2580.74" },
      { value: "2641.52", label: "2641.52" },
      { value: "2690.87", label: "2690.87" },
      { value: "26933.06", label: "26933.06" },
      { value: "272.82", label: "272.82" },
      { value: "27692.74", label: "27692.74" },
      { value: "2795.82", label: "2795.82" },
      { value: "283.79", label: "283.79" },
      { value: "2841.06", label: "2841.06" },
      { value: "2858.88", label: "2858.88" },
      { value: "2888.83", label: "2888.83" },
      { value: "29008.79", label: "29008.79" },
      { value: "29552.63", label: "29552.63" },
      { value: "29982.59", label: "29982.59" },
      { value: "30026.93", label: "30026.93" },
      { value: "3050.16", label: "3050.16" },
      { value: "3078.48", label: "3078.48" },
      { value: "31628.99", label: "31628.99" },
      { value: "31783.16", label: "31783.16" },
      { value: "3183.32", label: "3183.32" },
      { value: "31975.82", label: "31975.82" },
      { value: "3250.84", label: "3250.84" },
      { value: "326.88", label: "326.88" },
      { value: "329.72", label: "329.72" },
      { value: "3313.32", label: "3313.32" },
      { value: "33271.49", label: "33271.49" },
      { value: "3330.88", label: "3330.88" },
      { value: "335.1", label: "335.1" },
      { value: "3389.76", label: "3389.76" },
      { value: "341.11", label: "341.11" },
      { value: "3416.62", label: "3416.62" },
      { value: "348.55", label: "348.55" },
      { value: "3494.32", label: "3494.32" },
      { value: "3563.96", label: "3563.96" },
      { value: "357.46", label: "357.46" },
      { value: "3601.89", label: "3601.89" },
      { value: "3634.66", label: "3634.66" },
      { value: "3644.58", label: "3644.58" },
      { value: "3782.77", label: "3782.77" },
      { value: "3839.21", label: "3839.21" },
      { value: "3869.33", label: "3869.33" },
      { value: "387.56", label: "387.56" },
      { value: "39795.07", label: "39795.07" },
      { value: "400.25", label: "400.25" },
      { value: "4085.36", label: "4085.36" },
      { value: "4216.15", label: "4216.15" },
      { value: "4233.35", label: "4233.35" },
      { value: "42433.63", label: "42433.63" },
      { value: "42474.12", label: "42474.12" },
      { value: "42738.4", label: "42738.4" },
      { value: "4295.18", label: "4295.18" },
      { value: "432.69", label: "432.69" },
      { value: "4329.53", label: "4329.53" },
      { value: "44346.52", label: "44346.52" },
      { value: "4567.77", label: "4567.77" },
      { value: "45792.91", label: "45792.91" },
      { value: "47.23", label: "47.23" },
      { value: "474.45", label: "474.45" },
      { value: "4774.99", label: "4774.99" },
      { value: "478.5", label: "478.5" },
      { value: "48.38", label: "48.38" },
      { value: "48500.21", label: "48500.21" },
      { value: "49387.39", label: "49387.39" },
      { value: "49758.79", label: "49758.79" },
      { value: "510.46", label: "510.46" },
      { value: "512.68", label: "512.68" },
      { value: "5180.58", label: "5180.58" },
      { value: "5212.79", label: "5212.79" },
      { value: "5260.57", label: "5260.57" },
      { value: "52707.07", label: "52707.07" },
      { value: "54500.55", label: "54500.55" },
      { value: "5647.01", label: "5647.01" },
      { value: "56854.82", label: "56854.82" },
      { value: "5721.05", label: "5721.05" },
      { value: "57372.91", label: "57372.91" },
      { value: "5850.1", label: "5850.1" },
      { value: "5888.31", label: "5888.31" },
      { value: "589.14", label: "589.14" },
      { value: "592.45", label: "592.45" },
      { value: "600.04", label: "600.04" },
      { value: "6135.5", label: "6135.5" },
      { value: "6142.33", label: "6142.33" },
      { value: "6146.03", label: "6146.03" },
      { value: "62795.35", label: "62795.35" },
      { value: "629.29", label: "629.29" },
      { value: "630.67", label: "630.67" },
      { value: "638.33", label: "638.33" },
      { value: "641.52", label: "641.52" },
      { value: "6427.22", label: "6427.22" },
      { value: "675.18", label: "675.18" },
      { value: "6792.07", label: "6792.07" },
      { value: "6932.4", label: "6932.4" },
      { value: "69843.65", label: "69843.65" },
      { value: "70.12", label: "70.12" },
      { value: "711.61", label: "711.61" },
      { value: "7234.55", label: "7234.55" },
      { value: "73.19", label: "73.19" },
      { value: "733.49", label: "733.49" },
      { value: "7336.32", label: "7336.32" },
      { value: "7362.87", label: "7362.87" },
      { value: "7397.31", label: "7397.31" },
      { value: "7522.37", label: "7522.37" },
      { value: "7611.65", label: "7611.65" },
      { value: "763.53", label: "763.53" },
      { value: "780.34", label: "780.34" },
      { value: "7973.19", label: "7973.19" },
      { value: "80.78", label: "80.78" },
      { value: "8090.02", label: "8090.02" },
      { value: "8175.15", label: "8175.15" },
      { value: "8201.6", label: "8201.6" },
      { value: "826.45", label: "826.45" },
      { value: "8334.9", label: "8334.9" },
      { value: "836.91", label: "836.91" },
      { value: "8385.2", label: "8385.2" },
      { value: "8458.23", label: "8458.23" },
      { value: "861.36", label: "861.36" },
      { value: "865.46", label: "865.46" },
      { value: "8790.23", label: "8790.23" },
      { value: "8796.18", label: "8796.18" },
      { value: "8887.27", label: "8887.27" },
      { value: "89.41", label: "89.41" },
      { value: "896.0", label: "896.0" },
      { value: "918.7", label: "918.7" },
      { value: "9323.94", label: "9323.94" },
      { value: "942.31", label: "942.31" },
      { value: "9422.42", label: "9422.42" },
      { value: "9450.89", label: "9450.89" },
      { value: "9495.05", label: "9495.05" },
      { value: "9669.9", label: "9669.9" },
      { value: "98.28", label: "98.28" },
    ],
    related: [],
    limits: [],
  },
  {
    __typename: "NumericalMeasure",
    isCurrency: false,
    isDecimal: false,
    cubeIri:
      "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/2",
    id: stringifyComponentId({
      unversionedCubeIri:
        "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen",
      unversionedComponentIri:
        "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/verguetungchf",
    }),
    label: "Vergütung",
    description: "Vergütung in CHF",
    scaleType: ScaleType.Ratio,
    isNumerical: false,
    isKeyDimension: false,
    values: [
      { value: "", label: "" },
      { value: "10170765.55", label: "10170765.55" },
      { value: "10203884.44", label: "10203884.44" },
      { value: "1021502.7", label: "1021502.7" },
      { value: "1032860.5", label: "1032860.5" },
      { value: "10594587.58", label: "10594587.58" },
      { value: "11289964.6", label: "11289964.6" },
      { value: "1134793.33", label: "1134793.33" },
      { value: "1160773.75", label: "1160773.75" },
      { value: "1165199.6", label: "1165199.6" },
      { value: "11870274.18", label: "11870274.18" },
      { value: "119944.0", label: "119944.0" },
      { value: "1205752.5", label: "1205752.5" },
      { value: "12064405.53", label: "12064405.53" },
      { value: "12117282.55", label: "12117282.55" },
      { value: "124164.5", label: "124164.5" },
      { value: "12532167.2", label: "12532167.2" },
      { value: "1254470.6", label: "1254470.6" },
      { value: "12954011.45", label: "12954011.45" },
      { value: "1338641.2", label: "1338641.2" },
      { value: "1338669.5", label: "1338669.5" },
      { value: "13503088.99", label: "13503088.99" },
      { value: "1362348.35", label: "1362348.35" },
      { value: "137261.5", label: "137261.5" },
      { value: "1373261.13", label: "1373261.13" },
      { value: "14005430.5", label: "14005430.5" },
      { value: "1430317.13", label: "1430317.13" },
      { value: "14312130.55", label: "14312130.55" },
      { value: "14313010.6", label: "14313010.6" },
      { value: "14511288.75", label: "14511288.75" },
      { value: "149419.0", label: "149419.0" },
      { value: "150802.5", label: "150802.5" },
      { value: "15105175.95", label: "15105175.95" },
      { value: "15114283.29", label: "15114283.29" },
      { value: "1516390.4", label: "1516390.4" },
      { value: "152294.0", label: "152294.0" },
      { value: "1527294.2", label: "1527294.2" },
      { value: "15397368.19", label: "15397368.19" },
      { value: "15788653.95", label: "15788653.95" },
      { value: "1613472.21", label: "1613472.21" },
      { value: "16211498.65", label: "16211498.65" },
      { value: "1666876.95", label: "1666876.95" },
      { value: "1692604.8", label: "1692604.8" },
      { value: "1717971.1", label: "1717971.1" },
      { value: "17285982.5", label: "17285982.5" },
      { value: "1758019.05", label: "1758019.05" },
      { value: "17812600.6", label: "17812600.6" },
      { value: "18307397.28", label: "18307397.28" },
      { value: "18597620.25", label: "18597620.25" },
      { value: "18929675.65", label: "18929675.65" },
      { value: "189642.0", label: "189642.0" },
      { value: "1900257.5", label: "1900257.5" },
      { value: "19042926.22", label: "19042926.22" },
      { value: "19107288.5", label: "19107288.5" },
      { value: "19513823.47", label: "19513823.47" },
      { value: "20001632.7", label: "20001632.7" },
      { value: "20041567.45", label: "20041567.45" },
      { value: "20155896.75", label: "20155896.75" },
      { value: "2075456.6", label: "2075456.6" },
      { value: "2078071.9", label: "2078071.9" },
      { value: "21248427.65", label: "21248427.65" },
      { value: "2129851.9", label: "2129851.9" },
      { value: "2184658.2", label: "2184658.2" },
      { value: "222545.3", label: "222545.3" },
      { value: "224403.0", label: "224403.0" },
      { value: "22460655.6", label: "22460655.6" },
      { value: "2266004.8", label: "2266004.8" },
      { value: "234532.5", label: "234532.5" },
      { value: "2361838.1", label: "2361838.1" },
      { value: "2403550.0", label: "2403550.0" },
      { value: "2406718.18", label: "2406718.18" },
      { value: "2411093.2", label: "2411093.2" },
      { value: "2475818.95", label: "2475818.95" },
      { value: "249308.0", label: "249308.0" },
      { value: "24963332.8", label: "24963332.8" },
      { value: "2549545.55", label: "2549545.55" },
      { value: "255805.5", label: "255805.5" },
      { value: "2568898.5", label: "2568898.5" },
      { value: "25792302.6", label: "25792302.6" },
      { value: "2654323.74", label: "2654323.74" },
      { value: "2721705.11", label: "2721705.11" },
      { value: "275914.8", label: "275914.8" },
      { value: "28392931.71", label: "28392931.71" },
      { value: "2854087.7", label: "2854087.7" },
      { value: "28740231.25", label: "28740231.25" },
      { value: "2916566.48", label: "2916566.48" },
      { value: "2920144.2", label: "2920144.2" },
      { value: "2955329.95", label: "2955329.95" },
      { value: "3033214.25", label: "3033214.25" },
      { value: "306915.0", label: "306915.0" },
      { value: "3074972.9", label: "3074972.9" },
      { value: "317440.5", label: "317440.5" },
      { value: "320276.6", label: "320276.6" },
      { value: "3236612.7", label: "3236612.7" },
      { value: "32534437.65", label: "32534437.65" },
      { value: "32891798.11", label: "32891798.11" },
      { value: "3306255.9", label: "3306255.9" },
      { value: "3319109.2", label: "3319109.2" },
      { value: "3378510.13", label: "3378510.13" },
      { value: "3416662.19", label: "3416662.19" },
      { value: "3420105.8", label: "3420105.8" },
      { value: "345632.54", label: "345632.54" },
      { value: "348858.3", label: "348858.3" },
      { value: "35652626.99", label: "35652626.99" },
      { value: "3567268.67", label: "3567268.67" },
      { value: "3627556.2", label: "3627556.2" },
      { value: "373505.2", label: "373505.2" },
      { value: "374148.5", label: "374148.5" },
      { value: "378976.0", label: "378976.0" },
      { value: "3831401.0", label: "3831401.0" },
      { value: "3895177.13", label: "3895177.13" },
      { value: "3928301.7", label: "3928301.7" },
      { value: "3967181.13", label: "3967181.13" },
      { value: "399534.02", label: "399534.02" },
      { value: "4035991.6", label: "4035991.6" },
      { value: "4262461.38", label: "4262461.38" },
      { value: "431420.5", label: "431420.5" },
      { value: "4315696.36", label: "4315696.36" },
      { value: "437371.1", label: "437371.1" },
      { value: "4380121.8", label: "4380121.8" },
      { value: "4415384.1", label: "4415384.1" },
      { value: "448931.3", label: "448931.3" },
      { value: "449400.0", label: "449400.0" },
      { value: "4635081.5", label: "4635081.5" },
      { value: "4727203.6", label: "4727203.6" },
      { value: "480305.5", label: "480305.5" },
      { value: "485978.25", label: "485978.25" },
      { value: "487086.5", label: "487086.5" },
      { value: "4899389.1", label: "4899389.1" },
      { value: "4913858.15", label: "4913858.15" },
      { value: "4919422.25", label: "4919422.25" },
      { value: "5097406.3", label: "5097406.3" },
      { value: "511811.65", label: "511811.65" },
      { value: "5211067.0", label: "5211067.0" },
      { value: "5231535.9", label: "5231535.9" },
      { value: "5259540.15", label: "5259540.15" },
      { value: "5280866.17", label: "5280866.17" },
      { value: "5625498.25", label: "5625498.25" },
      { value: "5651117.5", label: "5651117.5" },
      { value: "5653026.65", label: "5653026.65" },
      { value: "567663.0", label: "567663.0" },
      { value: "570929.3", label: "570929.3" },
      { value: "5848213.9", label: "5848213.9" },
      { value: "58880.0", label: "58880.0" },
      { value: "6038480.74", label: "6038480.74" },
      { value: "6082202.95", label: "6082202.95" },
      { value: "609779.9", label: "609779.9" },
      { value: "620373.5", label: "620373.5" },
      { value: "622270.95", label: "622270.95" },
      { value: "622925.9", label: "622925.9" },
      { value: "6239205.1", label: "6239205.1" },
      { value: "6245855.7", label: "6245855.7" },
      { value: "6296860.29", label: "6296860.29" },
      { value: "6432230.55", label: "6432230.55" },
      { value: "646300.1", label: "646300.1" },
      { value: "654671.5", label: "654671.5" },
      { value: "658181.4", label: "658181.4" },
      { value: "6611188.5", label: "6611188.5" },
      { value: "6662784.45", label: "6662784.45" },
      { value: "6721101.0", label: "6721101.0" },
      { value: "6898636.45", label: "6898636.45" },
      { value: "715086.15", label: "715086.15" },
      { value: "717394.8", label: "717394.8" },
      { value: "7268825.73", label: "7268825.73" },
      { value: "751045.7", label: "751045.7" },
      { value: "7519472.7", label: "7519472.7" },
      { value: "7551095.95", label: "7551095.95" },
      { value: "7559945.1", label: "7559945.1" },
      { value: "7693074.9", label: "7693074.9" },
      { value: "7762259.9", label: "7762259.9" },
      { value: "7803615.24", label: "7803615.24" },
      { value: "785092.5", label: "785092.5" },
      { value: "7899538.75", label: "7899538.75" },
      { value: "7919610.26", label: "7919610.26" },
      { value: "792313.4", label: "792313.4" },
      { value: "800714.2", label: "800714.2" },
      { value: "800849.4", label: "800849.4" },
      { value: "801958.55", label: "801958.55" },
      { value: "802750.8", label: "802750.8" },
      { value: "8079240.21", label: "8079240.21" },
      { value: "81474.5", label: "81474.5" },
      { value: "8201186.69", label: "8201186.69" },
      { value: "828468.9", label: "828468.9" },
      { value: "8316820.99", label: "8316820.99" },
      { value: "849134.8", label: "849134.8" },
      { value: "862566.0", label: "862566.0" },
      { value: "8642850.87", label: "8642850.87" },
      { value: "8703952.81", label: "8703952.81" },
      { value: "9142656.9", label: "9142656.9" },
      { value: "9144332.2", label: "9144332.2" },
      { value: "9217205.0", label: "9217205.0" },
      { value: "9238568.58", label: "9238568.58" },
      { value: "934724.6", label: "934724.6" },
      { value: "936632.45", label: "936632.45" },
      { value: "9460965.0", label: "9460965.0" },
      { value: "95104.5", label: "95104.5" },
      { value: "953934.1", label: "953934.1" },
      { value: "9712555.6", label: "9712555.6" },
      { value: "982577.0", label: "982577.0" },
      { value: "991739.2", label: "991739.2" },
    ],
    related: [],
    limits: [],
  },
];

/**
 * Configs merging Photovoltaik and Median Electricity Consumption
 */
export const configJoinedCubes: Partial<
  Record<ChartConfig["chartType"], ChartConfig>
> = {
  table: {
    key: "NF9PKwRtOaOI",
    version: CHART_CONFIG_VERSION,
    activeField: undefined,
    interactiveFiltersConfig: undefined,
    meta: {
      title: { en: "", de: "", fr: "", it: "" },
      description: { en: "", de: "", fr: "", it: "" },
      label: { en: "", de: "", fr: "", it: "" },
    },
    cubes: [
      {
        iri: "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/9",
        filters: {
          [stringifyComponentId({
            unversionedCubeIri:
              "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen",
            unversionedComponentIri:
              "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/Jahr",
          })]: { type: "single", value: "2020" },
        },
        joinBy: [
          stringifyComponentId({
            unversionedCubeIri:
              "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen",
            unversionedComponentIri:
              "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/Jahr",
          }),
          stringifyComponentId({
            unversionedCubeIri:
              "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen",
            unversionedComponentIri:
              "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/Kanton",
          }),
        ],
      },
      {
        iri: "https://energy.ld.admin.ch/elcom/electricityprice-canton",
        filters: {
          [stringifyComponentId({
            unversionedCubeIri:
              "https://energy.ld.admin.ch/elcom/electricityprice-canton",
            unversionedComponentIri:
              "https://energy.ld.admin.ch/elcom/electricityprice/dimension/period",
          })]: {
            type: "single",
            value: "2020",
          },
          [stringifyComponentId({
            unversionedCubeIri:
              "https://energy.ld.admin.ch/elcom/electricityprice-canton",
            unversionedComponentIri:
              "https://energy.ld.admin.ch/elcom/electricityprice/dimension/category",
          })]: {
            type: "single",
            value:
              "https://energy.ld.admin.ch/elcom/electricityprice/category/C1",
          },
          [stringifyComponentId({
            unversionedCubeIri:
              "https://energy.ld.admin.ch/elcom/electricityprice-canton",
            unversionedComponentIri:
              "https://energy.ld.admin.ch/elcom/electricityprice/dimension/product",
          })]: {
            type: "single",
            value:
              "https://energy.ld.admin.ch/elcom/electricityprice/product/cheapest",
          },
        },
        joinBy: [
          stringifyComponentId({
            unversionedCubeIri:
              "https://energy.ld.admin.ch/elcom/electricityprice-canton",
            unversionedComponentIri:
              "https://energy.ld.admin.ch/elcom/electricityprice/dimension/period",
          }),
          stringifyComponentId({
            unversionedCubeIri:
              "https://energy.ld.admin.ch/elcom/electricityprice-canton",
            unversionedComponentIri:
              "https://energy.ld.admin.ch/elcom/electricityprice/dimension/canton",
          }),
        ],
      },
    ],
    limits: {},
    chartType: "table",
    settings: { showSearch: true, showAllRows: false },
    sorting: [],
    fields: {
      joinBy__0: {
        componentId: "joinBy__0",
        componentType: "TemporalDimension",
        index: 0,
        isGroup: false,
        isHidden: false,
        columnStyle: {
          textStyle: "regular",
          type: "text",
          textColor: "#000",
          columnColor: "#fff",
        },
      },
      joinBy__1: {
        componentId: "joinBy__1",
        componentType: "GeoShapesDimension",
        index: 1,
        isGroup: false,
        isHidden: false,
        columnStyle: {
          textStyle: "regular",
          type: "text",
          textColor: "#000",
          columnColor: "#fff",
        },
      },
      [stringifyComponentId({
        unversionedCubeIri:
          "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen",
        unversionedComponentIri:
          "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/AnzahlAnlagen",
      })]: {
        componentId: stringifyComponentId({
          unversionedCubeIri:
            "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen",
          unversionedComponentIri:
            "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/AnzahlAnlagen",
        }),
        componentType: "NumericalMeasure",
        index: 2,
        isGroup: false,
        isHidden: false,
        columnStyle: {
          textStyle: "regular",
          type: "text",
          textColor: "#000",
          columnColor: "#fff",
        },
      },
      [stringifyComponentId({
        unversionedCubeIri:
          "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen",
        unversionedComponentIri:
          "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/InstallierteLeistungkW",
      })]: {
        componentId: stringifyComponentId({
          unversionedCubeIri:
            "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen",
          unversionedComponentIri:
            "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/InstallierteLeistungkW",
        }),
        componentType: "NumericalMeasure",
        index: 3,
        isGroup: false,
        isHidden: false,
        columnStyle: {
          textStyle: "regular",
          type: "text",
          textColor: "#000",
          columnColor: "#fff",
        },
      },
      [stringifyComponentId({
        unversionedCubeIri:
          "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen",
        unversionedComponentIri:
          "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/VerguetungCHF",
      })]: {
        componentId: stringifyComponentId({
          unversionedCubeIri:
            "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen",
          unversionedComponentIri:
            "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/VerguetungCHF",
        }),
        componentType: "NumericalMeasure",
        index: 4,
        isGroup: false,
        isHidden: false,
        columnStyle: {
          textStyle: "regular",
          type: "text",
          textColor: "#000",
          columnColor: "#fff",
        },
      },
      [stringifyComponentId({
        unversionedCubeIri:
          "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen",
        unversionedComponentIri:
          "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/AnzahlAnlagenPro100000Einwohner",
      })]: {
        componentId: stringifyComponentId({
          unversionedCubeIri:
            "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen",
          unversionedComponentIri:
            "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/AnzahlAnlagenPro100000Einwohner",
        }),
        componentType: "NumericalMeasure",
        index: 5,
        isGroup: false,
        isHidden: false,
        columnStyle: {
          textStyle: "regular",
          type: "text",
          textColor: "#000",
          columnColor: "#fff",
        },
      },
      [stringifyComponentId({
        unversionedCubeIri:
          "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen",
        unversionedComponentIri:
          "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/InstallierteLeistungkWPro100000Einwohner",
      })]: {
        componentId: stringifyComponentId({
          unversionedCubeIri:
            "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen",
          unversionedComponentIri:
            "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/InstallierteLeistungkWPro100000Einwohner",
        }),
        componentType: "NumericalMeasure",
        index: 6,
        isGroup: false,
        isHidden: false,
        columnStyle: {
          textStyle: "regular",
          type: "text",
          textColor: "#000",
          columnColor: "#fff",
        },
      },
      [stringifyComponentId({
        unversionedCubeIri:
          "https://energy.ld.admin.ch/elcom/electricityprice-canton",
        unversionedComponentIri:
          "https://energy.ld.admin.ch/elcom/electricityprice/dimension/category",
      })]: {
        componentId: stringifyComponentId({
          unversionedCubeIri:
            "https://energy.ld.admin.ch/elcom/electricityprice-canton",
          unversionedComponentIri:
            "https://energy.ld.admin.ch/elcom/electricityprice/dimension/category",
        }),
        componentType: "NominalDimension",
        index: 7,
        isGroup: false,
        isHidden: false,
        columnStyle: {
          textStyle: "regular",
          type: "text",
          textColor: "#000",
          columnColor: "#fff",
        },
      },
      [stringifyComponentId({
        unversionedCubeIri:
          "https://energy.ld.admin.ch/elcom/electricityprice-canton",
        unversionedComponentIri:
          "https://energy.ld.admin.ch/elcom/electricityprice/dimension/product",
      })]: {
        componentId: stringifyComponentId({
          unversionedCubeIri:
            "https://energy.ld.admin.ch/elcom/electricityprice-canton",
          unversionedComponentIri:
            "https://energy.ld.admin.ch/elcom/electricityprice/dimension/product",
        }),
        componentType: "NominalDimension",
        index: 8,
        isGroup: false,
        isHidden: false,
        columnStyle: {
          textStyle: "regular",
          type: "text",
          textColor: "#000",
          columnColor: "#fff",
        },
      },
      [stringifyComponentId({
        unversionedCubeIri:
          "https://energy.ld.admin.ch/elcom/electricityprice-canton",
        unversionedComponentIri:
          "https://energy.ld.admin.ch/elcom/electricityprice/dimension/total",
      })]: {
        componentId: stringifyComponentId({
          unversionedCubeIri:
            "https://energy.ld.admin.ch/elcom/electricityprice-canton",
          unversionedComponentIri:
            "https://energy.ld.admin.ch/elcom/electricityprice/dimension/total",
        }),
        componentType: "NumericalMeasure",
        index: 9,
        isGroup: false,
        isHidden: false,
        columnStyle: {
          textStyle: "regular",
          type: "text",
          textColor: "#000",
          columnColor: "#fff",
        },
      },
      [stringifyComponentId({
        unversionedCubeIri:
          "https://energy.ld.admin.ch/elcom/electricityprice-canton",
        unversionedComponentIri:
          "https://energy.ld.admin.ch/elcom/electricityprice/dimension/gridusage",
      })]: {
        componentId: stringifyComponentId({
          unversionedCubeIri:
            "https://energy.ld.admin.ch/elcom/electricityprice-canton",
          unversionedComponentIri:
            "https://energy.ld.admin.ch/elcom/electricityprice/dimension/gridusage",
        }),
        componentType: "NumericalMeasure",
        index: 10,
        isGroup: false,
        isHidden: false,
        columnStyle: {
          textStyle: "regular",
          type: "text",
          textColor: "#000",
          columnColor: "#fff",
        },
      },
      [stringifyComponentId({
        unversionedCubeIri:
          "https://energy.ld.admin.ch/elcom/electricityprice-canton",
        unversionedComponentIri:
          "https://energy.ld.admin.ch/elcom/electricityprice/dimension/energy",
      })]: {
        componentId: stringifyComponentId({
          unversionedCubeIri:
            "https://energy.ld.admin.ch/elcom/electricityprice-canton",
          unversionedComponentIri:
            "https://energy.ld.admin.ch/elcom/electricityprice/dimension/energy",
        }),
        componentType: "NumericalMeasure",
        index: 11,
        isGroup: false,
        isHidden: false,
        columnStyle: {
          textStyle: "regular",
          type: "text",
          textColor: "#000",
          columnColor: "#fff",
        },
      },
      [stringifyComponentId({
        unversionedCubeIri:
          "https://energy.ld.admin.ch/elcom/electricityprice-canton",
        unversionedComponentIri:
          "https://energy.ld.admin.ch/elcom/electricityprice/dimension/charge",
      })]: {
        componentId: stringifyComponentId({
          unversionedCubeIri:
            "https://energy.ld.admin.ch/elcom/electricityprice-canton",
          unversionedComponentIri:
            "https://energy.ld.admin.ch/elcom/electricityprice/dimension/charge",
        }),
        componentType: "NumericalMeasure",
        index: 12,
        isGroup: false,
        isHidden: false,
        columnStyle: {
          textStyle: "regular",
          type: "text",
          textColor: "#000",
          columnColor: "#fff",
        },
      },
      [stringifyComponentId({
        unversionedCubeIri:
          "https://energy.ld.admin.ch/elcom/electricityprice-canton",
        unversionedComponentIri:
          "https://energy.ld.admin.ch/elcom/electricityprice/dimension/aidfee",
      })]: {
        componentId: stringifyComponentId({
          unversionedCubeIri:
            "https://energy.ld.admin.ch/elcom/electricityprice-canton",
          unversionedComponentIri:
            "https://energy.ld.admin.ch/elcom/electricityprice/dimension/aidfee",
        }),
        componentType: "NumericalMeasure",
        index: 13,
        isGroup: false,
        isHidden: false,
        columnStyle: {
          textStyle: "regular",
          type: "text",
          textColor: "#000",
          columnColor: "#fff",
        },
      },
    },
  },
  pie: {
    activeField: undefined,
    key: "ydBHrv26xvUg",
    version: CHART_CONFIG_VERSION,
    meta: {
      title: { en: "", de: "", fr: "", it: "" },
      description: { en: "", de: "", fr: "", it: "" },
      label: { en: "", de: "", fr: "", it: "" },
    },
    cubes: [
      {
        iri: "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/9",
        filters: {},
        joinBy: [
          stringifyComponentId({
            unversionedCubeIri:
              "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen",
            unversionedComponentIri:
              "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/Jahr",
          }),
          stringifyComponentId({
            unversionedCubeIri:
              "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen",
            unversionedComponentIri:
              "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/Kanton",
          }),
        ],
      },
      {
        iri: "https://energy.ld.admin.ch/elcom/electricityprice-canton",
        filters: {
          [stringifyComponentId({
            unversionedCubeIri:
              "https://energy.ld.admin.ch/elcom/electricityprice-canton",
            unversionedComponentIri:
              "https://energy.ld.admin.ch/elcom/electricityprice/dimension/category",
          })]: {
            type: "single",
            value:
              "https://energy.ld.admin.ch/elcom/electricityprice/category/C1",
          },
          [stringifyComponentId({
            unversionedCubeIri:
              "https://energy.ld.admin.ch/elcom/electricityprice-canton",
            unversionedComponentIri:
              "https://energy.ld.admin.ch/elcom/electricityprice/dimension/product",
          })]: {
            type: "single",
            value:
              "https://energy.ld.admin.ch/elcom/electricityprice/product/cheapest",
          },
        },
        joinBy: [
          stringifyComponentId({
            unversionedCubeIri:
              "https://energy.ld.admin.ch/elcom/electricityprice-canton",
            unversionedComponentIri:
              "https://energy.ld.admin.ch/elcom/electricityprice/dimension/period",
          }),
          stringifyComponentId({
            unversionedCubeIri:
              "https://energy.ld.admin.ch/elcom/electricityprice-canton",
            unversionedComponentIri:
              "https://energy.ld.admin.ch/elcom/electricityprice/dimension/canton",
          }),
        ],
      },
    ],
    limits: {},
    chartType: "pie",
    interactiveFiltersConfig: {
      legend: { active: false, componentId: "" },
      timeRange: {
        active: false,
        componentId: "",
        presets: { type: "range", from: "", to: "" },
      },
      dataFilters: { active: false, componentIds: [] },
      calculation: { active: false, type: "identity" },
    },
    fields: {
      y: {
        componentId: stringifyComponentId({
          unversionedCubeIri:
            "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen",
          unversionedComponentIri:
            "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/AnzahlAnlagen",
        }),
      },
      color: {
        type: "segment",
        paletteId: "category10",
        colorMapping: {
          "https://energy.ld.admin.ch/elcom/electricityprice/category/C1":
            "#1f77b4",
          "https://energy.ld.admin.ch/elcom/electricityprice/category/C2":
            "#ff7f0e",
          "https://energy.ld.admin.ch/elcom/electricityprice/category/C3":
            "#2ca02c",
          "https://energy.ld.admin.ch/elcom/electricityprice/category/C4":
            "#d62728",
          "https://energy.ld.admin.ch/elcom/electricityprice/category/C5":
            "#9467bd",
          "https://energy.ld.admin.ch/elcom/electricityprice/category/C6":
            "#8c564b",
          "https://energy.ld.admin.ch/elcom/electricityprice/category/C7":
            "#e377c2",
          "https://energy.ld.admin.ch/elcom/electricityprice/category/H1":
            "#7f7f7f",
          "https://energy.ld.admin.ch/elcom/electricityprice/category/H2":
            "#bcbd22",
          "https://energy.ld.admin.ch/elcom/electricityprice/category/H3":
            "#17becf",
          "https://energy.ld.admin.ch/elcom/electricityprice/category/H4":
            "#1f77b4",
          "https://energy.ld.admin.ch/elcom/electricityprice/category/H5":
            "#ff7f0e",
          "https://energy.ld.admin.ch/elcom/electricityprice/category/H6":
            "#2ca02c",
          "https://energy.ld.admin.ch/elcom/electricityprice/category/H7":
            "#d62728",
          "https://energy.ld.admin.ch/elcom/electricityprice/category/H8":
            "#9467bd",
        },
      },
      segment: {
        componentId: stringifyComponentId({
          unversionedCubeIri:
            "https://energy.ld.admin.ch/elcom/electricityprice-canton",
          unversionedComponentIri:
            "https://energy.ld.admin.ch/elcom/electricityprice/dimension/category",
        }),
        sorting: {
          sortingType: "byMeasure",
          sortingOrder: "asc",
        },
        showValuesMapping: {},
      },
    },
  },
};

export const dimensionsJoinedCubes: Dimension[] = [
  {
    __typename: "TemporalDimension",
    timeFormat: "%Y",
    timeUnit: TimeUnit.Year,
    cubeIri: "joinBy",
    id: "joinBy__0",
    label: "Jahr der Vergütung, Period",
    description: "Jahr, in welchem die EIV ausbezahlt wurde",
    unit: "yr",
    scaleType: ScaleType.Interval,
    dataType: "http://www.w3.org/2001/XMLSchema#gYear",
    order: 1,
    isNumerical: false,
    isKeyDimension: true,
    values: [
      { value: "2011", label: "2011" },
      { value: "2012", label: "2012" },
      { value: "2013", label: "2013" },
      { value: "2014", label: "2014" },
      { value: "2015", label: "2015" },
      { value: "2016", label: "2016" },
      { value: "2017", label: "2017" },
      { value: "2018", label: "2018" },
      { value: "2019", label: "2019" },
      { value: "2020", label: "2020" },
      { value: "2021", label: "2021" },
      { value: "2022", label: "2022" },
      { value: "2023", label: "2023" },
      { value: "2024", label: "2024" },
    ],
    related: [],
    hierarchy: null,
    isJoinByDimension: true,
    originalIds: [
      {
        cubeIri:
          "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/9",
        dimensionId: stringifyComponentId({
          unversionedCubeIri:
            "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen",
          unversionedComponentIri:
            "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/Jahr",
        }),
        label: "Jahr der Vergütung",
        description: "Beschreibung Jahr der Vergütung",
      },
      {
        cubeIri: "https://energy.ld.admin.ch/elcom/electricityprice-canton",
        dimensionId: stringifyComponentId({
          unversionedCubeIri:
            "https://energy.ld.admin.ch/elcom/electricityprice-canton",
          unversionedComponentIri:
            "https://energy.ld.admin.ch/elcom/electricityprice/dimension/period",
        }),
        label: "Period",
        description: "Description Period",
      },
    ],
  },
  {
    __typename: "GeoShapesDimension",
    cubeIri: "joinBy",
    id: "joinBy__1",
    label: "Kanton, Canton",
    description: "Kanton, in welchem die geförderten Anlagen stehen",
    scaleType: ScaleType.Nominal,
    order: 2,
    isNumerical: false,
    isKeyDimension: true,
    values: [
      {
        value: "https://ld.admin.ch/canton/1",
        label: "Zurich",
        alternateName: "ZH",
        identifier: "1",
        geometry:
          "https://geo.ld.admin.ch/boundaries/canton/geometry-g1/1:2023",
      },
      {
        value: "https://ld.admin.ch/canton/10",
        label: "Fribourg",
        alternateName: "FR",
        identifier: "10",
        geometry:
          "https://geo.ld.admin.ch/boundaries/canton/geometry-g1/10:2023",
      },
      {
        value: "https://ld.admin.ch/canton/11",
        label: "Solothurn",
        alternateName: "SO",
        identifier: "11",
        geometry:
          "https://geo.ld.admin.ch/boundaries/canton/geometry-g1/11:2023",
      },
      {
        value: "https://ld.admin.ch/canton/12",
        label: "Basel Stadt",
        alternateName: "BS",
        identifier: "12",
        geometry:
          "https://geo.ld.admin.ch/boundaries/canton/geometry-g1/12:2023",
      },
      {
        value: "https://ld.admin.ch/canton/13",
        label: "Basel Landschaft",
        alternateName: "BL",
        identifier: "13",
        geometry:
          "https://geo.ld.admin.ch/boundaries/canton/geometry-g1/13:2023",
      },
      {
        value: "https://ld.admin.ch/canton/14",
        label: "Schaffhausen",
        alternateName: "SH",
        identifier: "14",
        geometry:
          "https://geo.ld.admin.ch/boundaries/canton/geometry-g1/14:2023",
      },
      {
        value: "https://ld.admin.ch/canton/15",
        label: "Appenzell Ausserrhoden",
        alternateName: "AR",
        identifier: "15",
        geometry:
          "https://geo.ld.admin.ch/boundaries/canton/geometry-g1/15:2023",
      },
      {
        value: "https://ld.admin.ch/canton/16",
        label: "Appenzell Innerrhoden",
        alternateName: "AI",
        identifier: "16",
        geometry:
          "https://geo.ld.admin.ch/boundaries/canton/geometry-g1/16:2023",
      },
      {
        value: "https://ld.admin.ch/canton/17",
        label: "St Gallen",
        alternateName: "SG",
        identifier: "17",
        geometry:
          "https://geo.ld.admin.ch/boundaries/canton/geometry-g1/17:2023",
      },
      {
        value: "https://ld.admin.ch/canton/18",
        label: "Grisons",
        alternateName: "GR",
        identifier: "18",
        geometry:
          "https://geo.ld.admin.ch/boundaries/canton/geometry-g1/18:2023",
      },
      {
        value: "https://ld.admin.ch/canton/19",
        label: "Aargau",
        alternateName: "AG",
        identifier: "19",
        geometry:
          "https://geo.ld.admin.ch/boundaries/canton/geometry-g1/19:2023",
      },
      {
        value: "https://ld.admin.ch/canton/2",
        label: "Bern",
        alternateName: "BE",
        identifier: "2",
        geometry:
          "https://geo.ld.admin.ch/boundaries/canton/geometry-g1/2:2023",
      },
      {
        value: "https://ld.admin.ch/canton/20",
        label: "Thurgau",
        alternateName: "TG",
        identifier: "20",
        geometry:
          "https://geo.ld.admin.ch/boundaries/canton/geometry-g1/20:2023",
      },
      {
        value: "https://ld.admin.ch/canton/21",
        label: "Ticino",
        alternateName: "TI",
        identifier: "21",
        geometry:
          "https://geo.ld.admin.ch/boundaries/canton/geometry-g1/21:2023",
      },
      {
        value: "https://ld.admin.ch/canton/22",
        label: "Vaud",
        alternateName: "VD",
        identifier: "22",
        geometry:
          "https://geo.ld.admin.ch/boundaries/canton/geometry-g1/22:2023",
      },
      {
        value: "https://ld.admin.ch/canton/23",
        label: "Valais",
        alternateName: "VS",
        identifier: "23",
        geometry:
          "https://geo.ld.admin.ch/boundaries/canton/geometry-g1/23:2023",
      },
      {
        value: "https://ld.admin.ch/canton/24",
        label: "Neuchâtel",
        alternateName: "NE",
        identifier: "24",
        geometry:
          "https://geo.ld.admin.ch/boundaries/canton/geometry-g1/24:2023",
      },
      {
        value: "https://ld.admin.ch/canton/25",
        label: "Geneva",
        alternateName: "GE",
        identifier: "25",
        geometry:
          "https://geo.ld.admin.ch/boundaries/canton/geometry-g1/25:2023",
      },
      {
        value: "https://ld.admin.ch/canton/26",
        label: "Jura",
        alternateName: "JU",
        identifier: "26",
        geometry:
          "https://geo.ld.admin.ch/boundaries/canton/geometry-g1/26:2023",
      },
      {
        value: "https://ld.admin.ch/canton/3",
        label: "Lucerne",
        alternateName: "LU",
        identifier: "3",
        geometry:
          "https://geo.ld.admin.ch/boundaries/canton/geometry-g1/3:2023",
      },
      {
        value: "https://ld.admin.ch/canton/4",
        label: "Uri",
        alternateName: "UR",
        identifier: "4",
        geometry:
          "https://geo.ld.admin.ch/boundaries/canton/geometry-g1/4:2023",
      },
      {
        value: "https://ld.admin.ch/canton/5",
        label: "Schwyz",
        alternateName: "SZ",
        identifier: "5",
        geometry:
          "https://geo.ld.admin.ch/boundaries/canton/geometry-g1/5:2023",
      },
      {
        value: "https://ld.admin.ch/canton/6",
        label: "Obwalden",
        alternateName: "OW",
        identifier: "6",
        geometry:
          "https://geo.ld.admin.ch/boundaries/canton/geometry-g1/6:2023",
      },
      {
        value: "https://ld.admin.ch/canton/7",
        label: "Nidwalden",
        alternateName: "NW",
        identifier: "7",
        geometry:
          "https://geo.ld.admin.ch/boundaries/canton/geometry-g1/7:2023",
      },
      {
        value: "https://ld.admin.ch/canton/8",
        label: "Glarus",
        alternateName: "GL",
        identifier: "8",
        geometry:
          "https://geo.ld.admin.ch/boundaries/canton/geometry-g1/8:2023",
      },
      {
        value: "https://ld.admin.ch/canton/9",
        label: "Zug",
        alternateName: "ZG",
        identifier: "9",
        geometry:
          "https://geo.ld.admin.ch/boundaries/canton/geometry-g1/9:2023",
      },
    ],
    related: [],
    hierarchy: null,
    isJoinByDimension: true,
    originalIds: [
      {
        cubeIri:
          "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/9",
        dimensionId: stringifyComponentId({
          unversionedCubeIri:
            "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen",
          unversionedComponentIri:
            "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/Kanton",
        }),
        label: "Kanton",
        description: "Description Kanton",
      },
      {
        cubeIri: "https://energy.ld.admin.ch/elcom/electricityprice-canton",
        dimensionId: stringifyComponentId({
          unversionedCubeIri:
            "https://energy.ld.admin.ch/elcom/electricityprice-canton",
          unversionedComponentIri:
            "https://energy.ld.admin.ch/elcom/electricityprice/dimension/canton",
        }),

        label: "Canton",
        description: "Description Canton",
      },
    ],
  },
  {
    __typename: "NominalDimension",
    cubeIri: "https://energy.ld.admin.ch/elcom/electricityprice-canton",
    id: stringifyComponentId({
      unversionedCubeIri:
        "https://energy.ld.admin.ch/elcom/electricityprice-canton",
      unversionedComponentIri:
        "https://energy.ld.admin.ch/elcom/electricityprice/dimension/category",
    }),
    label: "Consumption profiles of typical households",
    scaleType: ScaleType.Nominal,
    isNumerical: false,
    isKeyDimension: true,
    values: [
      {
        value: "https://energy.ld.admin.ch/elcom/electricityprice/category/C1",
        label: "C1",
        description:
          "8'000 kWh/Jahr: Kleinstbetrieb' max. beanspruchte Leistung: 8 kW",
      },
      {
        value: "https://energy.ld.admin.ch/elcom/electricityprice/category/C2",
        label: "C2",
        description:
          "30'000 kWh/Jahr: Kleinbetrieb' max. beanspruchte Leistung: 15 kW",
      },
      {
        value: "https://energy.ld.admin.ch/elcom/electricityprice/category/C3",
        label: "C3",
        description:
          "150'000 kWh/Jahr: Mittlerer Betrieb' max. beanspruchte Leistung: 50 kW",
      },
      {
        value: "https://energy.ld.admin.ch/elcom/electricityprice/category/C4",
        label: "C4",
        description:
          "500'000 kWh/Jahr: Grosser Betrieb ' max. beanspruchte Leistung: 150 kW' Niederspannung",
      },
      {
        value: "https://energy.ld.admin.ch/elcom/electricityprice/category/C5",
        label: "C5",
        description:
          "500'000 kWh/Jahr: Grosser Betrieb' max. beanspruchte Leistung: 150 kW' Mittelspannung' eigene Transformatorenstation",
      },
      {
        value: "https://energy.ld.admin.ch/elcom/electricityprice/category/C6",
        label: "C6",
        description:
          "1'500'000 kWh/Jahr: Grosser Betrieb' max. beanspruchte Leistung: 400 kW' Mittelspannung' eigene Transformatorenstation",
      },
      {
        value: "https://energy.ld.admin.ch/elcom/electricityprice/category/C7",
        label: "C7",
        description:
          "7'500'000 kWh/Jahr: Grosser Betrieb' max. beanspruchte Leistung: 1'630 kW' Mittelspannung' eigene Transformatorenstation",
      },
      {
        value: "https://energy.ld.admin.ch/elcom/electricityprice/category/H1",
        label: "H1",
        description: "1'600 kWh/Jahr: 2-Zimmerwohnung mit Elektroherd",
      },
      {
        value: "https://energy.ld.admin.ch/elcom/electricityprice/category/H2",
        label: "H2",
        description: "2'500 kWh/Jahr: 4-Zimmerwohnung mit Elektroherd",
      },
      {
        value: "https://energy.ld.admin.ch/elcom/electricityprice/category/H3",
        label: "H3",
        description:
          "4'500 kWh/Jahr: 4-Zimmerwohnung mit Elektroherd und Elektroboiler",
      },
      {
        value: "https://energy.ld.admin.ch/elcom/electricityprice/category/H4",
        label: "H4",
        description:
          "4'500 kWh/Jahr: 5-Zimmerwohnung mit Elektroherd und Tumbler (ohne Elektroboiler)",
      },
      {
        value: "https://energy.ld.admin.ch/elcom/electricityprice/category/H5",
        label: "H5",
        description:
          "7'500 kWh/Jahr: 5-Zimmer-Einfamilienhaus mit Elektroherd' Elektroboiler und Tumbler",
      },
      {
        value: "https://energy.ld.admin.ch/elcom/electricityprice/category/H6",
        label: "H6",
        description:
          "25'000 kWh/Jahr: 5-Zimmer-Einfamilienhaus mit Elektroherd' Elektroboiler' Tumbler und mit elektrischer Widerstandsheizung",
      },
      {
        value: "https://energy.ld.admin.ch/elcom/electricityprice/category/H7",
        label: "H7",
        description:
          "13'000 kWh/Jahr: 5-Zimmer-Einfamilienhaus mit Elektroherd' Elektroboiler' Tumbler' Wärmepumpe 5 kW zur Beheizung",
      },
      {
        value: "https://energy.ld.admin.ch/elcom/electricityprice/category/H8",
        label: "H8",
        description:
          "7'500 kWh/Jahr: Grosse' hoch elektrifizierte Eigentumswohnung",
      },
    ],
    related: [],
    hierarchy: null,
  },
  {
    __typename: "NominalDimension",
    cubeIri: "https://energy.ld.admin.ch/elcom/electricityprice-canton",
    id: stringifyComponentId({
      unversionedCubeIri:
        "https://energy.ld.admin.ch/elcom/electricityprice-canton",
      unversionedComponentIri:
        "https://energy.ld.admin.ch/elcom/electricityprice/dimension/product",
    }),
    label: "Product",
    scaleType: ScaleType.Nominal,
    isNumerical: false,
    isKeyDimension: true,
    values: [
      {
        value:
          "https://energy.ld.admin.ch/elcom/electricityprice/product/cheapest",
        label: "Cheapest product",
      },
      {
        value:
          "https://energy.ld.admin.ch/elcom/electricityprice/product/standard",
        label: "Standard product",
      },
    ],
    related: [],
    hierarchy: null,
  },
];
