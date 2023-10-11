import React from "react";

type Status = "idle" | "fetching" | "success" | "error";

type UseFetchDataOptions = {
  enable?: boolean;
  initialStatus?: Status;
};

export const useFetchData = <T>(
  queryFn: () => Promise<T>,
  options: UseFetchDataOptions = {}
) => {
  const { enable = true, initialStatus = "idle" } = options;
  const [data, setData] = React.useState<Awaited<T> | null>(null);
  const [error, setError] = React.useState<Error | null>(null);
  const [status, setStatus] = React.useState<Status>(initialStatus);

  React.useEffect(() => {
    if (!enable) {
      setStatus("idle");
      return;
    }

    const fetchData = async () => {
      setStatus("fetching");
      try {
        const result = await queryFn();
        setData(result);
        setStatus("success");
      } catch (error) {
        setError(error as Error);
        setStatus("error");
      }
    };

    fetchData();
  }, [queryFn, enable]);

  return { data, error, status };
};
