import { SortingField } from "@/configurator";
import { DimensionValue } from "@/domain/data";

import { DataCubeObservationsQuery } from "../graphql/query-hooks";

const maybeInt = (value?: string | number): number | string => {
  if (!value) {
    return Infinity;
  }

  if (typeof value === "number") {
    return value;
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
    sorting?:
      | NonNullable<SortingField["sorting"]>
      | {
          sortingType: "byTableSortingType";
          sortingOrder: "asc";
        }
      | undefined;
    sumsBySegment?: Record<string, number | null>;
    measureBySegment?: Record<string, number | null>;
    useAbbreviations?: boolean;
  } = {}
): ((label: string) => string | undefined | number)[] => {
  const { sorting, sumsBySegment, measureBySegment, useAbbreviations } =
    options;
  const sortingType = sorting?.sortingType;

  if (!dimension) {
    return [];
  }

  const values = useAbbreviations
    ? dimension.values.map((d) => ({
        ...d,
        label: d.alternateName ?? d.label,
      }))
    : dimension.values;
  const valuesByLabel = new Map<string, DimensionValue>(
    values.map((v) => [v.label, v])
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

  let sorters: ((dv: string) => string | undefined | number)[] = [];

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
    case "byTableSortingType":
      sorters = [getPosition, getLabel];
    default:
      sorters = defaultSorters;
  }

  return sorters;
};

interface Value {
  label: string;
  position?: number;
  identifier?: number | string;
}

export const valueComparator = (locale: string) => (a: Value, b: Value) => {
  if (a.identifier !== undefined && b.identifier !== undefined) {
    return a.identifier < b.identifier ? -1 : 1;
  } else if (a.position !== undefined && b.position !== undefined) {
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
