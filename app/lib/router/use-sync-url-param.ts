import { useRouter } from "next/router";
import { useEffect } from "react";

import useEvent from "../use-event";

import { getURLParam, updateRouterQuery } from "./helpers";

export const useSyncUrlParam = ({
  param,
  value,
}: {
  param: string;
  value: string;
}) => {
  const router = useRouter();
  const update = useEvent(() => {
    const routerValue = getURLParam(param);
    if (routerValue !== value) {
      updateRouterQuery(router, { [param]: value });
    }
  });

  useEffect(() => {
    update();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, param, router.pathname]);
};
