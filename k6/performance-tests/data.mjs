export const cubes = [
  {
    iri: "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/9",
    label: "Photovoltaikanlagen/9",
    queries: {
      DataCubeComponents: { expectedDuration: 750 },
      DataCubeMetadata: { expectedDuration: 250 },
      DataCubeObservations: { expectedDuration: 500 },
      DataCubePreview: { expectedDuration: 750 },
      PossibleFilters: { expectedDuration: 600 },
    },
  },
  {
    iri: "https://environment.ld.admin.ch/foen/nfi/nfi_C-20/cube/2023-3",
    label: "NFI/2023-3",
    queries: {
      DataCubeComponents: { expectedDuration: 2000 },
      DataCubeMetadata: { expectedDuration: 250 },
      DataCubeObservations: { expectedDuration: 1500 },
      DataCubePreview: { expectedDuration: 1000 },
      PossibleFilters: { expectedDuration: 1500 },
    },
  },
  {
    iri: "https://energy.ld.admin.ch/elcom/electricityprice",
    label: "Elcom",
    queries: {
      DataCubeComponents: { expectedDuration: 10000 },
      DataCubeMetadata: { expectedDuration: 250 },
      DataCubeObservations: { expectedDuration: 4000 },
      DataCubePreview: { expectedDuration: 750 },
      PossibleFilters: { expectedDuration: 3500 },
    },
  },
];
