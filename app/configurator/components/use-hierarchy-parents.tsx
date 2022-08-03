import { groups } from "d3-array";
import { uniqBy } from "lodash";
import { useMemo } from "react";

import { useDimensionHierarchyQuery } from "@/graphql/query-hooks";
import { DataCubeMetadata } from "@/graphql/types";
import { dfs } from "@/lib/dfs";

const useHierarchyParents = (
  cubeIri: string,
  dimension: DataCubeMetadata["dimensions"][number],
  locale: string
) => {
  const [hierarchyResp] = useDimensionHierarchyQuery({
    variables: {
      cubeIri: cubeIri,
      dimensionIri: dimension.iri,
      locale: locale,
    },
  });
  const hierarchy =
    hierarchyResp?.data?.dataCubeByIri?.dimensionByIri?.hierarchy;
  return useMemo(() => {
    if (!hierarchy) {
      return;
    }
    const values = dimension.values;
    const valueSet = new Set(values.map((v) => v.value));
    const dimensionValues = uniqBy(
      [
        ...dfs(hierarchy, (node, { depth, parents }) => ({
          node,
          parents,
          depth,
        })),
      ].filter(({ node }) => {
        return valueSet.has(node.value);
      }),
      (x) => x.node.value
    );
    return groups(dimensionValues, (v) => v.parents);
  }, [dimension.values, hierarchy]);
};

export default useHierarchyParents;
