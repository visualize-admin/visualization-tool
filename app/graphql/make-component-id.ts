import { Filters, SingleFilters } from "@/config-types";

const ID_SEPARATOR = "___";

export const stringifyComponentId = ({
  unversionedCubeIri,
  unversionedComponentIri,
}: {
  unversionedCubeIri: string;
  unversionedComponentIri: string;
}) => `${unversionedCubeIri}${ID_SEPARATOR}${unversionedComponentIri}`;

export const parseComponentId = (id: string) => {
  const [unversionedCubeIri, unversionedComponentIri] = id.split(ID_SEPARATOR);

  return {
    unversionedCubeIri,
    unversionedComponentIri: unversionedComponentIri || undefined,
  };
};

export const getFiltersByComponentIris = <T extends Filters | SingleFilters>(
  filters: T
) => {
  return Object.fromEntries(
    Object.entries(filters).map(([k, v]) => [
      parseComponentId(k).unversionedComponentIri ?? k,
      v,
    ])
  ) as T;
};
