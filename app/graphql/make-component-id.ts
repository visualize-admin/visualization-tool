import mapKeys from "lodash/mapKeys";

import { Filters, SingleFilters } from "@/config-types";

const ID_SEPARATOR = "___";

export type ComponentId = string & { __componentId: true };

export const stringifyComponentId = ({
  unversionedCubeIri,
  unversionedComponentIri,
}: {
  unversionedCubeIri: string;
  unversionedComponentIri: string;
}): ComponentId =>
  `${unversionedCubeIri}${ID_SEPARATOR}${unversionedComponentIri}` as ComponentId;

export const parseComponentId = (id: ComponentId) => {
  const [unversionedCubeIri, unversionedComponentIri] = id.split(ID_SEPARATOR);

  return {
    unversionedCubeIri,
    unversionedComponentIri: unversionedComponentIri || undefined,
  };
};

export const getFiltersByComponentIris = <T extends Filters | SingleFilters>(
  filters: T
) => {
  return mapKeys(
    filters,
    (_, k) => parseComponentId(k as ComponentId).unversionedComponentIri ?? k
  );
};
