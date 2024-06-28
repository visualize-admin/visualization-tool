import { EncodingFieldType } from "@/charts/chart-config-ui-options";
import {
  ChartConfig,
  ChartType,
  ConfiguratorState,
  DashboardFiltersConfig,
  DataSource,
  Filters,
  ImputationType,
  InteractiveFiltersConfig,
  Layout,
} from "@/config-types";
import { DataCubeComponents, Dimension, DimensionValue } from "@/domain/data";
import { Locale } from "@/locales/locales";

export type ConfiguratorStateAction =
  | {
      type: "INITIALIZED";
      value: ConfiguratorState;
    }
  | {
      type: "STEP_NEXT";
      dataCubesComponents: DataCubeComponents;
    }
  | {
      type: "STEP_PREVIOUS";
      to?: Exclude<
        ConfiguratorState["state"],
        "INITIAL" | "PUBLISHING" | "PUBLISHED"
      >;
    }
  | {
      type: "DATASOURCE_CHANGED";
      value: DataSource;
    }
  | {
      type: "DATASET_ADD";
      value: {
        iri: string;
        joinBy: {
          left: string[];
          right: string[];
        };
      };
    }
  | {
      type: "DATASET_REMOVE";
      value: {
        iri: string;
        locale: Locale;
      };
    }
  | {
      type: "CHART_TYPE_CHANGED";
      value: {
        locale: Locale;
        chartKey: string;
        chartType: ChartType;
      };
    }
  | {
      type: "CHART_ACTIVE_FIELD_CHANGED";
      value: string | undefined;
    }
  | {
      type: "CHART_FIELD_CHANGED";
      value: {
        locale: Locale;
        field: EncodingFieldType;
        componentIri: string;
        selectedValues?: $FixMe[];
      };
    }
  | {
      type: "CHART_OPTION_CHANGED";
      value: {
        locale: Locale;
        path: string;
        field: EncodingFieldType | null;
        value:
          | string
          | number
          | boolean
          | Record<string, string | number | boolean>
          | (string | number | boolean)[]
          | (string | number | boolean)[][]
          | undefined;
      };
    }
  | {
      type: "CHART_PALETTE_CHANGED";
      value: {
        field: string;
        colorConfigPath?: string;
        palette: string;
        colorMapping: Record<string, string>;
      };
    }
  | {
      type: "CHART_PALETTE_RESET";
      value: {
        field: string;
        colorConfigPath?: string;
        colorMapping: Record<string, string>;
      };
    }
  | {
      type: "CHART_COLOR_CHANGED";
      value: {
        field: string;
        colorConfigPath?: string;
        value: string;
        color: string;
      };
    }
  | {
      type: "CHART_FIELD_DELETED";
      value: {
        locale: Locale;
        field: string;
      };
    }
  | {
      type: "CHART_ANNOTATION_CHANGED";
      value: {
        path: string | string[];
        value: string;
      };
    }
  | {
      type: "INTERACTIVE_FILTER_CHANGED";
      value: InteractiveFiltersConfig;
    }
  | {
      type: "CHART_CONFIG_REPLACED";
      value: {
        chartConfig: ChartConfig;
        dataCubesComponents: DataCubeComponents;
      };
    }
  | {
      type: "CHART_CONFIG_FILTER_SET_SINGLE";
      value: {
        filters: {
          cubeIri: string;
          dimensionIri: string;
        }[];
        value: string;
      };
    }
  | {
      type: "CHART_CONFIG_FILTER_REMOVE_SINGLE";
      value: {
        filters: {
          cubeIri: string;
          dimensionIri: string;
        }[];
      };
    }
  | {
      type: "CHART_CONFIG_FILTERS_UPDATE";
      value: {
        cubeIri: string;
        filters: Filters;
      };
    }
  | {
      type: "CHART_CONFIG_FILTER_SET_MULTI";
      value: {
        cubeIri: string;
        dimensionIri: string;
        values: string[];
      };
    }
  | {
      type: "CHART_CONFIG_UPDATE_COLOR_MAPPING";
      value: {
        field: string;
        colorConfigPath: string | undefined;
        dimensionIri: string;
        values: DimensionValue[];
        random: boolean;
      };
    }
  | {
      type: "CHART_CONFIG_FILTER_SET_RANGE";
      value: {
        dimension: Dimension;
        from: string;
        to: string;
      };
    }
  | {
      type: "CHART_CONFIG_FILTER_RESET_RANGE";
      value: {
        cubeIri: string;
        dimensionIri: string;
      };
    }
  | {
      type: "IMPUTATION_TYPE_CHANGED";
      value: {
        type: ImputationType;
      };
    }
  | {
      type: "PUBLISH_FAILED";
    }
  | {
      type: "PUBLISHED";
      value: string;
    }
  | {
      type: "CHART_CONFIG_ADD";
      value: {
        chartConfig: ChartConfig;
        locale: Locale;
      };
    }
  | {
      type: "CHART_CONFIG_ADD_NEW_DATASET";
      value: {
        chartConfig: ChartConfig;
        locale: Locale;
      };
    }
  | {
      type: "CHART_CONFIG_REMOVE";
      value: {
        chartKey: string;
      };
    }
  | {
      type: "CHART_CONFIG_REORDER";
      value: {
        oldIndex: number;
        newIndex: number;
      };
    }
  | {
      type: "CHART_CONFIG_SWAP";
      value: {
        oldIndex: number;
        newIndex: number;
      };
    }
  | {
      type: "SWITCH_ACTIVE_CHART";
      value: string;
    }
  | {
      type: "LAYOUT_CHANGED";
      value: Layout;
    }
  | {
      type: "LAYOUT_ACTIVE_FIELD_CHANGED";
      value: string | undefined;
    }
  | {
      type: "LAYOUT_ANNOTATION_CHANGED";
      value: {
        path: string | string[];
        value: string;
      };
    }
  | {
      type: "CONFIGURE_CHART";
      value: {
        chartKey: string;
      };
    }
  | {
      type: "DASHBOARD_TIME_RANGE_FILTER_UPDATE";
      value: DashboardFiltersConfig["timeRange"];
    }
  | {
      type: "DASHBOARD_TIME_RANGE_FILTER_REMOVE";
    };
