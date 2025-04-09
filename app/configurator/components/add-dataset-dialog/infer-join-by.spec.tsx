import { SearchOptions } from "@/configurator/components/add-dataset-dialog/types";
import { ComponentId } from "@/graphql/make-component-id";
import { DataCubePublicationStatus } from "@/graphql/query-hooks";

import { inferJoinBy } from "./infer-join-by";

describe("inferJoinBy", () => {
  it("should infer join-by dimensions correctly", () => {
    const selectedSearchDimensions: SearchOptions[] = [
      {
        type: "temporal",
        id: "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/Jahr" as ComponentId,
        originalIds: [],
        label: "Jahr der Vergütung",
        timeUnit: "Year",
      },
      {
        type: "shared",
        id: "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/Kanton" as ComponentId,
        label: "Kanton",
        termsets: [
          {
            iri: "https://ld.admin.ch/dimension/canton",
            label: "Cantons",
            __typename: "Termset",
          },
        ],
      },
    ];

    const otherCube = {
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
            },
          ],
        },
      ],
    };

    const result = inferJoinBy(selectedSearchDimensions, otherCube);

    expect(result).toEqual({
      left: [
        "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/Jahr",
        "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/Kanton",
      ],
      right: [
        "https://energy.ld.admin.ch/elcom/electricityprice-canton(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)https://energy.ld.admin.ch/elcom/electricityprice/dimension/period",
        "https://energy.ld.admin.ch/elcom/electricityprice-canton(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)https://energy.ld.admin.ch/elcom/electricityprice/dimension/canton",
      ],
    });
  });
});
