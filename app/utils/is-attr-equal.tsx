/**
 * Creates a typeguard based on attribute equality
 *
 * @example
 * const users = users.filter(isAttrEqual('role', 'Admin'))
 */
const isAttrEqual = <T, K extends keyof T, V extends string & T[K]>(
  k: K,
  v: V
): ((o: T) => o is Extract<T, Record<K, V>>) => {
  return (o: T): o is Extract<T, Record<K, V>> => {
    return o[k] === v;
  };
};

export default isAttrEqual;
