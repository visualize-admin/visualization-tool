import { NextRouter, useRouter } from "next/router";
import { useEffect } from "react";

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

export const useSyncRouterQueryParam = ({
  param,
  value,
  onParamChange,
}: {
  param: string;
  value: string;
  onParamChange: (routerParamValue: string) => void;
}) => {
  const router = useRouter();
  const queryParamValue = router.query[param];

  useEffect(() => {
    if (router.isReady) {
      if (queryParamValue !== undefined) {
        if (queryParamValue !== value) {
          updateRouterQuery(router, { [param]: queryParamValue.toString() });
          onParamChange(queryParamValue.toString());
        }
      } else {
        updateRouterQuery(router, { [param]: value });
      }
    }
  }, [param, value, router, queryParamValue, onParamChange]);
};
