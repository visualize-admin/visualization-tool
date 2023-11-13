import { SelectTreeProps } from "@/components/select-tree";
import { DimensionValue, HierarchyValue } from "@/domain/data";
import { truthy } from "@/domain/types";
import { sortHierarchy } from "@/rdf/tree-utils";

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
