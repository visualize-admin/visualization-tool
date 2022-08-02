import { HierarchyValue } from "@/graphql/resolver-types";

export const dfs = function* <T extends unknown>(
  tree: HierarchyValue[],
  iterator: (
    node: HierarchyValue,
    { depth, parents }: { depth: number; parents: HierarchyValue[] }
  ) => T
) {
  const q = [
    ...tree.map((n) => ({
      node: n,
      depth: 0,
      parents: [] as HierarchyValue[],
    })),
  ].reverse();
  while (q.length > 0) {
    const popped = q.pop()!;
    const { node, depth, parents } = popped;
    yield iterator(node, { depth, parents });
    const childrenParents = [...parents, node];
    if (node?.children && node.children.length > 0) {
      for (let child of node.children) {
        q.push({ node: child, depth: depth + 1, parents: childrenParents });
      }
    }
  }
};
