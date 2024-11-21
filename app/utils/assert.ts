/**
 * Generic assert conditions performing a Typescript assertion, making sure the
 * code running afterwards follows the condition, and providing this information
 * to Typescript.
 */
type Assert = (condition: unknown, message: string) => asserts condition;
export const assert: Assert = (
  condition: unknown,
  msg: string
): asserts condition => {
  if (!condition) {
    throw Error(`AssertionError: ${msg}`);
  }
};
