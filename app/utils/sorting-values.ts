import { SortingField } from "@/configurator";
import { DimensionValue } from "@/domain/data";

import { DataCubeObservationsQuery } from "../graphql/query-hooks";

const maybeInt = (value?: string): number | string => {
  if (!value) {
    return Infinity;
  }

  const maybeInt = parseInt(value, 10);

  if (isNaN(maybeInt)) {
    return value;
  }

  return maybeInt;
};

export const makeDimensionValueSorters = (
  dimension:
    | NonNullable<
        DataCubeObservationsQuery["dataCubeByIri"]
      >["dimensions"][number]
    | undefined,
  options: {
    sorting?: NonNullable<SortingField["sorting"]> | undefined;
    sumsBySegment?: Record<string, number | null>;
    measureBySegment?: Record<string, number | null>;
  } = {}
): ((label: DimensionValue["label"]) => string | undefined | number)[] => {
  const { sorting, sumsBySegment, measureBySegment } = options;
  const sortingType = sorting?.sortingType;

  if (!dimension) {
    return [];
  }
  const valuesByLabel = new Map<string, DimensionValue>(
    dimension.values.map((v) => [v.label, v])
  );

  const getLabel = (label?: string) => label;
  const getIdentifier = (label?: string) => {
    const identifier = label
      ? maybeInt(valuesByLabel.get(label)?.identifier) ?? Infinity
      : Infinity;
    return identifier;
  };
  const getPosition = (label?: string) =>
    label ? valuesByLabel.get(label)?.position ?? Infinity : Infinity;

  const getSum = (label?: string) =>
    label ? sumsBySegment?.[label] ?? Infinity : Infinity;

  const getMeasure = (label?: string) =>
    label ? measureBySegment?.[label] ?? Infinity : Infinity;

  let sorters: ((
    dv: DimensionValue["label"]
  ) => string | undefined | number)[] = [];

  const defaultSorters = [getPosition, getIdentifier, getLabel];

  switch (sortingType) {
    case "byDimensionLabel":
      sorters = [getLabel];
      break;
    case "byTotalSize":
      sorters = [getSum];
      break;
    case "byMeasure":
      sorters = [getMeasure];
      break;
    case "byAuto":
      sorters = [getPosition, getIdentifier];
      break;
    default:
      sorters = defaultSorters;
  }

  return sorters;
};

interface Value {
  label: string;
  position?: number;
}

export const valueComparator = (locale: string) => (a: Value, b: Value) => {
  if (a.position !== undefined && b.position !== undefined) {
    return a.position < b.position ? -1 : 1;
  } else {
    return a.label.localeCompare(b.label, locale);
  }
};

export const getSortingOrders = (
  sorters: ((...args: any[]) => any)[],
  sorting: SortingField["sorting"]
) => {
  return Array(sorters.length).fill(
    sorting?.sortingOrder === "desc" ? "desc" : "asc"
  );
};
