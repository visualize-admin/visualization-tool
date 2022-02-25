const cachedWithTTL = <T extends (...args: any[]) => any>(
  fn: T,
  keyer: (...args: Parameters<T>) => string,
  ttl: number
) => {
  const cache = {} as Record<string, { date: number; result: ReturnType<T> }>;
  return async function (...args: Parameters<T>) {
    const key = keyer(...args);
    for (let k of Object.keys(cache)) {
      // Delete old results
      if (cache[k].date < Date.now() - ttl) {
        delete cache[k];
      }
    }
    let res;
    if (cache[key]) {
      res = cache[key].result;
    } else {
      const cached = await fn(...args);
      cache[key] = { date: Date.now(), result: cached };
      res = cache[key].result;
    }
    return res;
  };
};

export default cachedWithTTL;
