import {
  ChartConfig,
  ConfiguratorState,
  ConfiguratorStateConfiguringChart,
  ConfiguratorStateSelectingDataSet,
  DataSource,
} from "@/config-types";
import { DEFAULT_DATA_SOURCE } from "@/domain/data-source";
import { CONFIGURATOR_STATE_VERSION } from "@/utils/chart-config/constants";

export const getInitialConfiguringConfigBasedOnCube = (props: {
  dataSource: DataSource;
  chartConfig: ChartConfig;
}): ConfiguratorStateConfiguringChart => {
  const { chartConfig, dataSource } = props;
  return {
    version: CONFIGURATOR_STATE_VERSION,
    state: "CONFIGURING_CHART",
    dataSource,
    layout: {
      type: "tab",
      meta: {
        title: {
          de: "",
          en: "",
          fr: "",
          it: "",
        },
        description: {
          de: "",
          en: "",
          fr: "",
          it: "",
        },
        label: {
          de: "",
          en: "",
          fr: "",
          it: "",
        },
      },
      blocks: [{ type: "chart", key: chartConfig.key, initialized: false }],
      activeField: undefined,
    },
    chartConfigs: [chartConfig],
    activeChartKey: chartConfig.key,
    dashboardFilters: {
      timeRange: {
        active: false,
        timeUnit: "",
        presets: {
          from: "",
          to: "",
        },
      },
      dataFilters: {
        componentIds: [],
        filters: {},
      },
    },
  };
};

export const INITIAL_STATE: ConfiguratorState = {
  version: CONFIGURATOR_STATE_VERSION,
  state: "INITIAL",
  dataSource: DEFAULT_DATA_SOURCE,
};

export const SELECTING_DATASET_STATE: ConfiguratorStateSelectingDataSet = {
  ...INITIAL_STATE,
  version: CONFIGURATOR_STATE_VERSION,
  state: "SELECTING_DATASET",
  dataSource: DEFAULT_DATA_SOURCE,
  chartConfigs: undefined,
  layout: undefined,
  activeChartKey: undefined,
};
