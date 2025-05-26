import { BaseOf } from "ts-brand";
import { OperationResult } from "urql";
import { describe, expect, it } from "vitest";

import { Dimension } from "@/domain/data";
import {
  joinDimensions,
  mergeObservations,
  mkVersionedJoinBy,
} from "@/graphql/join";
import { VersionedJoinBy } from "@/graphql/join";
import { ComponentId, stringifyComponentId } from "@/graphql/make-component-id";
import {
  DataCubeComponentsQuery,
  DataCubeObservationsQuery,
  DataCubeObservationsQueryVariables,
  Exact,
  ScaleType,
  TimeUnit,
} from "@/graphql/query-hooks";

type ObservationsQuery = OperationResult<
  DataCubeObservationsQuery,
  Exact<DataCubeObservationsQueryVariables>
>[];

describe("mergeObservations", () => {
  it("should merge observations with a single join by", () => {
    const queries = [
      {
        data: {
          dataCubeObservations: {
            data: [
              { year: 2010, amount: 2010 }, // merge-able
              { year: 2011, amount: 2011 },
            ],
          },
        },
        operation: {
          variables: {
            cubeFilter: {
              joinBy: ["year"],
            },
          },
        },
      },
      {
        data: {
          dataCubeObservations: {
            data: [
              { YEAR: 2000, AMOUNT: 2000 },
              { YEAR: 2010, AMOUNT: 2010 },
              { YEAR: 2020, AMOUNT: 2020 },
            ],
          },
        },
        operation: {
          variables: {
            cubeFilter: {
              joinBy: ["YEAR"],
            },
          },
        },
      },
      {
        data: undefined,
        operation: {
          variables: {
            cubeFilter: {
              joinBy: ["YEAR"],
            },
          },
        },
      },
      {
        data: { dataCubeObservations: [] },
        operation: {
          variables: {
            cubeFilter: {
              joinBy: undefined,
            },
          },
        },
      },
    ] as unknown as ObservationsQuery;

    const result = mergeObservations(queries);

    expect(result).toEqual([
      { joinBy__0: 2000, AMOUNT: 2000 },
      { joinBy__0: 2010, amount: 2010, AMOUNT: 2010 },
      { joinBy__0: 2011, amount: 2011 },
      { joinBy__0: 2020, AMOUNT: 2020 },
    ]);
  });

  it("should merge observations with multiple join bys", () => {
    const queries = [
      {
        data: {
          dataCubeObservations: {
            data: [
              { year: 2010, period: 0, amount: "2010_0" }, // mergeable
              { year: 2010, period: 1, amount: "2010_1" },
              { year: 2011, period: 0, amount: "2011_0" },
              { year: 2011, period: 1, amount: "2011_1" },
              { year: 2020, period: 1, amount: "2020_1" }, // mergeable
              { year: 2020, period: 0, amount: "2020_1" },
            ],
          },
        },
        operation: {
          variables: {
            cubeFilter: {
              joinBy: ["year", "period"],
            },
          },
        },
      },
      {
        data: {
          dataCubeObservations: {
            data: [
              { YEAR: 2000, PERIOD: 0, AMOUNT: "2000_0" },
              { YEAR: 2000, PERIOD: 1, AMOUNT: "2000_1" },
              { YEAR: 2010, PERIOD: 0, AMOUNT: "2010_0" },
              { YEAR: 2020, PERIOD: 1, AMOUNT: "2020_1" },
            ],
          },
        },
        operation: {
          variables: {
            cubeFilter: {
              joinBy: ["YEAR", "PERIOD"],
            },
          },
        },
      },
      {
        data: undefined,
        operation: {
          variables: {
            cubeFilter: {
              joinBy: ["YEAR", "PERIOD"],
            },
          },
        },
      },
      {
        data: { dataCubeObservations: [] },
        operation: {
          variables: {
            cubeFilter: {
              joinBy: undefined,
            },
          },
        },
      },
    ] as any as OperationResult<
      DataCubeObservationsQuery,
      Exact<DataCubeObservationsQueryVariables>
    >[];

    const result = mergeObservations(queries);

    expect(result).toMatchInlineSnapshot(`
      [
        {
          "AMOUNT": "2010_0",
          "amount": "2010_0",
          "joinBy__0": 2010,
          "joinBy__1": 0,
        },
        {
          "amount": "2010_1",
          "joinBy__0": 2010,
          "joinBy__1": 1,
        },
        {
          "amount": "2011_0",
          "joinBy__0": 2011,
          "joinBy__1": 0,
        },
        {
          "amount": "2011_1",
          "joinBy__0": 2011,
          "joinBy__1": 1,
        },
        {
          "AMOUNT": "2020_1",
          "amount": "2020_1",
          "joinBy__0": 2020,
          "joinBy__1": 1,
        },
        {
          "amount": "2020_1",
          "joinBy__0": 2020,
          "joinBy__1": 0,
        },
        {
          "AMOUNT": "2000_0",
          "joinBy__0": 2000,
          "joinBy__1": 0,
        },
        {
          "AMOUNT": "2000_1",
          "joinBy__0": 2000,
          "joinBy__1": 1,
        },
      ]
    `);
  });
});

