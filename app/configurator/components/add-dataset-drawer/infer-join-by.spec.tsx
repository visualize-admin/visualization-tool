import mapValues from "lodash/mapValues";

import { ComponentId, stringifyComponentId } from "@/graphql/make-component-id";
import { DataCubePublicationStatus, TimeUnit } from "@/graphql/query-hooks";

import { findDimensionForOption, inferJoinBy } from "./infer-join-by";
import { SearchOptions } from "./types";

const selectedSearchDimensions: SearchOptions[] = [
  {
    type: "temporal",
    id: stringifyComponentId({
      unversionedCubeIri:
        "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen",
      unversionedComponentIri:
        "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/Jahr",
    }),
    label: "Jahr der Vergütung",
    timeUnit: TimeUnit.Year,
    originalIds: [
      {
        cubeIri:
          "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/10",
        dimensionId: stringifyComponentId({
          unversionedCubeIri:
            "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen",
          unversionedComponentIri:
            "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/Jahr",
        }),
      },
    ],
  },
  {
    type: "shared" as const,
    id: stringifyComponentId({
      unversionedCubeIri:
        "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen",
      unversionedComponentIri:
        "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/Kanton",
    }),
    label: "Kanton",
    originalIds: [
      {
        cubeIri:
          "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/10",
        dimensionId: stringifyComponentId({
          unversionedCubeIri:
            "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen",
          unversionedComponentIri:
            "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/Kanton",
        }),
      },
    ],
    termsets: [
      {
        iri: "https://ld.admin.ch/dimension/canton",
        label: "Cantons",
        __typename: "Termset" as const,
      },
    ],
  },
];

const cubeElectricityPriceCanton = {
  iri: "https://energy.ld.admin.ch/elcom/electricityprice-canton",
  unversionedIri: "https://energy.ld.admin.ch/elcom/electricityprice-canton",
  title: "Median electricity tariff per canton",
  description: "Median electricity tariff per region & consumption profiles",
  publicationStatus: "PUBLISHED" as DataCubePublicationStatus,
  datePublished: "2021-01-01",
  creator: {
    iri: "https://register.ld.admin.ch/opendataswiss/org/elcom",
    label: "Federal Electricity Commission ElCom",
  },
  themes: [
    {
      iri: "",
      label: "",
    },
  ],
  subthemes: [],
  termsets: [],
  dimensions: [
    {
      id: stringifyComponentId({
        unversionedCubeIri:
          "https://energy.ld.admin.ch/elcom/electricityprice-canton",
        unversionedComponentIri:
          "https://energy.ld.admin.ch/elcom/electricityprice/dimension/period",
      }),
      label: "Period",
      timeUnit: "http://www.w3.org/2006/time#unitYear",
      termsets: [],
    },
    {
      id: stringifyComponentId({
        unversionedCubeIri:
          "https://energy.ld.admin.ch/elcom/electricityprice-canton",
        unversionedComponentIri:
          "https://energy.ld.admin.ch/elcom/electricityprice/dimension/canton",
      }),
      label: "Canton",
      timeUnit: "",
      termsets: [
        {
          iri: "https://ld.admin.ch/dimension/canton",
          label: "Cantons",
        },
      ],
    },
  ],
};

describe("find dimension for option", () => {
  it("should find dimension for temporal option", () => {
    const result = findDimensionForOption(
      selectedSearchDimensions[0],
      cubeElectricityPriceCanton.dimensions
    );
    expect(result).toMatchInlineSnapshot(`
Object {
  "id": "https://energy.ld.admin.ch/elcom/electricityprice-canton(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)https://energy.ld.admin.ch/elcom/electricityprice/dimension/period",
  "label": "Period",
  "termsets": Array [],
  "timeUnit": "http://www.w3.org/2006/time#unitYear",
}
`);
  });
});

describe("inferJoinBy", () => {
  it("should infer join-by dimensions correctly", () => {
    const result = inferJoinBy(
      selectedSearchDimensions,
      cubeElectricityPriceCanton
    );

    expect(result).toMatchInlineSnapshot(`
Object {
  "https://energy.ld.admin.ch/elcom/electricityprice-canton": Array [
    "https://energy.ld.admin.ch/elcom/electricityprice-canton(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)https://energy.ld.admin.ch/elcom/electricityprice/dimension/period",
    "https://energy.ld.admin.ch/elcom/electricityprice-canton(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)https://energy.ld.admin.ch/elcom/electricityprice/dimension/canton",
  ],
  "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/10": Array [
    "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/Jahr",
    "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/Kanton",
  ],
}
`);
  });

  it("shoud infer infer join-by dimensions correctly 2", () => {
    const options = {
      options: [
        {
          type: "temporal" as const,
          id: "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/Jahr" as ComponentId,
          originalIds: [
            {
              cubeIri:
                "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/10",
              dimensionId:
                "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/Jahr" as ComponentId,
            },
          ],
          label: "Jahr der Vergütung",
          timeUnit: TimeUnit.Year,
        },
        {
          type: "shared" as const,
          id: "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/Kanton" as ComponentId,
          label: "Kanton",
          termsets: [
            {
              iri: "https://ld.admin.ch/dimension/canton",
              label: "Cantons",
              __typename: "Termset" as const,
            },
          ],
          originalIds: [
            {
              cubeIri:
                "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/10",
              dimensionId:
                "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/Kanton" as ComponentId,
            },
          ],
        },
      ],
      newCube: {
        iri: "https://energy.ld.admin.ch/elcom/electricityprice-canton",
        unversionedIri:
          "https://energy.ld.admin.ch/elcom/electricityprice-canton",
        title: "Median electricity tariff per canton",
        description:
          "Median electricity tariff per region & consumption profiles",
        publicationStatus: "PUBLISHED" as DataCubePublicationStatus,
        datePublished: "2021-01-01",
        creator: {
          iri: "https://register.ld.admin.ch/opendataswiss/org/elcom",
          label: "Federal Electricity Commission ElCom",
        },
        themes: [{ iri: "", label: "" }],
        subthemes: [],
        termsets: [],
        dimensions: [
          {
            id: "https://energy.ld.admin.ch/elcom/electricityprice-canton(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)https://energy.ld.admin.ch/elcom/electricityprice/dimension/period" as ComponentId,
            label: "Period",
            timeUnit: "http://www.w3.org/2006/time#unitYear",
            termsets: [],
          },
          {
            id: "https://energy.ld.admin.ch/elcom/electricityprice-canton(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)https://energy.ld.admin.ch/elcom/electricityprice/dimension/canton" as ComponentId,
            label: "Canton",
            timeUnit: "",
            termsets: [
              {
                iri: "https://ld.admin.ch/dimension/canton",
                label: "Cantons",
                __typename: "Termset",
              },
            ],
          },
        ],
      },
    };
    const result = inferJoinBy(options.options, options.newCube);
    expect(mapValues(result, (x) => x.map((x) => x.split("/").pop())))
      .toMatchInlineSnapshot(`
Object {
  "https://energy.ld.admin.ch/elcom/electricityprice-canton": Array [
    "period",
    "canton",
  ],
  "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/10": Array [
    "Jahr",
    "Kanton",
  ],
}
`);
  });
});
