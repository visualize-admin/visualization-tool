import { FilterValue, SortingField } from "@/configurator";
import { DimensionValue } from "@/domain/data";
import { DimensionMetadataWithHierarchiesFragment } from "@/graphql/query-hooks";

import { bfs } from "./bfs";
import { uniqueMapBy } from "./uniqueMapBy";

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
  dimension: DimensionMetadataWithHierarchiesFragment | undefined,
  options: {
    dimensionFilter?: FilterValue;
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
  } = {
    dimensionFilter: undefined,
  }
): ((label: string) => string | undefined | number)[] => {
  const {
    sorting,
    sumsBySegment,
    measureBySegment,
    useAbbreviations,
    dimensionFilter,
  } = options;
  const sortingType = sorting?.sortingType;

  if (!dimension) {
    return [];
  }

  const addAlternateName = (d: DimensionValue) => ({
    ...d,
    label: d.alternateName ?? d.label,
  });

  let values = useAbbreviations
    ? dimension.values.map(addAlternateName)
    : dimension.values;

  if (dimensionFilter?.type === "multi") {
    const filterValues = dimensionFilter.values;
    values = values.filter((dv) => filterValues[dv.value]);
  }

  const allHierarchyValues = bfs(dimension.hierarchy ?? [], (node) => node);

  // For hierarchies, we always fetch /__iri__.
  const hierarchyValuesByValue = uniqueMapBy(
    allHierarchyValues,
    (dv) => dv.value
  );
  const valuesByValue = uniqueMapBy(values, (dv) => dv.value);
  // Warning: if two values have the same label and have an identifier / position
  // there could be problems as we could select the "wrong" value for the order
  const valuesByLabel = uniqueMapBy(values, (dv) => dv.label);

  const getByValueOrLabel = (valueOrLabel: string) => {
    return valuesByValue.get(valueOrLabel) ?? valuesByLabel.get(valueOrLabel);
  };

  const getLabel = (valueOrLabel?: string) => {
    const label = valueOrLabel ? getByValueOrLabel(valueOrLabel)?.label : "";
    return label;
  };
  const getIdentifier = (valueOrLabel?: string) => {
    const identifier = valueOrLabel
      ? maybeInt(getByValueOrLabel(valueOrLabel)?.identifier) ?? Infinity
      : Infinity;
    return identifier;
  };
  const getPosition = (valueOrLabel?: string) => {
    const position = valueOrLabel
      ? getByValueOrLabel(valueOrLabel)?.position ?? Infinity
      : Infinity;
    return position;
  };
  const getHierarchy = (value?: string) => {
    const hierarchyValue = value
      ? hierarchyValuesByValue.get(value)
      : undefined;

    // A depth of -1 means that the value was not originally in the hierarchy,
    // but was added artificially.
    if (hierarchyValue?.depth === -1) {
      return Infinity;
    }

    return hierarchyValue?.depth;
  };

  const getSum = (valueOrLabel?: string) =>
    valueOrLabel ? sumsBySegment?.[valueOrLabel] ?? Infinity : Infinity;

  const getMeasure = (valueOrLabel?: string) =>
    valueOrLabel ? measureBySegment?.[valueOrLabel] ?? Infinity : Infinity;

  let sorters: ((dv: string) => string | undefined | number)[] = [];

  const defaultSorters = [getHierarchy, getPosition, getIdentifier, getLabel];

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
      sorters = defaultSorters;
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
