export type Awaited<T> = T extends PromiseLike<infer U> ? U : T;

export type Has<T extends unknown, R extends string> = T extends {
  [k in R]: any;
}
  ? T
  : never;

export type PromiseValue<T> = T extends Promise<infer S> ? S : T;

type Truthy<T> = T extends false | "" | 0 | null | undefined ? never : T; // from lodash

/**
 * Enables type narrowing through Array::filter
 *
 * @example
 * const a = [1, undefined].filter(Boolean) // here the type of a is (number | undefined)[]
 * const b = [1, undefined].filter(truthy) // here the type of b is number[]
 */
export function truthy<T>(value: T): value is Truthy<T> {
  return !!value;
}
