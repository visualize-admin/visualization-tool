import { DataCubesComponentsOptions } from "@/graphql/hooks";

export const useDataCubesComponentsQueryVariables: Record<
  string,
  DataCubesComponentsOptions["variables"]
> = {
  oneCube: {
    sourceType: "sparql",
    sourceUrl: "https://lindas.cz-aws.net/query",
    locale: "de",
    cubeFilters: [
      {
        iri: "https://energy.ld.admin.ch/sfoe/bfe_ogd18_gebaeudeprogramm_energiewirkung/6",
        componentIds: [
          "http://schema.org/amount",
          "https://energy.ld.admin.ch/sfoe/bfe_ogd18_gebaeudeprogramm_energiewirkung/Jahr",
          "https://energy.ld.admin.ch/sfoe/bfe_ogd18_gebaeudeprogramm_energiewirkung/massnahmenbereich",
          "https://energy.ld.admin.ch/sfoe/bfe_ogd18_gebaeudeprogramm_energiewirkung/region",
        ],
        filters: {
          "https://energy.ld.admin.ch/sfoe/bfe_ogd18_gebaeudeprogramm_energiewirkung/region":
            { type: "single", value: "https://ld.admin.ch/country/CHE" },
          "https://energy.ld.admin.ch/sfoe/bfe_ogd18_gebaeudeprogramm_energiewirkung/massnahmenbereich":
            {
              type: "single",
              value:
                "https://energy.ld.admin.ch/sfoe/bfe_ogd18_gebaeudeprogramm_energiewirkung/ogd18_catalog/Haustechnik",
            },
        },
        loadValues: true,
      },
    ],
  },
  twoCubes: {
    sourceType: "sparql",
    sourceUrl: "https://lindas.cz-aws.net/query",
    locale: "de",
    cubeFilters: [
      {
        iri: "https://energy.ld.admin.ch/sfoe/bfe_ogd18_gebaeudeprogramm_energiewirkung/6",
        componentIds: [
          "http://schema.org/amount",
          "https://energy.ld.admin.ch/sfoe/bfe_ogd18_gebaeudeprogramm_energiewirkung/Jahr",
          "https://energy.ld.admin.ch/sfoe/bfe_ogd18_gebaeudeprogramm_energiewirkung/massnahmenbereich",
          "https://energy.ld.admin.ch/sfoe/bfe_ogd18_gebaeudeprogramm_energiewirkung/region",
        ],
        filters: {
          "https://energy.ld.admin.ch/sfoe/bfe_ogd18_gebaeudeprogramm_energiewirkung/region":
            { type: "single", value: "https://ld.admin.ch/country/CHE" },
          "https://energy.ld.admin.ch/sfoe/bfe_ogd18_gebaeudeprogramm_energiewirkung/massnahmenbereich":
            {
              type: "single",
              value:
                "https://energy.ld.admin.ch/sfoe/bfe_ogd18_gebaeudeprogramm_energiewirkung/ogd18_catalog/Haustechnik",
            },
        },
        joinBy: [
          "https://energy.ld.admin.ch/sfoe/bfe_ogd18_gebaeudeprogramm_energiewirkung/Jahr",
        ],
        loadValues: true,
      },
      {
        iri: "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/9",
        componentIds: [
          "http://schema.org/amount",
          "https://energy.ld.admin.ch/sfoe/bfe_ogd18_gebaeudeprogramm_energiewirkung/Jahr",
          "https://energy.ld.admin.ch/sfoe/bfe_ogd18_gebaeudeprogramm_energiewirkung/massnahmenbereich",
          "https://energy.ld.admin.ch/sfoe/bfe_ogd18_gebaeudeprogramm_energiewirkung/region",
        ],
        filters: {},
        joinBy: [
          "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/Jahr",
        ],
        loadValues: true,
      },
    ],
  },
};
