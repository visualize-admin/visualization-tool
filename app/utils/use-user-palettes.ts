import { useMemo } from "react";

import { useUser } from "@/login/utils";

import { getCustomColorPalettes } from "./chart-config/api";
import { useFetchData } from "./use-fetch-data";

export const useUserPalettes = () => {
  const user = useUser();

  const queryKey = useMemo(() => ["colorPalettes", user?.id], [user?.id]);

  return useFetchData({
    queryKey,
    queryFn: getCustomColorPalettes,
    options: {
      pause: !user?.id,
    },
  });
};
