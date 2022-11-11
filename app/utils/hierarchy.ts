import { ascending } from "d3";

import { OptionGroup, Option } from "@/configurator";
import { HierarchyParents } from "@/configurator/components/use-hierarchy-parents";
import { HierarchyValue } from "@/graphql/query-hooks";

const asGroup = (
  parents: Omit<HierarchyValue, "depth" | "__typename" | "children">[]
) => {
  return {
    label: parents.map((p) => p.label).join(" > "),
    value: parents.map((p) => p.value).join("$"),
  };
};

export const makeOptionGroups = (
  hierarchyParents: HierarchyParents | undefined
) => {
  if (!hierarchyParents) {
    return undefined;
  }
  return hierarchyParents
    .map(
      ([parents, dfsRes]) =>
        [asGroup(parents), dfsRes.map((d) => d.node)] as [
          OptionGroup,
          (Option & { depth: number })[]
        ]
    )
    .sort((a, b) => ascending(a[1][0].depth, b[1][0].depth));
};
