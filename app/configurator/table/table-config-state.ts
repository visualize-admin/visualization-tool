import produce from "immer";
import { TableConfig } from "../config-types";

/**
 * When toggling `isGroup` of a field, we need to make sure the fields are correctly ordered
 */
export const updateIsGroup = produce(
  (
    chartConfig: TableConfig,
    {
      field,
      value,
    }: {
      field: string;
      value: boolean;
    }
  ): TableConfig => {
    if (chartConfig.fields[field]) {
      chartConfig.fields[field].isGroup = value;
    }

    return chartConfig;
  }
);

/**
 * When toggling `isHidden` of a field, we need to make sure the fields are correctly ordered
 */
export const updateIsHidden = produce(
  (
    chartConfig: TableConfig,
    {
      field,
      value,
    }: {
      field: string;
      value: boolean;
    }
  ): TableConfig => {
    if (chartConfig.fields[field]) {
      chartConfig.fields[field].isHidden = value;
    }

    return chartConfig;
  }
);
