import useSWR, { keyInterface } from "swr";
import { fetcherFn, ConfigInterface } from "swr/dist/types";

export type RDState<T> =
  | {
      state: "pending";
      data?: T;
    }
  | {
      state: "error";
      error: Error;
      data?: T;
    }
  | {
      state: "loaded";
      data: T;
    };

const initialState = { state: "pending" as const };

export const useRemoteData = <T>(
  key: keyInterface,
  runFetch: fetcherFn<T>,
  options?: ConfigInterface<T, Error, fetcherFn<T>>
): RDState<T> => {
  const { data, error, isValidating } = useSWR<T, Error>(key, runFetch, {
    revalidateOnFocus: false,
    ...options
  });

  if (error) {
    return { state: "error", error, data };
  }

  if (isValidating) {
    return { state: "pending", data };
  }

  if (data && !isValidating) {
    return { state: "loaded", data };
  }

  return initialState;
};
