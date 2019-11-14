import useSWR, { keyInterface } from "swr";

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
  runFetch: () => Promise<T>
): RDState<T> => {
  const { data, error, isValidating } = useSWR<T, Error>(key, runFetch);

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
