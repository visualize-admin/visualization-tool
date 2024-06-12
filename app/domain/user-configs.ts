import { useCallback } from "react";

import { ParsedConfig } from "@/db/config";
import { fetchChartConfig, fetchChartConfigs } from "@/utils/chart-config/api";
import { useFetchData, UseFetchDataOptions } from "@/utils/use-fetch-data";

export const userConfigsKey = ["userConfigs"];
const userConfigKey = (t: string) => ["userConfigs", t];

export const useUserConfigs = (options?: UseFetchDataOptions<ParsedConfig[]>) =>
  useFetchData({
    queryKey: userConfigsKey,
    queryFn: fetchChartConfigs,
    options,
  });

export const useUserConfig = (
  chartId: string | undefined,
  options?: UseFetchDataOptions
) => {
  let queryFn = useCallback(() => fetchChartConfig(chartId ?? ""), [chartId]);
  return useFetchData({
    queryKey: userConfigKey(chartId!),
    queryFn,
    options: {
      enable: !!chartId,
      ...options,
    },
  });
};
