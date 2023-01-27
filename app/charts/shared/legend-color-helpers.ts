import { ascending } from "d3";

import { HierarchyValue } from "@/graphql/resolver-types";
import { bfs } from "@/utils/bfs";

export const getLegendGroups = ({
  title,
  labels,
  getLabel,
  hierarchy,
  sort,
  useAbbreviations,
  labelIris,
}: {
  title?: string;
  labels: string[];
  getLabel: (d: string) => string;
  hierarchy?: HierarchyValue[] | null;
  sort: boolean;
  useAbbreviations: boolean;
  labelIris?: Record<string, any>;
}) => {
  const groupsMap = new Map<HierarchyValue[], string[]>();

  if (!hierarchy) {
    groupsMap.set(title ? [{ label: title } as HierarchyValue] : [], labels);
  } else {
    const labelSet = new Set(labels);

    const emptyParents: HierarchyValue[] = [];

    bfs(hierarchy, (node, { parents: _parents }) => {
      const label = getLabel(
        useAbbreviations ? node.alternateName || node.label : node.label
      );

      if (!labelSet.has(label)) {
        return;
      }

      if (labelIris && !labelIris?.[node.value]) {
        return;
      }

      const parents = _parents.length === 0 ? emptyParents : _parents;
      groupsMap.set(parents, groupsMap.get(parents) || []);
      groupsMap.get(parents)?.push(label);
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
