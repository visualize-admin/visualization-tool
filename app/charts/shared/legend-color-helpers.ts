import { ascending } from "d3-array";

import { HierarchyValue } from "@/domain/data";

export const getLegendGroups = ({
  title,
  values,
  sort,
}: {
  title?: string;
  values: string[];
  sort: boolean;
}) => {
  const groupsMap = new Map<HierarchyValue[], string[]>();
  groupsMap.set(title ? [{ label: title } as HierarchyValue] : [], values);
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
