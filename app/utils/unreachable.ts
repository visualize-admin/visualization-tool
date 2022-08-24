/**
 * Use to assert exhaustiveness in TS.
 *
 * @param x Whatever
 *
 * @example
 * switch (sth) {
 *   case "X": // do something
 *   default:
 *     throw unreachableError(sth);
 * }
 */
export const unreachableError = (x: never): Error => {
  return new Error(`This should be unreachable! but got ${x}`);
};
