import "d3-array";
// Augment wrong types

declare module "d3-array" {
  /**
   * Equivalent to group, but returns nested arrays instead of nested maps.
   *
   * @param iterable The array to group.
   * @param key The key function.
   */
  export function groups<TObject, TKey>(
    iterable: Iterable<TObject>,
    key: (value: TObject, index: number) => TKey
  ): Array<[TKey, TObject[]]>;
}
