import { groups } from "d3-array";
import { useMemo } from "react";

import { DataSource } from "@/configurator/config-types";
import {
  DimensionHierarchyQuery,
  useDimensionHierarchyQuery,
} from "@/graphql/query-hooks";
import { HierarchyValue } from "@/graphql/resolver-types";
import { DataCubeMetadata } from "@/graphql/types";
import { bfs } from "@/utils/bfs";

type NN<T> = NonNullable<T>;
export type DimensionHierarchyQueryHierarchy = NN<
  NN<
    NN<DimensionHierarchyQuery["dataCubeByIri"]>["dimensionByIri"]
  >["hierarchy"]
>;

export type HierarchyParents = [
  HierarchyValue[],
  { node: HierarchyValue; parents: HierarchyValue[] }[]
][];

export const groupByParents = (hierarchy: DimensionHierarchyQueryHierarchy) => {
  const allHierarchyValues = bfs(hierarchy, (node, { depth, parents }) => ({
    node,
    parents,
    depth,
  }));

  return groups(allHierarchyValues, (v) => v.parents);
};

const useHierarchyParents = ({
  datasetIri,
  dataSource,
  dimension,
  locale,
  pause,
}: {
  datasetIri: string;
  dataSource: DataSource;
  dimension: DataCubeMetadata["dimensions"][number];
  locale: string;
  pause?: boolean;
}): {
  fetching: boolean;
  data: HierarchyParents | undefined;
} => {
  const [hierarchyResp] = useDimensionHierarchyQuery({
    variables: {
      cubeIri: datasetIri,
      dimensionIri: dimension?.iri,
      sourceType: dataSource.type,
      sourceUrl: dataSource.url,
      locale: locale,
    },
    pause: pause || !dimension,
  });

  const hierarchy =
    hierarchyResp?.data?.dataCubeByIri?.dimensionByIri?.hierarchy;
  const data = useMemo(() => {
    if (!hierarchy || !dimension) {
      return;
    }
    const values = dimension.values;
    const valueSet = new Set(values.map((v) => v.value));
    const valueGroups = groupByParents(hierarchy);

    return valueGroups
      .map(([parents, nodes]) => {
        return [parents, nodes.filter((n) => valueSet.has(n.node.value))];
      })
      .filter((x) => x[1].length > 0) as HierarchyParents;
  }, [dimension, hierarchy]);

  return useMemo(
    () => ({
      data,
      fetching: hierarchyResp.fetching,
    }),
    [hierarchyResp.fetching, data]
  );
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
  bfs(hierarchy, (node, { parents }) => {
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
