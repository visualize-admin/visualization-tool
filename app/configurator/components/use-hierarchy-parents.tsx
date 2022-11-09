import { groups } from "d3-array";
import { useMemo } from "react";

import { DataSource } from "@/configurator/config-types";
import {
  DimensionHierarchyQuery,
  useDimensionHierarchyQuery,
} from "@/graphql/query-hooks";
import { DataCubeMetadata } from "@/graphql/types";
import { dfs } from "@/utils/dfs";

type NN<T> = NonNullable<T>;
export type DimensionHierarchyQueryHierarchy = NN<
  NN<
    NN<DimensionHierarchyQuery["dataCubeByIri"]>["dimensionByIri"]
  >["hierarchy"]
>;

export const groupByParents = (hierarchy: DimensionHierarchyQueryHierarchy) => {
  const allHierarchyValues = [
    ...dfs(hierarchy, (node, { depth, parents }) => ({
      node,
      parents,
      depth,
    })),
  ];

  return groups(allHierarchyValues, (v) => v.parents);
};

const useHierarchyParents = (
  dataSet: string,
  dataSource: DataSource,
  dimension: DataCubeMetadata["dimensions"][number],
  locale: string,
  pause?: boolean
) => {
  const [hierarchyResp] = useDimensionHierarchyQuery({
    variables: {
      cubeIri: dataSet,
      dimensionIri: dimension.iri,
      sourceType: dataSource.type,
      sourceUrl: dataSource.url,
      locale: locale,
    },
    pause: pause,
  });
  const hierarchy =
    hierarchyResp?.data?.dataCubeByIri?.dimensionByIri?.hierarchy;
  return useMemo(() => {
    if (!hierarchy) {
      return;
    }
    const valueSet = new Set(dimension.values.map((x) => x.value));
    return groupByParents(hierarchy)
      .map(
        ([parents, values]) =>
          [parents, values.filter((x) => valueSet.has(x.node.value))] as const
      )
      .filter(([_parents, values]) => values.length > 0);
  }, [dimension.values, hierarchy]);
};

/**
 * Can be used for debugging, pass a hierarchy, and copy the output
 * to graphviz.
 *
 * @see https://dreampuf.github.io/GraphvizOnline/
 */
export const hierarchyToGraphviz = (
  hierarchy: DimensionHierarchyQueryHierarchy
) => {
  const lines = [] as string[];
  dfs(hierarchy, (node, { depth, parents }) => {
    lines.push(`"${node.value}"[label="${node.label.replace(/"/g, "")}"]`);
    if (parents.length > 0) {
      const parent = parents[parents.length - 1];
      lines.push(`"${parent.value}" -> "${node.value}"`);
    }
  });
  return `
    digraph G {
      rankdir=LR

      ${lines.join("\n")}
    }
  `;
};

export default useHierarchyParents;
