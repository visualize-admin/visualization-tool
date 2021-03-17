import * as d3 from "d3";

// Augment wrong types

declare module "d3" {
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
