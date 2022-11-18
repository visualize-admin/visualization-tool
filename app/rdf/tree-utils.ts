import orderBy from "lodash/orderBy";
import sortBy from "lodash/sortBy";

import { HierarchyValue } from "@/graphql/resolver-types";
import { dfs } from "@/utils/dfs";

export const mapTree = (
  tree: HierarchyValue[],
  cb: (h: HierarchyValue) => HierarchyValue
) => {
  return tree.map((t): HierarchyValue => {
    return {
      ...cb(t),
      children: t.children ? mapTree(t.children, cb) : undefined,
    };
  });
};

/** Sorts the tree by default chain of sorters (position -> identifier -> label). */
export const sortTree = (tree: HierarchyValue[]): HierarchyValue[] => {
  const sortedTree = orderBy(tree, [
    "position",
    "identifier",
    "label",
  ]) as HierarchyValue[];

  return sortedTree.map((d) => ({
    ...d,
    children: d.children ? sortTree(d.children) : undefined,
  }));
};

const filterTreeHelper = (
  tree: HierarchyValue[],
  predicate: (h: HierarchyValue) => boolean
) => {
  return tree
    .map((t): HierarchyValue => {
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
 * Given a tree and a list of nodes, will remove any parent/onde that do not contain
 * at least of the provided nodes in their descendant
 */
export const pruneTree = (
  tree: HierarchyValue[],
  predicate: (v: HierarchyValue) => boolean
): HierarchyValue[] => {
  const isUsed = (v: HierarchyValue): boolean => {
    if (predicate(v)) {
      return true;
    } else if (v.children) {
      return v.children.some((child) => isUsed(child));
    }
    return false;
  };

  return filterTreeHelper(tree, isUsed);
};

type Value = string;
type CheckboxState = "checked" | "unchecked" | "indeterminate";
type CheckboxStateMap = Map<string, CheckboxState>;

/**
 * Given a list of checked values and a hierarchy for these values,
 * returns a map from node id to its state "checked" / "unchecked" / "indeterminate".
 *
 * A node is considered "underterminate" when some of its descendants are "checked"
 * and it is not "checked".
 */
export const getCheckboxStates = (
  tree: HierarchyValue[],
  checkedValues: Set<Value>
): CheckboxStateMap => {
  const res = new Map<string, CheckboxState>();
  const collect = (node: HierarchyValue): boolean => {
    let checked = false;
    if (checkedValues.has(node.value)) {
      res.set(node.value, "checked");
      checked = true;
    }

    if (node.children && node.children.length > 0) {
      for (let c of node.children) {
        const childrenHasBeenChecked = collect(c);
        checked = checked || childrenHasBeenChecked;
      }
    }

    const val = res.get(node.value);
    if (val !== "checked") {
      res.set(node.value, checked ? "indeterminate" : "unchecked");
    }
    return checked;
  };
  for (let root of tree) {
    collect(root);
  }
  return res;
};

/**
 * Visits a hierarchy with depth first search
 */
export const visitHierarchy = (
  tree: HierarchyValue[],
  /** Will be run over all children. Return false to abort early */
  visitor: (node: HierarchyValue) => void | false
) => {
  let q = [...tree];
  while (q.length > 0) {
    const node = q.pop()!;
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

export const makeTreeFromValues = (
  values: Value[],
  dimensionIri: string,
  { depth = 0 }
) => {
  return values.map((x) => ({
    value: x,
    label: "",
    dimensionIri,
    depth,
    children: [],
  }));
};

export const getOptionsFromTree = (tree: HierarchyValue[]) => {
  return sortBy(
    dfs(tree, (node, { parents }) => ({
      ...node,
      parents,
    })),
    (node) => joinParents(node.parents)
  );
};

export const joinParents = (parents?: HierarchyValue[]) => {
  return parents?.map((x) => x.label).join(" > ") || "";
};
