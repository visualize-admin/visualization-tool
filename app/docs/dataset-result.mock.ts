import { PartialSearchCube } from "@/domain/data";
import { DataCubePublicationStatus } from "@/graphql/query-hooks";

export const waldDatacubeResult: PartialSearchCube = {
  iri: "http://example.com/iri",
  creator: {
    iri: "http://example.com/iri",
    label: "BAFU",
  },
  themes: [
    {
      label: "Administration",
      iri: "http://lindas.com/adminstration",
    },
  ],
  title:
    "Comptes des exploitations forestières en francs selon Année, Zone forestière, Canton et Variable",
  description: "Comptes des exploitations forestières en francs, dès 2015",
  datePublished: "2020-10-10",
  publicationStatus: DataCubePublicationStatus.Published,
  dimensions: [],
};
