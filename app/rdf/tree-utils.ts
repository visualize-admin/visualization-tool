import { HierarchyValue } from "@/graphql/resolver-types";

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
export const filterTree = (
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

const visitTree = (
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

/**
 * Logic behind when the user clicks a checkbox.
 * - When unchecked, its deepest ancestors gets checked.
 * - When indeterminate, it gets checked.
 * - When checked, the children are unchecked.
 */
export const toggleCheckbox = (
  checkboxStateMap: CheckboxStateMap,
  checkedValues: Set<Value>,
  childrenIndex: Map<string, HierarchyValue[]>,
  value: Value
): Set<Value> => {
  const state = checkboxStateMap.get(value);
  const newSet = new Set([...checkedValues]);
  const children = childrenIndex.get(value) || [];
  const act = (child: HierarchyValue, action: "add" | "delete") => {
    if (action === "add" && (!child.children || child.children.length === 0)) {
      newSet.add(child.value);
    } else {
      newSet.delete(child.value);
    }
  };

  if (children.length > 0) {
    if (state === "indeterminate") {
      newSet.add(value);
    } else if (state === "checked") {
      newSet.delete(value);
    } else if (state === "unchecked") {
      newSet.delete(value);
    }
  } else {
    if (state === "unchecked") {
      newSet.add(value);
    } else {
      newSet.delete(value);
    }
  }

  visitTree(children, (child) => {
    act(
      child,
      state === "indeterminate" || state === "unchecked" ? "add" : "delete"
    );
  });
  return newSet;
};

const buildChildrenIndex = (tree: HierarchyValue[]) => {
  const childrenIndex = new Map<string, HierarchyValue[]>();
  visitTree(tree, (x) => childrenIndex.set(x.value, x.children || []));
  return childrenIndex;
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

/**
 * Maintains the state of checkboxes for the right filters
 * as both a tree with checked/unchecked/undeterminate states,
 * and as a Set containing only the checked nodes.
 */
export class CheckboxStateController {
  tree: HierarchyValue[];

  // @ts-ignore
  checkboxStates: CheckboxStateMap;
  private checkedValues: Set<Value>;
  private childrenIndex: Map<string, HierarchyValue[]>;

  constructor(tree: HierarchyValue[], checkedValues: Value[]) {
    this.tree = tree;
    this.checkedValues = new Set([...checkedValues]);
    this.childrenIndex = buildChildrenIndex(tree);
    this.updateState();
  }

  updateState() {
    this.checkboxStates = getCheckboxStates(this.tree, this.checkedValues);
  }

  toggle(value: Value) {
    this.checkedValues = toggleCheckbox(
      this.checkboxStates,
      this.checkedValues,
      this.childrenIndex,
      value
    );
    this.updateState();
  }

  getState() {
    return this.checkboxStates;
  }

  getValues() {
    return [...this.checkedValues];
  }
}
