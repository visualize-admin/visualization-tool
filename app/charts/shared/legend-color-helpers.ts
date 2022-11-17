import { ascending } from "d3";

import { HierarchyValue } from "@/graphql/resolver-types";
import { dfs } from "@/utils/dfs";

export const getLegendGroups = ({
  title,
  labels,
  hierarchy,
  sort,
}: {
  title?: string;
  labels: string[];
  hierarchy?: HierarchyValue[] | null;
  sort: boolean;
}) => {
  const groupsMap = new Map<HierarchyValue[], string[]>();

  if (!hierarchy) {
    groupsMap.set(title ? [{ label: title } as HierarchyValue] : [], labels);
  } else {
    const labelSet = new Set(labels);
    const emptyParents: HierarchyValue[] = [];

    dfs(hierarchy, (node, { parents: _parents }) => {
      if (!labelSet.has(node.label)) {
        return;
      }

      const parents = _parents.length === 0 ? emptyParents : _parents;
      groupsMap.set(parents, groupsMap.get(parents) || []);
      groupsMap.get(parents)?.push(node.label);
    });
  }

  const groups = Array.from(groupsMap.entries());
  if (sort) {
    // Re-sort hierarchy groups against the label order that we have received
    const labelOrder = Object.fromEntries(labels.map((x, i) => [x, i]));
    groups.forEach(([_, entries]) => {
      entries.sort((a, b) => ascending(labelOrder[a], labelOrder[b]));
    });
  }

  return groups;
};
