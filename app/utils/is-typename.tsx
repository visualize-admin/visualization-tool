/**
 * Creates a typeguard from a type
 *
 * @example
 * ```
 * // dogs is now correctly inferred as Dog[]
 * const dogs = animals.filter(isTypename('Dog' as Dog["__typename"]))
 * ```
 */
const isTypename =
  <T extends string>(typename: T) =>
  <N extends { __typename: string }>(
    node: N
  ): node is Extract<N, { __typename: T }> => {
    return node.__typename === typename;
  };

export default isTypename;
