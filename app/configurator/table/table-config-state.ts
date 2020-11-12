import produce, { current } from "immer";
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
    let groupFields = fieldsArray.filter((f) => f.isGroup);
    let columnFields = fieldsArray.filter((f) => !f.isGroup);

    let sourceFields =
      source.droppableId === "columns" ? columnFields : groupFields;
    let destinationFields =
      destination.droppableId === "columns" ? columnFields : groupFields;

    // Move from source to destination
    destinationFields.splice(
      destination.index,
      0,
      sourceFields.splice(source.index, 1)[0]
    );

    // Update indexes and isGroup status for each field after moving
    groupFields.forEach((f, i) => {
      f.index = i;
      f.isGroup = true;
    });
    columnFields.forEach((f, i) => {
      f.index = groupFields.length + i;
      f.isGroup = false;
    });

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

    // Update field
    chartConfig.fields[field].isGroup = value;

    // Get fields _without_ field that is updated
    const fieldsArray = getOrderedTableColumns(chartConfig.fields);
    const groupFields = fieldsArray.filter(
      (f) => f.isGroup && f !== chartConfig.fields[field]
    );
    const columnFields = fieldsArray.filter(
      (f) => !f.isGroup && f !== chartConfig.fields[field]
    );

    const allFields = [
      ...groupFields,
      // Always place between groups and columns (it will end up at the bottom of the groups or top of columns)
      chartConfig.fields[field],
      ...columnFields,
    ];

    // Update index for each field
    allFields.forEach((f, i) => {
      f.index = i;
    });

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

export const removeColumn = produce(
  (chartConfig: TableConfig, { field }: { field: string }): TableConfig => {
    if (!chartConfig.fields[field]) {
      return chartConfig;
    }

    delete chartConfig.fields[field];

    console.log(current(chartConfig.fields));

    // Update index for each field
    const fieldsArray = getOrderedTableColumns(chartConfig.fields);
    fieldsArray.forEach((f, i) => {
      f.index = i;
    });

    return chartConfig;
  }
);
