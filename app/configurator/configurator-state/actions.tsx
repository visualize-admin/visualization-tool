import { EncodingFieldType } from "@/charts/chart-config-ui-options";
import {
  Annotation,
  BaseLayer,
  ChartConfig,
  ChartType,
  ColorField,
  ColorMapping,
  ConfiguratorState,
  CustomPaletteType,
  DashboardFiltersConfig,
  DataSource,
  Filters,
  ImputationType,
  InteractiveFiltersConfig,
  Layout,
  Limit,
} from "@/config-types";
import { DataCubeComponents, Dimension, DimensionValue } from "@/domain/data";
import { VersionedJoinBy } from "@/graphql/join";
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
        joinBy: VersionedJoinBy;
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
        isAddingNewCube?: boolean;
      };
    }
  | {
      type: "CHART_ACTIVE_FIELD_CHANGE";
      value: string | undefined;
    }
  | {
      type: "CHART_FIELD_CHANGED";
      value: {
        locale: Locale;
        field: EncodingFieldType;
        componentId: string;
        selectedValues?: $FixMe[];
      };
    }
  | {
      type: "CHART_FIELD_UPDATED";
      value: {
        locale: Locale;
        path: string;
        field: EncodingFieldType | null;
        value:
          | string
          | number
          | boolean
          | Record<any, any>
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
        paletteId: string;
        colorMapping: Record<string, string>;
      };
    }
  | {
      type: "COLOR_FIELD_SET";
      value: ColorField;
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
        field: EncodingFieldType;
      };
    }
  | {
      type: "CHART_META_CHANGE";
      value: {
        path: string | string[];
        value: string;
      };
    }
  | {
      type: "CUSTOM_LAYER_ADD";
      value: {
        layer: BaseLayer["customLayers"][number];
      };
    }
  | {
      type: "CUSTOM_LAYER_UPDATE";
      value: {
        layer: BaseLayer["customLayers"][number];
      };
    }
  | {
      type: "CUSTOM_LAYER_REMOVE";
      value: {
        type: BaseLayer["customLayers"][number]["type"];
        id: string;
      };
    }
  | {
      type: "CUSTOM_LAYER_SWAP";
      value: {
        oldIndex: number;
        newIndex: number;
      };
    }
  | {
      type: "INTERACTIVE_FILTER_CHANGED";
      value: InteractiveFiltersConfig;
    }
  | {
      type: "CHART_SHOW_LEGEND_TITLE_CHANGED";
      value: boolean;
    }
  | {
      type: "CHART_CONFIG_REPLACED";
      value: {
        chartConfig: ChartConfig;
        dataCubesComponents: DataCubeComponents;
      };
    }
  | {
      type: "FILTER_SET_SINGLE";
      value: {
        filters: {
          cubeIri: string;
          dimensionId: string;
        }[];
        value: string;
      };
    }
  | {
      type: "FILTER_REMOVE_SINGLE";
      value: {
        filters: {
          cubeIri: string;
          dimensionId: string;
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
        dimensionId: string;
        values: string[];
      };
    }
  | {
      type: "CHART_CONFIG_UPDATE_COLOR_MAPPING";
      value: {
        field: string;
        colorConfigPath: string | undefined;
        colorMapping?: ColorMapping;
        dimensionId: string;
        values: DimensionValue[];
        random: boolean;
        customPalette?: CustomPaletteType;
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
        dimensionId: string;
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
      type: "CHART_ANNOTATION_ADD";
      value: Annotation;
    }
  | {
      type: "CHART_ANNOTATION_HIGHLIGHT_TYPE_CHANGE";
      value: {
        key: string;
        highlightType: Annotation["highlightType"];
      };
    }
  | {
      type: "CHART_ANNOTATION_COLOR_CHANGE";
      value: {
        key: string;
        color: string;
      };
    }
  | {
      type: "CHART_ANNOTATION_TEXT_CHANGE";
      value: {
        key: string;
        locale: Locale;
        value: string;
      };
    }
  | {
      type: "CHART_ANNOTATION_REMOVE";
      value: {
        key: string;
      };
    }
  | {
      type: "LIMIT_SET";
      value: {
        measureId: string;
      } & Limit;
    }
  | {
      type: "LIMIT_REMOVE";
      value: {
        measureId: string;
      } & Pick<Limit, "related">;
    }
  | {
      type: "LAYOUT_BLOCK_SWAP";
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
      type: "LAYOUT_ACTIVE_FIELD_CHANGE";
      value: string | undefined;
    }
  | {
      type: "LAYOUT_META_CHANGE";
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
    }
  | {
      type: "DASHBOARD_DATA_FILTER_ADD";
      value: {
        dimensionId: string;
      };
    }
  | {
      type: "DASHBOARD_DATA_FILTERS_SET";
      value: DashboardFiltersConfig["dataFilters"];
    }
  | {
      type: "DASHBOARD_DATA_FILTER_REMOVE";
      value: {
        dimensionId: string;
      };
    };
