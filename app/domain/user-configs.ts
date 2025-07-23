import { useCallback } from "react";

import { ParsedConfigWithViewCount } from "@/db/config";
import {
  fetchChartConfig,
  fetchChartConfigs,
  fetchChartViewCount,
} from "@/utils/chart-config/api";
import { useFetchData, UseFetchDataOptions } from "@/utils/use-fetch-data";

export const userConfigsKey = ["userConfigs"];
const userConfigKey = (t: string) => ["userConfigs", t];

export const useUserConfigs = (
  options?: UseFetchDataOptions<ParsedConfigWithViewCount[]>
) => {
  const queryFn = useCallback(async () => {
    const configs = await fetchChartConfigs();

    const configsWithViewCount = await Promise.all(
      configs.map(async (config) => {
        return {
          ...config,
          viewCount: await fetchChartViewCount(config.key),
        };
      })
    );

    return configsWithViewCount;
  }, []);

  const result = useFetchData({
    queryKey: userConfigsKey,
    queryFn,
    options,
  });

  return result;
};

export const useUserConfig = (
  chartId: string | undefined,
  options?: UseFetchDataOptions
) => {
  const queryFn = useCallback(async () => {
    const [config, viewCount] = await Promise.all([
      fetchChartConfig(chartId!),
      fetchChartViewCount(chartId!),
    ]);

    if (!config) {
      throw new Error("Config not found");
    }

    return {
      ...config,
      viewCount,
    };
  }, [chartId]);

  const result = useFetchData({
    queryKey: userConfigKey(chartId!),
    queryFn,
    options: {
      pause: !chartId,
      ...options,
    },
  });

  return result;
};
