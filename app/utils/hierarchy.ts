import { SelectTreeProps } from "@/components/select-tree";
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

export const hierarchyToOptions = (
  hierarchy: HierarchyValue[],
  possibleValues: DimensionValue["value"][]
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

export const isMultiHierarchyNode = (hv: HierarchyValue) => {
  // A bit hackish but should be fine for now
  return hv.depth === -1;
};
