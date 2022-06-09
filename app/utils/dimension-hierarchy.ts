import {
  HierarchyValue,
  useDimensionHierarchyQuery,
} from "../graphql/query-hooks";

export type DimensionHierarchy = {
  dimensionIri: string;
  children: DimensionHierarchy[];
};

export const useHierarchicalDimensionValuesQuery = ({
  dimensionIri,
  locale,
  dataSetIri,
}: {
  dimensionIri: string;
  locale: string;
  dataSetIri: string;
}): {
  data: HierarchyValue[] | undefined | null;
  fetching?: boolean | undefined;
} => {
  const [{ fetching, data }] = useDimensionHierarchyQuery({
    variables: {
      cubeIri: dataSetIri,
      locale,
      dimensionIri,
    },
  });

  return { data: data?.dataCubeByIri?.dimensionByIri?.hierarchy, fetching };
};
