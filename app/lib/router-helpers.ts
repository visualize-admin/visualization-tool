import { NextRouter } from "next/router";

export const getURLParam = (key: string) => {
  const url =
    typeof window !== "undefined" ? new URL(window.location.href) : null;

  if (!url) {
    return undefined;
  }

  return url.searchParams.get(key);
};

export const updateRouterQuery = (
  router: NextRouter,
  values: { [k: string]: string }
) => {
  router.replace(
    {
      pathname: router.pathname,
      query: { ...router.query, ...values },
    },
    undefined,
    { shallow: true }
  );
};
