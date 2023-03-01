export const uniqueMapBy = <T, K>(arr: T[], keyFn: (t: T) => K) => {
  const res = new Map<K, T>();
  for (const item of arr) {
    const key = keyFn(item);
    if (res.has(key)) {
      console.log(`uniqueMapBy: duplicate detected ${key}, ignoring it`);
    } else {
      res.set(key, item);
    }
  }
  return res;
};
