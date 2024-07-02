type PromiserFunction<T, U> = (item: T) => Promise<U>;

export async function allDeduped<T, U>(params: {
  items: T[];
  promiser: PromiserFunction<T, U>;
  key: (item: T) => string;
}): Promise<U[]> {
  const { items, promiser, key } = params;
  const promises: Record<string, Promise<U>> = {};
  const results = await Promise.all(
    items.map((item) => {
      const k = key(item);
      if (!promises[k]) {
        const promise = promiser(item);
        promises[k] = promise;
        return promise;
      } else {
        return promises[k];
      }
    })
  );
  return results;
}
