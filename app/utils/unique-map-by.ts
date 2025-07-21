export const uniqueMapBy = <T, K>(arr: T[], keyFn: (t: T) => K) => {
  const res = new Map<K, T>();

  for (const item of arr) {
    const key = keyFn(item);

    if (!res.has(key)) {
      res.set(key, item);
    }
  }

  return res;
};
