import orderBy from "lodash/orderBy";
import sortBy from "lodash/sortBy";

import { HierarchyValue } from "@/domain/data";
import { bfs } from "@/utils/bfs";

export const mapTree = <TIn extends { children?: TIn[] | null }, TOut>(
  tree: TIn[],
  cb: (h: TIn) => TOut
) => {
  return tree.map((t): TOut => {
    return {
      ...cb(t),
      children: t.children ? mapTree(t.children, cb) : undefined,
    };
  });
};

const filterTreeHelper = <T extends { children?: T[] | null }>(
  tree: T[],
  predicate: (h: T) => boolean
) => {
  return tree
    .map((t): T => {
      return {
        ...t,
        children: t.children
          ? filterTreeHelper(t.children, predicate)
          : undefined,
      };
    })
    .filter(predicate);
};

/**
 * Given a tree and a list of nodes, will remove any parent / node that does not contain
 * at least of the provided nodes in their descendants.
 */
export const pruneTree = <T extends { children?: T[] | null }>(
  tree: T[],
  predicate: (v: T) => boolean
): T[] => {
  const isUsed = (v: T): boolean => {
    if (predicate(v)) {
      return true;
    } else if (v.children) {
      return v.children.some((child) => isUsed(child));
    }
    return false;
  };

  return filterTreeHelper(tree, isUsed);
};

/** Sorts the tree by default chain of sorters (position -> identifier -> label). */
export const sortHierarchy = (tree: HierarchyValue[]): HierarchyValue[] => {
  const sortedTree = orderBy(
    tree,
    ["depth", "position", "identifier", "label"],
    ["desc", "asc", "asc", "asc"]
  ) as HierarchyValue[];

  return sortedTree.map((d) => ({
    ...d,
    children: d.children ? sortHierarchy(d.children) : undefined,
  }));
};

/**
 * Visits a hierarchy with depth first search
 */
export const visitHierarchy = <
  TNode extends { children?: TNode[] | undefined },
>(
  tree: TNode[],
  /** Will be run over all children. Return false to abort early */
  visitor: (node: TNode) => void | false
) => {
  const q = [...tree];
  while (q.length > 0) {
    const node = q.shift()!;
    const ret = visitor(node);
    if (ret === false) {
      break;
    }
    for (let c of node.children || []) {
      q.push(c);
    }
  }
};

/**
 * Visits a hierarchy with depth first search
 */
export const findInHierarchy = (
  tree: HierarchyValue[],
  /** Will be run over all children. Return false to abort early */
  finder: (node: HierarchyValue) => boolean
) => {
  let res = undefined as HierarchyValue | undefined;
  visitHierarchy(tree, (node) => {
    const found = finder(node);
    if (found) {
      res = node;
      return false;
    }
  });
  return res;
};

export const getOptionsFromTree = (tree: HierarchyValue[]) => {
  return sortBy(
    bfs(tree, (node, { parents }) => ({
      ...node,
      parents,
    })),
    (node) => joinParents(node.parents)
  );
};

export const joinParents = (parents?: HierarchyValue[]) => {
  return parents?.map((x) => x.label).join(" > ") || "";
};

export const flattenTree = (tree: HierarchyValue[]) => {
  const res: HierarchyValue[] = [];
  bfs(tree, (x) => res.push(x));
  return res;
};

export const regroupTrees = (
  trees: (HierarchyValue & { hierarchyName?: string })[][]
): HierarchyValue[] => {
  if (trees.length < 2) {
    return trees[0];
  } else {
    // We have multiple hierarchies
    const goodTrees = trees.filter((x) => !!x[0] && !!x[0].hierarchyName);
    const roots = new Set(goodTrees.map((x) => x[0].value));
    if (roots.size > 1) {
      throw Error("Cannot have multiple hierarchies not sharing the same root");
    }
    return [
      {
        ...goodTrees[0][0],
        children: goodTrees.map((t) => ({
          value: t[0].hierarchyName!,
          hasValue: false,
          children: t[0].children,
          dimensionId: t[0].dimensionId,
          label: t[0].hierarchyName!,
          depth: 0,
        })),
      },
    ];
  }
};
