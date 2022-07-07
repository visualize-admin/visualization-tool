import { HierarchyValue } from "@/graphql/resolver-types";

export const filterTree = (
  tree: HierarchyValue[],
  predicate: (h: HierarchyValue) => boolean
) => {
  return tree
    .map((t) => {
      t.children = t.children ? filterTree(t.children, predicate) : undefined;
      return t;
    })
    .filter(predicate);
};

/**
 * Given a tree and a list of nodes, will remove any parent/onde that do not contain
 * at least of the provided nodes in their descendant
 */
export const trimTree = (tree: HierarchyValue[], leafs: string[]) => {
  const leafSet = new Set(leafs);

  const isUsed = (v: HierarchyValue) => {
    if (leafSet.has(v.value)) {
      return true;
    } else if (v.children) {
      for (let child of v.children) {
        if (isUsed(child)) {
          return true;
        }
      }
    }
    return false;
  };

  return filterTree(tree, isUsed);
};
