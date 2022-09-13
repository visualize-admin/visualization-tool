import { HierarchyValue } from "@/graphql/resolver-types";

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

export const visitHierarchy = (
  tree: HierarchyValue[],
  cb: (node: HierarchyValue) => void
) => {
  let q = [...tree];
  while (q.length > 0) {
    const node = q.pop()!;
    cb(node);
    for (let c of node.children || []) {
      q.push(c);
    }
  }
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
