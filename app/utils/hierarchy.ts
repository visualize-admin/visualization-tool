import { ascending } from "d3";

import { SelectTreeProps } from "@/components/select-tree";
import { OptionGroup, Option } from "@/configurator";
import { HierarchyParents } from "@/configurator/components/use-hierarchy-parents";
import { HierarchyValue } from "@/graphql/resolver-types";
import { sortHierarchy } from "@/rdf/tree-utils";

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

export const hierarchyToOptions = (hierarchy: HierarchyValue[]) => {
  const transform = (h: HierarchyValue): SelectTreeProps["options"][number] => {
    return {
      ...h,
      selectable: !!h.hasValue,
      children:
        h.children && h.children.length > 0
          ? h.children.map(transform)
          : undefined,
    };
  };
  return sortHierarchy(hierarchy).map((h) => transform(h));
};
