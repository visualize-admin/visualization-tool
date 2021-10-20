type Truthy<T> = T extends false | "" | 0 | null | undefined ? never : T; // from lodash

/**
 * Enables type narrowing through Array::filter
 *
 * @example
 * const a = [1, undefined].filter(Boolean) // here the type of a is (number | undefined)[]
 * const b = [1, undefined].filter(truthy) // here the type of b is number[]
 */
function truthy<T>(value: T): value is Truthy<T> {
  return !!value;
}

export default truthy;
