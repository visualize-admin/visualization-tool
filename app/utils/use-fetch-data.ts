import { useCallback, useEffect, useRef, useState } from "react";
import { stringifyVariables } from "urql";

type Status = "idle" | "fetching" | "success" | "error";

export type UseFetchDataOptions<TDefault = undefined> = {
  pause?: boolean;
  initialStatus?: Status;
  defaultData: TDefault;
};

type QueryKey = string[];

type QueryCacheValue<T> = {
  data: T | null;
  error: Error | null;
  status: Status;
};

/**
 * Stores what has been queried through useFetchData. Is listened to by useCacheKey.
 */
class QueryCache {
  cache: Map<string, QueryCacheValue<unknown>>;
  listeners: [string, () => void][];
  version: number;

  constructor() {
    this.cache = new Map();
    this.listeners = [];
    this.version = 0;
  }

  set(queryKey: QueryKey, value: QueryCacheValue<unknown>) {
    this.cache.set(stringifyVariables(queryKey), value);
    this.fire(queryKey);
    this.version++;
  }

  get(queryKey: QueryKey) {
    return (
      this.cache.get(stringifyVariables(queryKey)) || {
        data: null,
        error: null,
        status: "idle",
      }
    );
  }

  fire(queryKey: QueryKey) {
    const key = stringifyVariables(queryKey);
    this.listeners.forEach(([k, cb]) => key === k && cb());
  }

  listen(queryKey: QueryKey, cb: () => void) {
    this.listeners.push([stringifyVariables(queryKey), cb]);
    return () =>
      void this.listeners.splice(
        this.listeners.findIndex((c) => c[1] === cb),
        1
      );
  }
}

const cache = new QueryCache();

const useCacheKey = (cache: QueryCache, queryKey: QueryKey) => {
  const [version, setVersion] = useState(cache.version);

  useEffect(() => {
    return cache.listen(queryKey, () => {
      setVersion(() => cache.version);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cache, stringifyVariables(queryKey)]);

  return version;
};

/**
 * Access remote data, very similar to useFetch from react-query. A global cache
 * is used to store the data. If data is not fetched, it will be fetched automatically.
 * Two useFetchData on the same queryKey will result in only 1 queryFn called. Both useFetchData
 * will share the same cache and data.
 */
export const useFetchData = <TData>({
  queryKey,
  queryFn,
  options = {},
}: {
  queryKey: any[];
  queryFn: () => Promise<TData>;
  options?: Partial<UseFetchDataOptions<TData>>;
}) => {
  const { pause, defaultData } = options;

  const cached = cache.get(queryKey) as QueryCacheValue<TData>;
  const { data, error, status } = cached ?? {};

  const fetchData = useCallback(async () => {
    const cached = cache.get(queryKey);

    if (cached?.status === "fetching") {
      return;
    }

    cache.set(queryKey, { ...cache.get(queryKey), status: "fetching" });

    try {
      const result = await queryFn();
      const cacheEntry = {
        data: result,
        error: null,
        status: "success" as const,
      };
      cache.set(queryKey, cacheEntry);

      return cacheEntry;
    } catch (error) {
      const cacheEntry = {
        data: null,
        error: error as Error,
        status: "error" as const,
      };
      cache.set(queryKey, cacheEntry);

      return cacheEntry;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stringifyVariables(queryKey)]);

  useCacheKey(cache, queryKey);

  useEffect(() => {
    if (pause) {
      cache.set(queryKey, { ...cache.get(queryKey), status: "idle" });

      return;
    }

    if (cached.status === "idle") {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pause, fetchData, stringifyVariables(queryKey), cached.data]);

  const invalidate = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { data: data ?? defaultData, error, status, invalidate };
};

/**
 * Use this to populate (hydrate) the client store with the server side data
 */
export const useHydrate = <T>(queryKey: QueryKey, data: T) => {
  const hasHydrated = useRef(false);

  if (!hasHydrated.current) {
    cache.set(queryKey, { data, error: null, status: "success" });
    hasHydrated.current = true;
  }
};

/**
 * Tracks a server mutation with loading/error states
 */
export const useMutate = <TArgs extends any[], TOutput>(
  queryFn: (...args: TArgs) => Promise<TOutput>
) => {
  const [data, setData] = useState<Awaited<TOutput> | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [status, setStatus] = useState<Status>("idle");

  const mutate = useCallback(
    async (...args: TArgs) => {
      setStatus("fetching");
      try {
        const result = await queryFn(...args);
        setData(result);
        setStatus("success");
        return result;
      } catch (error) {
        setError(error as Error);
        setStatus("error");
      }
    },
    [queryFn]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setStatus("idle");
  }, []);

  return { data, error, status, mutate, reset };
};
