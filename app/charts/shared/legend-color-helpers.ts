import { ascending } from "d3";

import { HierarchyValue } from "@/graphql/resolver-types";
import { bfs } from "@/utils/bfs";

export const getLegendGroups = ({
  title,
  labels,
  hierarchy,
  sort,
  labelIris,
}: {
  title?: string;
  labels: string[];
  hierarchy?: HierarchyValue[] | null;
  sort: boolean;
  labelIris?: Record<string, any>;
}) => {
  const groupsMap = new Map<HierarchyValue[], string[]>();

  if (!hierarchy) {
    groupsMap.set(title ? [{ label: title } as HierarchyValue] : [], labels);
  } else {
    const emptyParents: HierarchyValue[] = [];

    bfs(hierarchy, (node, { parents: _parents }) => {
      if (labelIris && !labelIris?.[node.value]) {
        return;
      }

      const parents = _parents.length === 0 ? emptyParents : _parents;
      groupsMap.set(parents, groupsMap.get(parents) || []);
      groupsMap.get(parents)?.push(node.value);
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
