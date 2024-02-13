import { useCallback, useEffect, useRef, useState } from "react";
import { stringifyVariables } from "urql";

type Status = "idle" | "fetching" | "success" | "error";

export type UseFetchDataOptions<TDefault = undefined> = {
  enable?: boolean;
  initialStatus?: Status;
  defaultData: TDefault;
};

type QueryKey = string[];

type QueryCacheValue<T> = {
  data: T | null;
  error: Error | null;
  status: Status;
};

class QueryCache {
  cache: Map<string, QueryCacheValue<unknown>>;
  listeners: [string, () => void][];

  constructor() {
    this.cache = new Map();
    this.listeners = [];
  }

  set(queryKey: QueryKey, value: QueryCacheValue<unknown>) {
    console.log("setting", queryKey, value);
    this.cache.set(stringifyVariables(queryKey), value);
    this.fire(queryKey);
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

export const useFetchData = <TData>(
  queryKey: any[],
  queryFn: () => Promise<TData>,
  options: Partial<UseFetchDataOptions<TData>> = {}
) => {
  const { enable = true, defaultData } = options;

  const [, setState] = useState(0);
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
      console.log("fetched", { result });
      cache.set(queryKey, { data: result, error: null, status: "success" });
    } catch (error) {
      cache.set(queryKey, {
        data: null,
        error: error as Error,
        status: "error",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryKey]);

  useEffect(() => {
    return cache.listen(queryKey, () => {
      setState((n) => n + 1);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!enable) {
      cache.set(queryKey, { ...cache.get(queryKey), status: "idle" });
      return;
    }

    if (!cached) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enable, fetchData]);

  const invalidate = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { data: data ?? defaultData, error, status, invalidate };
};

export const useHydrate = <T>(queryKey: QueryKey, data: T) => {
  const hasHydrated = useRef(false);
  if (!hasHydrated.current) {
    cache.set(queryKey, { data, error: null, status: "idle" });
    hasHydrated.current = true;
  }
};

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
