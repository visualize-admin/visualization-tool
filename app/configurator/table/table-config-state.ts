import produce from "immer";
import { DraggableLocation } from "react-beautiful-dnd";
import { getOrderedTableColumns } from "../components/ui-helpers";
import { TableConfig } from "../config-types";

export const moveFields = produce(
  (
    chartConfig: TableConfig,
    {
      source,
      destination,
    }: {
      source: DraggableLocation;
      destination: DraggableLocation;
    }
  ): TableConfig => {
    const fieldsArray = getOrderedTableColumns(chartConfig.fields);
    let groupFields = [...fieldsArray.filter((f) => f.isGroup)];
    let columnFields = [...fieldsArray.filter((f) => !f.isGroup)];

    let sourceFields =
      source.droppableId === "columns" ? columnFields : groupFields;
    let destinationFields =
      destination.droppableId === "columns" ? columnFields : groupFields;

    destinationFields.splice(
      destination.index,
      0,
      sourceFields.splice(source.index, 1)[0]
    );

    const allFields = [
      ...groupFields.map((f, i) => ({ ...f, isGroup: true, position: i })),
      ...columnFields.map((f, i) => ({
        ...f,
        isGroup: false,
        position: groupFields.length + i,
      })),
    ];

    chartConfig.fields = Object.fromEntries(
      allFields.map((f) => [f.componentIri, f])
    );

    return chartConfig;
  }
);

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
    if (!chartConfig.fields[field]) {
      return chartConfig;
    }
    // We assume all groups come first in the array!
    const fieldsArray = getOrderedTableColumns(chartConfig.fields);
    let groupFields = [...fieldsArray.filter((f) => f.isGroup)];
    let columnFields = [...fieldsArray.filter((f) => !f.isGroup)];

    if (value === true) {
      // If value is true, move to the _bottom_ of the groups section
      groupFields.push(chartConfig.fields[field]);
      columnFields.splice(columnFields.indexOf(chartConfig.fields[field]), 1);
    } else {
      // If value is false, move to the _top_ of the columns section
      groupFields.splice(columnFields.indexOf(chartConfig.fields[field]), 1);
      columnFields.unshift(chartConfig.fields[field]);
    }

    const allFields = [
      ...groupFields.map((f, i) => ({ ...f, isGroup: true, position: i })),
      ...columnFields.map((f, i) => ({
        ...f,
        isGroup: false,
        position: groupFields.length + i,
      })),
    ];

    chartConfig.fields = Object.fromEntries(
      allFields.map((f) => [f.componentIri, f])
    );

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
    if (!chartConfig.fields[field]) {
      return chartConfig;
    }

    chartConfig.fields[field].isHidden = value;

    // If field is _not_ a measure, add/remove it to/from the filters
    // if (chartConfig.fields[field].componentType !== "Measure") {
    //   if (value === true) {
    //     chartConfig.filters[field] = { type: "single", value: "TODO" };
    //   } else {
    //     delete chartConfig.filters[field];
    //   }
    // }

    return chartConfig;
  }
);
