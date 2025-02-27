import { stringifyComponentId } from "@/graphql/make-component-id";
import { ScaleType } from "@/graphql/query-hooks";
import { getCachedComponents } from "@/urql-cache";

export const getCachedComponentsMock = {
  electricityPricePerCantonDimensions: {
    dimensions: [
      {
        __typename: "GeoShapesDimension",
        cubeIri: "https://energy.ld.admin.ch/elcom/electricityprice-canton",
        id: stringifyComponentId({
          unversionedCubeIri:
            "https://energy.ld.admin.ch/elcom/electricityprice-canton",
          unversionedComponentIri:
            "https://energy.ld.admin.ch/elcom/electricityprice/dimension/canton",
        }),
        label: "Kanton",
        scaleType: "Nominal" as ScaleType,
        isNumerical: false,
        isKeyDimension: true,
        values: [
          {
            value: "https://ld.admin.ch/canton/1",
            label: "Zürich",
            identifier: 1,
            alternateName: "ZH",
          },
          {
            value: "https://ld.admin.ch/canton/10",
            label: "Freiburg",
            identifier: 10,
            alternateName: "FR",
          },
          {
            value: "https://ld.admin.ch/canton/11",
            label: "Solothurn",
            identifier: 11,
            alternateName: "SO",
          },
          {
            value: "https://ld.admin.ch/canton/12",
            label: "Basel-Stadt",
            identifier: 12,
            alternateName: "BS",
          },
          {
            value: "https://ld.admin.ch/canton/13",
            label: "Basel-Landschaft",
            identifier: 13,
            alternateName: "BL",
          },
          {
            value: "https://ld.admin.ch/canton/14",
            label: "Schaffhausen",
            identifier: 14,
            alternateName: "SH",
          },
          {
            value: "https://ld.admin.ch/canton/15",
            label: "Appenzell Ausserrhoden",
            identifier: 15,
            alternateName: "AR",
          },
          {
            value: "https://ld.admin.ch/canton/16",
            label: "Appenzell Innerrhoden",
            identifier: 16,
            alternateName: "AI",
          },
          {
            value: "https://ld.admin.ch/canton/17",
            label: "St. Gallen",
            identifier: 17,
            alternateName: "SG",
          },
          {
            value: "https://ld.admin.ch/canton/18",
            label: "Graubünden",
            identifier: 18,
            alternateName: "GR",
          },
          {
            value: "https://ld.admin.ch/canton/19",
            label: "Aargau",
            identifier: 19,
            alternateName: "AG",
          },
          {
            value: "https://ld.admin.ch/canton/2",
            label: "Bern",
            identifier: 2,
            alternateName: "BE",
          },
          {
            value: "https://ld.admin.ch/canton/20",
            label: "Thurgau",
            identifier: 20,
            alternateName: "TG",
          },
          {
            value: "https://ld.admin.ch/canton/21",
            label: "Tessin",
            identifier: 21,
            alternateName: "TI",
          },
          {
            value: "https://ld.admin.ch/canton/22",
            label: "Waadt",
            identifier: 22,
            alternateName: "VD",
          },
          {
            value: "https://ld.admin.ch/canton/23",
            label: "Wallis",
            identifier: 23,
            alternateName: "VS",
          },
          {
            value: "https://ld.admin.ch/canton/24",
            label: "Neuenburg",
            identifier: 24,
            alternateName: "NE",
          },
          {
            value: "https://ld.admin.ch/canton/25",
            label: "Genf",
            identifier: 25,
            alternateName: "GE",
          },
          {
            value: "https://ld.admin.ch/canton/26",
            label: "Jura",
            identifier: 26,
            alternateName: "JU",
          },
          {
            value: "https://ld.admin.ch/canton/3",
            label: "Luzern",
            identifier: 3,
            alternateName: "LU",
          },
          {
            value: "https://ld.admin.ch/canton/4",
            label: "Uri",
            identifier: 4,
            alternateName: "UR",
          },
          {
            value: "https://ld.admin.ch/canton/5",
            label: "Schwyz",
            identifier: 5,
            alternateName: "SZ",
          },
          {
            value: "https://ld.admin.ch/canton/6",
            label: "Obwalden",
            identifier: 6,
            alternateName: "OW",
          },
          {
            value: "https://ld.admin.ch/canton/7",
            label: "Nidwalden",
            identifier: 7,
            alternateName: "NW",
          },
          {
            value: "https://ld.admin.ch/canton/8",
            label: "Glarus",
            identifier: 8,
            alternateName: "GL",
          },
          {
            value: "https://ld.admin.ch/canton/9",
            label: "Zug",
            identifier: 9,
            alternateName: "ZG",
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
            "https://energy.ld.admin.ch/elcom/electricityprice/dimension/category",
        }),
        label: "Verbrauchsprofile typischer Haushalte",
        scaleType: "Nominal" as ScaleType,
        isNumerical: false,
        isKeyDimension: true,
        values: [
          {
            value:
              "https://energy.ld.admin.ch/elcom/electricityprice/category/C1",
            label: "C1",
            description:
              "8'000 kWh/Jahr: Kleinstbetrieb' max. beanspruchte Leistung: 8 kW",
          },
          {
            value:
              "https://energy.ld.admin.ch/elcom/electricityprice/category/C2",
            label: "C2",
            description:
              "30'000 kWh/Jahr: Kleinbetrieb' max. beanspruchte Leistung: 15 kW",
          },
          {
            value:
              "https://energy.ld.admin.ch/elcom/electricityprice/category/C3",
            label: "C3",
            description:
              "150'000 kWh/Jahr: Mittlerer Betrieb' max. beanspruchte Leistung: 50 kW",
          },
          {
            value:
              "https://energy.ld.admin.ch/elcom/electricityprice/category/C4",
            label: "C4",
            description:
              "500'000 kWh/Jahr: Grosser Betrieb ' max. beanspruchte Leistung: 150 kW' Niederspannung",
          },
          {
            value:
              "https://energy.ld.admin.ch/elcom/electricityprice/category/C5",
            label: "C5",
            description:
              "500'000 kWh/Jahr: Grosser Betrieb' max. beanspruchte Leistung: 150 kW' Mittelspannung' eigene Transformatorenstation",
          },
          {
            value:
              "https://energy.ld.admin.ch/elcom/electricityprice/category/C6",
            label: "C6",
            description:
              "1'500'000 kWh/Jahr: Grosser Betrieb' max. beanspruchte Leistung: 400 kW' Mittelspannung' eigene Transformatorenstation",
          },
          {
            value:
              "https://energy.ld.admin.ch/elcom/electricityprice/category/C7",
            label: "C7",
            description:
              "7'500'000 kWh/Jahr: Grosser Betrieb' max. beanspruchte Leistung: 1'630 kW' Mittelspannung' eigene Transformatorenstation",
          },
          {
            value:
              "https://energy.ld.admin.ch/elcom/electricityprice/category/H1",
            label: "H1",
            description: "1'600 kWh/Jahr: 2-Zimmerwohnung mit Elektroherd",
          },
          {
            value:
              "https://energy.ld.admin.ch/elcom/electricityprice/category/H2",
            label: "H2",
            description: "2'500 kWh/Jahr: 4-Zimmerwohnung mit Elektroherd",
          },
          {
            value:
              "https://energy.ld.admin.ch/elcom/electricityprice/category/H3",
            label: "H3",
            description:
              "4'500 kWh/Jahr: 4-Zimmerwohnung mit Elektroherd und Elektroboiler",
          },
          {
            value:
              "https://energy.ld.admin.ch/elcom/electricityprice/category/H4",
            label: "H4",
            description:
              "4'500 kWh/Jahr: 5-Zimmerwohnung mit Elektroherd und Tumbler (ohne Elektroboiler)",
          },
          {
            value:
              "https://energy.ld.admin.ch/elcom/electricityprice/category/H5",
            label: "H5",
            description:
              "7'500 kWh/Jahr: 5-Zimmer-Einfamilienhaus mit Elektroherd' Elektroboiler und Tumbler",
          },
          {
            value:
              "https://energy.ld.admin.ch/elcom/electricityprice/category/H6",
            label: "H6",
            description:
              "25'000 kWh/Jahr: 5-Zimmer-Einfamilienhaus mit Elektroherd' Elektroboiler' Tumbler und mit elektrischer Widerstandsheizung",
          },
          {
            value:
              "https://energy.ld.admin.ch/elcom/electricityprice/category/H7",
            label: "H7",
            description:
              "13'000 kWh/Jahr: 5-Zimmer-Einfamilienhaus mit Elektroherd' Elektroboiler' Tumbler' Wärmepumpe 5 kW zur Beheizung",
          },
          {
            value:
              "https://energy.ld.admin.ch/elcom/electricityprice/category/H8",
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
        label: "Produkt",
        scaleType: "Nominal" as ScaleType,
        isNumerical: false,
        isKeyDimension: true,
        values: [
          {
            value:
              "https://energy.ld.admin.ch/elcom/electricityprice/product/cheapest",
            label: "Günstigstes Produkt",
          },
          {
            value:
              "https://energy.ld.admin.ch/elcom/electricityprice/product/standard",
            label: "Standardprodukt",
          },
        ],
        related: [],
        hierarchy: null,
      },
    ],
    measures: [
      {
        __typename: "NumericalMeasure",
        isCurrency: false,
        isDecimal: false,
        cubeIri: "https://energy.ld.admin.ch/elcom/electricityprice-canton",
        id: stringifyComponentId({
          unversionedCubeIri:
            "https://energy.ld.admin.ch/elcom/electricityprice-canton",
          unversionedComponentIri:
            "https://energy.ld.admin.ch/elcom/electricityprice/dimension/total",
        }),
        label: "Total exkl. MWST",
        description:
          "Total electricity costs in rappen per kWH. Includes all variable costs, but not fix costs",
        scaleType: "Ratio" as ScaleType,
        isNumerical: false,
        isKeyDimension: false,
        values: [
          { value: 6.9948115, label: "6.9948115" },
          { value: 41.933666, label: "41.933666" },
        ],
        related: [],
        limits: [],
      },
      {
        __typename: "NumericalMeasure",
        isCurrency: false,
        isDecimal: false,
        cubeIri: "https://energy.ld.admin.ch/elcom/electricityprice-canton",
        id: stringifyComponentId({
          unversionedCubeIri:
            "https://energy.ld.admin.ch/elcom/electricityprice-canton",
          unversionedComponentIri:
            "https://energy.ld.admin.ch/elcom/electricityprice/dimension/gridusage",
        }),
        label: "Netznutzung",
        scaleType: "Ratio" as ScaleType,
        isNumerical: false,
        isKeyDimension: false,
        values: [
          { value: 2.0865285, label: "2.0865285" },
          { value: 21.119532, label: "21.119532" },
        ],
        related: [],
        limits: [],
      },
      {
        __typename: "NumericalMeasure",
        isCurrency: false,
        isDecimal: false,
        cubeIri: "https://energy.ld.admin.ch/elcom/electricityprice-canton",
        id: stringifyComponentId({
          unversionedCubeIri:
            "https://energy.ld.admin.ch/elcom/electricityprice-canton",
          unversionedComponentIri:
            "https://energy.ld.admin.ch/elcom/electricityprice/dimension/energy",
        }),
        label: "Energielieferungkosten",
        scaleType: "Ratio" as ScaleType,
        isNumerical: false,
        isKeyDimension: false,
        values: [
          { value: 1.11324, label: "1.11324" },
          { value: 23.652, label: "23.652" },
        ],
        related: [],
        limits: [],
      },
      {
        __typename: "NumericalMeasure",
        isCurrency: false,
        isDecimal: false,
        cubeIri: "https://energy.ld.admin.ch/elcom/electricityprice-canton",
        id: stringifyComponentId({
          unversionedCubeIri:
            "https://energy.ld.admin.ch/elcom/electricityprice-canton",
          unversionedComponentIri:
            "https://energy.ld.admin.ch/elcom/electricityprice/dimension/charge",
        }),
        label: "Abgaben an das Gemeinwesen",
        scaleType: "Ratio" as ScaleType,
        isNumerical: false,
        isKeyDimension: false,
        values: [
          { value: 0, label: "0" },
          { value: 7.584526, label: "7.584526" },
        ],
        related: [],
        limits: [],
      },
      {
        __typename: "NumericalMeasure",
        isCurrency: false,
        isDecimal: false,
        cubeIri: "https://energy.ld.admin.ch/elcom/electricityprice-canton",
        id: stringifyComponentId({
          unversionedCubeIri:
            "https://energy.ld.admin.ch/elcom/electricityprice-canton",
          unversionedComponentIri:
            "https://energy.ld.admin.ch/elcom/electricityprice/dimension/aidfee",
        }),
        label: "Förderabgaben (KEV)",
        scaleType: "Ratio" as ScaleType,
        isNumerical: false,
        isKeyDimension: false,
        values: [
          { value: 0.45, label: "0.45" },
          { value: 2.3, label: "2.3" },
        ],
        related: [],
        limits: [],
      },
    ],
  },
  geoAndNumerical: {
    dimensions: [
      {
        __typename: "GeoShapesDimension",
        cubeIri: "mapDataset",
        id: stringifyComponentId({
          unversionedCubeIri: "mapDataset",
          unversionedComponentIri: "newAreaLayerColorIri",
        }),
        label: "Geo shapes dimension",
        isNumerical: false,
        isKeyDimension: true,
        values: [
          {
            value: "orange",
            label: "orange",
            color: "rgb(255, 153, 0)",
          },
        ],
      },
      {
        __typename: "GeoCoordinatesDimension",
        cubeIri: "mapDataset",
        id: stringifyComponentId({
          unversionedCubeIri: "mapDataset",
          unversionedComponentIri: "symbolLayerIri",
        }),
        label: "Geo coordinates dimension",
        isNumerical: false,
        isKeyDimension: true,
        values: [
          { value: "x", label: "y" },
          { value: "xPossible", label: "yPossible" },
        ],
      },
    ],
    measures: [
      {
        __typename: "NumericalMeasure",
        cubeIri: "mapDataset",
        id: stringifyComponentId({
          unversionedCubeIri: "mapDataset",
          unversionedComponentIri: "measure",
        }),
        label: "Numerical dimension",
        isNumerical: true,
        isKeyDimension: false,
        values: [],
        limits: [],
      },
    ],
  },
} satisfies Record<string, ReturnType<typeof getCachedComponents>>;
