import { groups } from "d3-array";
import { useMemo } from "react";

import { Dimension, HierarchyValue } from "@/domain/data";
import { bfs } from "@/utils/bfs";

export type HierarchyParents = [
  HierarchyValue[],
  { node: HierarchyValue; parents: HierarchyValue[] }[]
][];

export const groupByParents = (hierarchy: HierarchyValue[]) => {
  const allHierarchyValues = bfs(hierarchy, (node, { depth, parents }) => ({
    node,
    parents,
    depth,
  }));

  return groups(allHierarchyValues, (v) => v.parents);
};

const useHierarchyParents = ({
  dimension,
}: {
  dimension: Dimension;
}): HierarchyParents | undefined => {
  return useMemo(() => {
    if (!dimension.hierarchy) {
      return;
    }

    const values = dimension.values;
    const valueSet = new Set(values.map((v) => v.value));
    const valueGroups = groupByParents(dimension.hierarchy);

    return valueGroups
      .map(([parents, nodes]) => {
        return [parents, nodes.filter((n) => valueSet.has(n.node.value))];
      })
      .filter((x) => x[1].length > 0) as HierarchyParents;
  }, [dimension]);
};

/**
 * Can be used for debugging, pass a hierarchy, and copy the output
 * to graphviz.
 *
 * @see https://dreampuf.github.io/GraphvizOnline/
 */
export const hierarchyToGraphviz = (hierarchy: HierarchyValue[]) => {
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
