const IGNORE = {};

/**
 * TODO check if can be deduplicated with visitHierarchy
 * ⚠️ visitHierarchy is a depth-first-search while we have
 * a bread-first-search here.
 */
export const bfs = function <
  TNode extends { children?: TNode[] | null },
  T extends unknown,
>(
  tree: TNode[],
  visitor: (
    node: TNode,
    { depth, parents }: { depth: number; parents: TNode[] }
  ) => T
) {
  const q = [
    ...tree.map((n) => ({
      node: n,
      depth: 0,
      parents: [] as TNode[],
    })),
  ].reverse();
  const res = [];
  while (q.length > 0) {
    const popped = q.shift()!;
    const { node, depth, parents } = popped;
    const visitResult = visitor(node, { depth, parents });
    if (visitResult === bfs.IGNORE) {
      continue;
    }
    res.push(visitResult);
    const childrenParents = [...parents, node];
    if (node?.children && node.children.length > 0) {
      for (let child of node.children) {
        q.push({ node: child, depth: depth + 1, parents: childrenParents });
      }
    }
  }
  return res;
};

/**
 * Sentinel value meant to be returned from visitor callbacks
 * if the concerned nodes and its children should be ignored
 * by the DFS.
 */
bfs.IGNORE = IGNORE;
