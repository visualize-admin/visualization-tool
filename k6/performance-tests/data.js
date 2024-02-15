const cubes = [
  {
    iri: "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/9",
    label: "Photovoltaikanlagen/9",
    filters: {
      "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/Kanton":
        {
          type: "single",
          value: "https://ld.admin.ch/canton/1",
        },
    },
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
    filters: {
      "https://environment.ld.admin.ch/foen/nfi/unitOfReference": {
        type: "single",
        value: "https://ld.admin.ch/country/CHE",
      },
      "https://environment.ld.admin.ch/foen/nfi/classificationUnit": {
        type: "single",
        value:
          "https://environment.ld.admin.ch/foen/nfi/ClassificationUnit/Total",
      },
      "https://environment.ld.admin.ch/foen/nfi/inventory": {
        type: "single",
        value: "https://environment.ld.admin.ch/foen/nfi/Inventory/150",
      },
      "https://environment.ld.admin.ch/foen/nfi/unitOfEvaluation": {
        type: "single",
        value: "https://environment.ld.admin.ch/foen/nfi/UnitOfEvaluation/2382",
      },
      "https://environment.ld.admin.ch/foen/nfi/evaluationType": {
        type: "single",
        value: "https://environment.ld.admin.ch/foen/nfi/EvaluationType/1",
      },
    },
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
    filters: {
      "https://energy.ld.admin.ch/elcom/electricityprice/dimension/municipality":
        {
          type: "single",
          value: "https://ld.admin.ch/municipality/1",
        },
      "https://energy.ld.admin.ch/elcom/electricityprice/dimension/category": {
        type: "single",
        value: "https://energy.ld.admin.ch/elcom/electricityprice/category/C1",
      },
      "https://energy.ld.admin.ch/elcom/electricityprice/dimension/operator": {
        type: "single",
        value: "https://energy.ld.admin.ch/elcom/electricityprice/operator/486",
      },
      "https://energy.ld.admin.ch/elcom/electricityprice/dimension/product": {
        type: "single",
        value:
          "https://energy.ld.admin.ch/elcom/electricityprice/product/standard",
      },
    },
    queries: {
      DataCubeComponents: { expectedDuration: 10000 },
      DataCubeMetadata: { expectedDuration: 250 },
      DataCubeObservations: { expectedDuration: 4000 },
      DataCubePreview: { expectedDuration: 750 },
      PossibleFilters: { expectedDuration: 3500 },
    },
  },
];

module.exports = cubes;
