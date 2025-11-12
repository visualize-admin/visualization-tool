import SuperJSON from "superjson";

export const apiFetch = async <T>(
  relativeUrl: string,
  options?: {
    method?: string;
    data?: Record<string, unknown>;
    headers?: Record<string, unknown>;
  }
): Promise<T> => {
  const res = await fetch(
    relativeUrl,
    options?.data
      ? {
          method: options.method || "POST",
          headers: {
            "Content-Type": "application/json",
            ...options.headers,
          },
          body: JSON.stringify(options.data),
        }
      : undefined
  );
  const json = await res.json();
  if (json.success) {
    return "data" in json &&
      typeof json.data === "object" &&
      json.data !== null &&
      "meta" in json.data
      ? (SuperJSON.deserialize(json.data) as T)
      : (json.data as T);
  } else {
    throw Error(json.message);
  }
};
