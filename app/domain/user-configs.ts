import { useCallback } from "react";

import { fetchChartConfig, fetchChartConfigs } from "@/utils/chart-config/api";
import { useFetchData, UseFetchDataOptions } from "@/utils/use-fetch-data";

export const userConfigsKey = ["userConfigs"];
export const useConfigKey = (t: string) => ["userConfigs", t];

export const useUserConfigs = (options?: UseFetchDataOptions) =>
  useFetchData(
    userConfigsKey,
    async () => {
      const d = await fetchChartConfigs();
      return d;
    },
    options
  );

export const useUserConfig = (
  chartId: string | undefined,
  options?: UseFetchDataOptions
) => {
  let queryFn = useCallback(() => fetchChartConfig(chartId ?? ""), [chartId]);
  return useFetchData(userConfigsKey, queryFn, {
    enable: !!chartId,
    ...options,
  });
};
