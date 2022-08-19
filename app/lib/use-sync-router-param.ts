import { useRouter } from "next/router";
import { useEffect } from "react";

import { updateRouterQuery } from "@/lib/router-helpers";

export const useSyncRouterQueryParam = ({
  param,
  value,
}: {
  param: string;
  value: string;
}) => {
  const router = useRouter();

  useEffect(() => {
    const routerValue = router.query[param];

    if (!routerValue) {
      updateRouterQuery(router, {
        dataSource: value,
      });
    }
  }, [router, param, value]);
};
