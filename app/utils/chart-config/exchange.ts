import { ConfiguratorStatePublishing } from "../../configurator/config-types";

export const fetchChartConfig = async (chartId: string) => {
  return await fetch(`/api/config/${chartId}`).then((result) => result.json());
};

type ReturnVal = {
  key: string;
};
export const saveChartConfig = async (
  state: ConfiguratorStatePublishing
): Promise<ReturnVal> => {
  return fetch("/api/config", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      dataSet: state.dataSet,
      dataSource: state.dataSource,
      meta: state.meta,
      chartConfig: state.chartConfig,
    }),
  }).then((res) => res.json());
};