describe("joinDimensions", () => {
  it("should join dimensions (editor mode, all dimensions fetched)", () => {
    const joinBy: VersionedJoinBy = mkVersionedJoinBy({
      population: ["year" as ComponentId, "canton" as ComponentId],
      elec: ["YEAR" as ComponentId, "CANTON" as ComponentId],
    });
    const fetchedDimensions = [
      {
        cubeIri: "population",
        id: "population",
        label: "Population",
      } as Dimension,
      {
        cubeIri: "population",
        id: "year",
        label: "Year",
      } as Dimension,
      {
        cubeIri: "population",
        id: "canton",
        label: "Canton",
        values: [{ value: "Bern" }, { value: "Zürich" }],
      } as unknown as Dimension,
      {
        cubeIri: "elec",
        id: "electricalConsumption",
        label: "Electrical Consumption",
      } as Dimension,
      {
        cubeIri: "elec",
        id: "YEAR",
        label: "Year",
      } as Dimension,
      {
        cubeIri: "elec",
        id: "CANTON",
        label: "Canton",
        values: [
          { value: "Bern" },
          { value: "Zürich" },
          { value: "Appenzeller" },
        ],
      } as unknown as Dimension,
    ];

    const result = joinDimensions({
      joinBy,
      dimensions: fetchedDimensions,
    });

    expect(result).toMatchInlineSnapshot(`
      [
        {
          "cubeIri": "joinBy",
          "id": "joinBy__0",
          "isJoinByDimension": true,
          "label": "Year",
          "originalIds": [
            {
              "cubeIri": "population",
              "description": "",
              "dimensionId": "year",
              "label": "Year",
            },
            {
              "cubeIri": "elec",
              "description": "",
              "dimensionId": "YEAR",
              "label": "Year",
            },
          ],
          "values": [],
        },
        {
          "cubeIri": "joinBy",
          "id": "joinBy__1",
          "isJoinByDimension": true,
          "label": "Canton",
          "originalIds": [
            {
              "cubeIri": "population",
              "description": "",
              "dimensionId": "canton",
              "label": "Canton",
            },
            {
              "cubeIri": "elec",
              "description": "",
              "dimensionId": "CANTON",
              "label": "Canton",
            },
          ],
          "values": [
            {
              "value": "Appenzeller",
            },
            {
              "value": "Bern",
            },
            {
              "value": "Zürich",
            },
          ],
        },
        {
          "cubeIri": "population",
          "id": "population",
          "label": "Population",
        },
        {
          "cubeIri": "elec",
          "id": "electricalConsumption",
          "label": "Electrical Consumption",
        },
      ]
    `);
  });

  it("should join dimensions (publish mode, only some dimensions are fetched)", () => {
    const joinBy = mkVersionedJoinBy({
      "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/9":
        [
          stringifyComponentId({
            unversionedCubeIri:
              "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen",
            unversionedComponentIri:
              "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/Jahr",
          }),
        ],
      "https://energy.ld.admin.ch/sfoe/bfe_ogd18_gebaeudeprogramm_co2wirkung/4":
        [
          stringifyComponentId({
            unversionedCubeIri:
              "https://energy.ld.admin.ch/sfoe/bfe_ogd18_gebaeudeprogramm_co2wirkung",
            unversionedComponentIri:
              "https://energy.ld.admin.ch/sfoe/bfe_ogd18_gebaeudeprogramm_co2wirkung/Jahr",
          }),
        ],
    });
    const fetchedDimensions: DataCubeComponentsQuery["dataCubeComponents"]["dimensions"] =
      [
        {
          __typename: "TemporalDimension",
          timeFormat: "%Y",
          timeUnit: TimeUnit.Year,
          cubeIri:
            "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/9",
          id: stringifyComponentId({
            unversionedCubeIri:
              "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen",
            unversionedComponentIri:
              "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/Jahr",
          }),
          label: "Jahr der Vergütung",
          description: "Jahr, in welchem die EIV ausbezahlt wurde",
          unit: "yr",
          scaleType: ScaleType.Interval,
          dataType: "http://www.w3.org/2001/XMLSchema#gYear",
          order: 1,
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
            { value: "2022", label: "2022" },
          ],
          related: [],
          relatedLimitValues: [],
          hierarchy: null,
        },
        {
          __typename: "GeoShapesDimension",
          cubeIri:
            "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/9",
          id: stringifyComponentId({
            unversionedCubeIri:
              "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen",
            unversionedComponentIri:
              "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/Kanton",
          }),
          label: "Kanton",
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
          relatedLimitValues: [],
          hierarchy: null,
        },
        // Region
        {
          __typename: "NominalDimension" as const,
          cubeIri:
            "https://energy.ld.admin.ch/sfoe/bfe_ogd18_gebaeudeprogramm_co2wirkung/4",
          id: stringifyComponentId({
            unversionedCubeIri:
              "https://energy.ld.admin.ch/sfoe/bfe_ogd18_gebaeudeprogramm_co2wirkung",
            unversionedComponentIri:
              "https://energy.ld.admin.ch/sfoe/bfe_ogd18_gebaeudeprogramm_co2wirkung/region",
          }),
          label: "Region",
          scaleType: ScaleType.Nominal,
          order: 2,
          isNumerical: false,
          isKeyDimension: true,
          values: [
            {
              value: "https://ld.admin.ch/country/CHE",
              label: "Switzerland",
              alternateName: "CH",
              identifier: "CHE",
              geometry:
                "https://geo.ld.admin.ch/boundaries/country/geometry-g1/CH:2022",
            },
          ],
          related: [],
          relatedLimitValues: [],
          hierarchy: null,
        },
        // massnahmenbereich
        {
          __typename: "NominalDimension",
          cubeIri:
            "https://energy.ld.admin.ch/sfoe/bfe_ogd18_gebaeudeprogramm_co2wirkung/4",
          id: stringifyComponentId({
            unversionedCubeIri:
              "https://energy.ld.admin.ch/sfoe/bfe_ogd18_gebaeudeprogramm_co2wirkung",
            unversionedComponentIri:
              "https://energy.ld.admin.ch/sfoe/bfe_ogd18_gebaeudeprogramm_co2wirkung/massnahmenbereich",
          }),
          label: "Massnahmenbereich",
          scaleType: ScaleType.Nominal,
          order: 3,
          isNumerical: false,
          isKeyDimension: true,
          values: [
            {
              value:
                "https://energy.ld.admin.ch/sfoe/bfe_ogd18_gebaeudeprogramm_co2wirkung/ogd18_catalog/Haustechnik",
              label: "Haustechnik",
              identifier: "Haustechnik",
            },
            {
              value:
                "https://energy.ld.admin.ch/sfoe/bfe_ogd18_gebaeudeprogramm_co2wirkung/ogd18_catalog/Neubau",
              label: "Neubau",
              identifier: "Neubau",
            },
            {
              value:
                "https://energy.ld.admin.ch/sfoe/bfe_ogd18_gebaeudeprogramm_co2wirkung/ogd18_catalog/Systemsanierung",
              label: "Systemsanierung",
              identifier: "Systemsanierung",
            },
            {
              value:
                "https://energy.ld.admin.ch/sfoe/bfe_ogd18_gebaeudeprogramm_co2wirkung/ogd18_catalog/Waermedaemmung",
              label: "Wärmedämmung",
              identifier: "Waermedaemmung",
            },
            {
              value:
                "https://energy.ld.admin.ch/sfoe/bfe_ogd18_gebaeudeprogramm_co2wirkung/ogd18_catalog/Zentrale_Waermeversorgung",
              label: "Zentrale Wärmeversorgung",
              identifier: "Zentrale_Waermeversorgung",
            },
          ],
          related: [],
          relatedLimitValues: [],
          hierarchy: null,
        },
      ];

    const result = joinDimensions({
      joinBy,
      dimensions: fetchedDimensions,
    });
    expect(result.map((x) => x.id)).toMatchInlineSnapshot(`
      [
        "joinBy__0",
        "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/Kanton",
        "https://energy.ld.admin.ch/sfoe/bfe_ogd18_gebaeudeprogramm_co2wirkung(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)https://energy.ld.admin.ch/sfoe/bfe_ogd18_gebaeudeprogramm_co2wirkung/region",
        "https://energy.ld.admin.ch/sfoe/bfe_ogd18_gebaeudeprogramm_co2wirkung(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)https://energy.ld.admin.ch/sfoe/bfe_ogd18_gebaeudeprogramm_co2wirkung/massnahmenbereich",
      ]
    `);
  });

  it("should join dimensions (more than 1 cube)", () => {
    const dimensions = [
      {
        __typename: "TemporalDimension" as const,
        timeFormat: "%Y",
        timeUnit: TimeUnit.Year,
        cubeIri: "joinBy",
        id: "joinBy__0" as ComponentId,
        label: "Jahr der Vergütung, Period",
        description: "Jahr, in welchem die EIV ausbezahlt wurde",
        unit: "a",
        scaleType: ScaleType.Interval,
        dataType: "http://www.w3.org/2001/XMLSchema#gYear",
        order: 1,
        isNumerical: false,
        isKeyDimension: true,
        values: [],
        related: [],
        relatedLimitValues: [],
        hierarchy: null,
        isJoinByDimension: true as const,
        originalIds: [
          {
            cubeIri:
              "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/10",
            dimensionId:
              "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/Jahr" as ComponentId,
            label: "Jahr der Vergütung",
            description: "Jahr, in welchem die EIV ausbezahlt wurde",
          },
          {
            cubeIri: "https://energy.ld.admin.ch/elcom/electricityprice-canton",
            dimensionId:
              "https://energy.ld.admin.ch/elcom/electricityprice-canton(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)https://energy.ld.admin.ch/elcom/electricityprice/dimension/period" as ComponentId,
            label: "Period",
            description: "",
          },
        ],
      },
      {
        __typename: "GeoShapesDimension" as const,
        cubeIri: "joinBy",
        id: "joinBy__1" as ComponentId,
        label: "Kanton, Canton",
        description: "Kanton, in welchem die geförderten Anlagen stehen",
        scaleType: ScaleType.Nominal,
        order: 2,
        isNumerical: false,
        isKeyDimension: true,
        values: [],
        related: [],
        relatedLimitValues: [],
        hierarchy: null,
        isJoinByDimension: true as const,
        originalIds: [
          {
            cubeIri:
              "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/10",
            dimensionId:
              "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/Kanton" as ComponentId,
            label: "Kanton",
            description: "Kanton, in welchem die geförderten Anlagen stehen",
          },
          {
            cubeIri: "https://energy.ld.admin.ch/elcom/electricityprice-canton",
            dimensionId:
              "https://energy.ld.admin.ch/elcom/electricityprice-canton(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)https://energy.ld.admin.ch/elcom/electricityprice/dimension/canton" as ComponentId,
            label: "Canton",
            description: "",
          },
        ],
      },
      {
        __typename: "NominalDimension" as const,
        cubeIri: "https://energy.ld.admin.ch/elcom/electricityprice-canton",
        id: "https://energy.ld.admin.ch/elcom/electricityprice-canton(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)https://energy.ld.admin.ch/elcom/electricityprice/dimension/category" as ComponentId,
        label: "Consumption profiles of typical households",
        scaleType: ScaleType.Nominal,
        isNumerical: false,
        isKeyDimension: true,
        values: [],
        related: [],
        relatedLimitValues: [],
        hierarchy: null,
      },
      {
        __typename: "NominalDimension" as const,
        cubeIri: "https://energy.ld.admin.ch/elcom/electricityprice-canton",
        id: "https://energy.ld.admin.ch/elcom/electricityprice-canton(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)https://energy.ld.admin.ch/elcom/electricityprice/dimension/product" as ComponentId,
        label: "Product",
        scaleType: ScaleType.Nominal,
        isNumerical: false,
        isKeyDimension: true,
        values: [],
        related: [],
        relatedLimitValues: [],
        hierarchy: null,
      },
      {
        __typename: "TemporalDimension" as const,
        timeFormat: "%Y",
        timeUnit: TimeUnit.Year,
        cubeIri:
          "https://energy.ld.admin.ch/sfoe/bfe_ogd18_gebaeudeprogramm_anzahl_gesuche/18",
        id: "https://energy.ld.admin.ch/sfoe/bfe_ogd18_gebaeudeprogramm_anzahl_gesuche(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)https://energy.ld.admin.ch/sfoe/bfe_ogd18_gebaeudeprogramm_anzahl_gesuche/Jahr" as ComponentId,
        label: "Jahr",
        unit: "a",
        scaleType: ScaleType.Interval,
        dataType: "http://www.w3.org/2001/XMLSchema#gYear",
        order: 1,
        isNumerical: false,
        isKeyDimension: true,
        values: [],
        related: [],
        relatedLimitValues: [],
        hierarchy: null,
      },
      {
        __typename: "GeoShapesDimension" as const,
        cubeIri:
          "https://energy.ld.admin.ch/sfoe/bfe_ogd18_gebaeudeprogramm_anzahl_gesuche/18",
        id: "https://energy.ld.admin.ch/sfoe/bfe_ogd18_gebaeudeprogramm_anzahl_gesuche(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)https://energy.ld.admin.ch/sfoe/bfe_ogd18_gebaeudeprogramm_anzahl_gesuche/region" as ComponentId,
        label: "Kanton",
        scaleType: ScaleType.Nominal,
        order: 2,
        isNumerical: false,
        isKeyDimension: true,
        values: [],
        related: [],
        relatedLimitValues: [],
        hierarchy: null,
      },
    ] satisfies DataCubeComponentsQuery["dataCubeComponents"]["dimensions"];

    const joinBy = mkVersionedJoinBy({
      "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/10":
        [
          "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/Jahr" as ComponentId,
          "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/Kanton" as ComponentId,
        ],
      "https://energy.ld.admin.ch/elcom/electricityprice-canton": [
        "https://energy.ld.admin.ch/elcom/electricityprice-canton(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)https://energy.ld.admin.ch/elcom/electricityprice/dimension/period" as ComponentId,
        "https://energy.ld.admin.ch/elcom/electricityprice-canton(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)https://energy.ld.admin.ch/elcom/electricityprice/dimension/canton" as ComponentId,
      ],
      "https://energy.ld.admin.ch/sfoe/bfe_ogd18_gebaeudeprogramm_anzahl_gesuche/18":
        [
          "https://energy.ld.admin.ch/sfoe/bfe_ogd18_gebaeudeprogramm_anzahl_gesuche(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)https://energy.ld.admin.ch/sfoe/bfe_ogd18_gebaeudeprogramm_anzahl_gesuche/Jahr" as ComponentId,
          "https://energy.ld.admin.ch/sfoe/bfe_ogd18_gebaeudeprogramm_anzahl_gesuche(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)https://energy.ld.admin.ch/sfoe/bfe_ogd18_gebaeudeprogramm_anzahl_gesuche/region" as ComponentId,
        ],
    } satisfies BaseOf<VersionedJoinBy>);

    const result = joinDimensions({
      joinBy,
      dimensions,
    });
    expect(result).toMatchInlineSnapshot(`
[
  {
    "__typename": "TemporalDimension",
    "cubeIri": "joinBy",
    "dataType": "http://www.w3.org/2001/XMLSchema#gYear",
    "description": "Jahr, in welchem die EIV ausbezahlt wurde",
    "hierarchy": null,
    "id": "joinBy__0",
    "isJoinByDimension": true,
    "isKeyDimension": true,
    "isNumerical": false,
    "label": "Jahr der Vergütung, Period, Jahr",
    "order": 1,
    "originalIds": [
      {
        "cubeIri": "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/10",
        "description": "Jahr, in welchem die EIV ausbezahlt wurde",
        "dimensionId": "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/Jahr",
        "label": "Jahr der Vergütung",
      },
      {
        "cubeIri": "https://energy.ld.admin.ch/elcom/electricityprice-canton",
        "description": "Jahr, in welchem die EIV ausbezahlt wurde",
        "dimensionId": "https://energy.ld.admin.ch/elcom/electricityprice-canton(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)https://energy.ld.admin.ch/elcom/electricityprice/dimension/period",
        "label": "Period",
      },
      {
        "cubeIri": "https://energy.ld.admin.ch/sfoe/bfe_ogd18_gebaeudeprogramm_anzahl_gesuche/18",
        "description": "",
        "dimensionId": "https://energy.ld.admin.ch/sfoe/bfe_ogd18_gebaeudeprogramm_anzahl_gesuche(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)https://energy.ld.admin.ch/sfoe/bfe_ogd18_gebaeudeprogramm_anzahl_gesuche/Jahr",
        "label": "Jahr",
      },
    ],
    "related": [],
    "relatedLimitValues": [],
    "scaleType": "Interval",
    "timeFormat": "%Y",
    "timeUnit": "Year",
    "unit": "a",
    "values": [],
  },
  {
    "__typename": "GeoShapesDimension",
    "cubeIri": "joinBy",
    "description": "Kanton, in welchem die geförderten Anlagen stehen",
    "hierarchy": null,
    "id": "joinBy__1",
    "isJoinByDimension": true,
    "isKeyDimension": true,
    "isNumerical": false,
    "label": "Kanton, Canton",
    "order": 2,
    "originalIds": [
      {
        "cubeIri": "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/10",
        "description": "Kanton, in welchem die geförderten Anlagen stehen",
        "dimensionId": "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/Kanton",
        "label": "Kanton",
      },
      {
        "cubeIri": "https://energy.ld.admin.ch/elcom/electricityprice-canton",
        "description": "Kanton, in welchem die geförderten Anlagen stehen",
        "dimensionId": "https://energy.ld.admin.ch/elcom/electricityprice-canton(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)https://energy.ld.admin.ch/elcom/electricityprice/dimension/canton",
        "label": "Canton",
      },
      {
        "cubeIri": "https://energy.ld.admin.ch/sfoe/bfe_ogd18_gebaeudeprogramm_anzahl_gesuche/18",
        "description": "",
        "dimensionId": "https://energy.ld.admin.ch/sfoe/bfe_ogd18_gebaeudeprogramm_anzahl_gesuche(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)https://energy.ld.admin.ch/sfoe/bfe_ogd18_gebaeudeprogramm_anzahl_gesuche/region",
        "label": "Kanton",
      },
    ],
    "related": [],
    "relatedLimitValues": [],
    "scaleType": "Nominal",
    "values": [],
  },
  {
    "__typename": "NominalDimension",
    "cubeIri": "https://energy.ld.admin.ch/elcom/electricityprice-canton",
    "hierarchy": null,
    "id": "https://energy.ld.admin.ch/elcom/electricityprice-canton(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)https://energy.ld.admin.ch/elcom/electricityprice/dimension/category",
    "isKeyDimension": true,
    "isNumerical": false,
    "label": "Consumption profiles of typical households",
    "related": [],
    "relatedLimitValues": [],
    "scaleType": "Nominal",
    "values": [],
  },
  {
    "__typename": "NominalDimension",
    "cubeIri": "https://energy.ld.admin.ch/elcom/electricityprice-canton",
    "hierarchy": null,
    "id": "https://energy.ld.admin.ch/elcom/electricityprice-canton(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)https://energy.ld.admin.ch/elcom/electricityprice/dimension/product",
    "isKeyDimension": true,
    "isNumerical": false,
    "label": "Product",
    "related": [],
    "relatedLimitValues": [],
    "scaleType": "Nominal",
    "values": [],
  },
]
`);
  });
});
