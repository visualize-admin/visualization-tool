import { Client } from "urql";
import { vi } from "vitest";

import { stringifyComponentId } from "@/graphql/make-component-id";
import { PossibleFilterValue } from "@/graphql/query-hooks";
import { getCachedComponentsMock } from "@/urql-cache.mock";

const possibleFilters: PossibleFilterValue[] = [
  {
    __typename: "PossibleFilterValue",
    id: stringifyComponentId({
      unversionedCubeIri: "mapDataset",
      unversionedComponentIri: "symbolLayerIri",
    }),
    type: "single",
    value: "xPossible",
  },
];

export const mockClient = {
  query: vi.fn(() => ({
    toPromise: vi.fn().mockResolvedValue({
      data: {
        dataCubePreview: getCachedComponentsMock.geoAndNumerical,
        dataCubeComponents: getCachedComponentsMock.geoAndNumerical,
        possibleFilters,
      },
    }),
  })),
  readQuery: vi.fn().mockReturnValue(null),
} as unknown as Client;
