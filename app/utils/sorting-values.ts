import { SortingField } from "@/configurator";
import { DimensionValue } from "@/domain/data";

import { DataCubeObservationsQuery } from "../graphql/query-hooks";

const maybeInt = (s?: string) => {
  if (!s) {
    return Infinity;
  }
  try {
    return parseInt(s, 10);
  } catch {
    return s;
  }
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

  const defaultSorters = [getIdentifier, getPosition];

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
      sorters = [getIdentifier, getPosition];
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
