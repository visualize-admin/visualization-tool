import { DataCubeObservationsQuery } from "../graphql/query-hooks";

export const makeOrdinalDimensionSorter = (
  dimension: NonNullable<
    DataCubeObservationsQuery["dataCubeByIri"]
  >["dimensions"][number]
) => {
  const positionsByLabel = new Map<string, number | undefined>(
    dimension.values.map((v) => [v.label, v.position])
  );
  return (label?: string) => (label ? positionsByLabel.get(label) ?? -1 : -1);
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
