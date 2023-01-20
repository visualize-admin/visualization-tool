import { ascending } from "d3";

import { SelectTreeProps } from "@/components/select-tree";
import { OptionGroup, Option } from "@/configurator";
import { HierarchyParents } from "@/configurator/components/use-hierarchy-parents";
import { DimensionValue } from "@/domain/data";
import { truthy } from "@/domain/types";
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

export const hierarchyToOptions = (
  hierarchy: HierarchyValue[],
  possibleValues?: DimensionValue["value"][]
) => {
  const possibleValuesSet = possibleValues
    ? new Set(possibleValues)
    : undefined;
  const transform = (
    h: HierarchyValue
  ): SelectTreeProps["options"][number] | undefined => {
    const children =
      h.children && h.children.length > 0
        ? h.children.map(transform).filter(truthy)
        : undefined;

    // Keep the value only if part of possibleValues or if it has children
    if (
      possibleValuesSet &&
      !possibleValuesSet.has(h.value) &&
      (!children || children.length === 0)
    ) {
      return undefined;
    }
    return {
      ...h,
      selectable: !!h.hasValue,
      children,
    };
  };
  return sortHierarchy(hierarchy).map(transform).filter(truthy);
};
