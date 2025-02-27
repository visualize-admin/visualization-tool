import { useUser } from "@/login/utils";

import { getCustomColorPalettes } from "./chart-config/api";
import { useFetchData } from "./use-fetch-data";

export const useUserPalettes = () => {
  const user = useUser();

  return useFetchData({
    queryKey: ["colorPalettes", user?.id],
    queryFn: getCustomColorPalettes,
    options: {
      pause: !user?.id,
    },
  });
};
