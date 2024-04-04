import { ascending } from "d3-array";

import { HierarchyValue } from "@/domain/data";
import { bfs } from "@/utils/bfs";

export const getLegendGroups = ({
  title,
  values,
  hierarchy,
  sort,
  labelIris,
}: {
  title?: string;
  values: string[];
  hierarchy?: HierarchyValue[] | null;
  sort: boolean;
  labelIris?: Record<string, any>;
}) => {
  const groupsMap = new Map<HierarchyValue[], string[]>();

  if (!hierarchy) {
    groupsMap.set(title ? [{ label: title } as HierarchyValue] : [], values);
  } else {
    const emptyParents: HierarchyValue[] = [];

    bfs(hierarchy, (node, { parents: _parents }) => {
      if (labelIris && !labelIris?.[node.value]) {
        return;
      }

      const parents = _parents.length === 0 ? emptyParents : _parents;
      groupsMap.set(parents, groupsMap.get(parents) || []);

      if (values.includes(node.value)) {
        groupsMap.get(parents)?.push(node.value);
      }
    });
  }

  const groups = Array.from(groupsMap.entries());
  if (sort) {
    // Re-sort hierarchy groups against the label order that we have received
    const valueOrder = Object.fromEntries(values.map((x, i) => [x, i]));
    groups.forEach(([_, entries]) => {
      entries.sort((a, b) => ascending(valueOrder[a], valueOrder[b]));
    });
  }

  return groups;
};
