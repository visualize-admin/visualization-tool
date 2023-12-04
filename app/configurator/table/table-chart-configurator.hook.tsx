import { useCallback, useState } from "react";
import { DraggableLocation, OnDragStartResponder } from "react-beautiful-dnd";

import { TableFields } from "@/config-types";
import {
  ConfiguratorStateConfiguringChart,
  getChartConfig,
} from "@/configurator";
import {
  isConfiguring,
  useConfiguratorState,
} from "@/configurator/configurator-state";
import { moveFields } from "@/configurator/table/table-config-state";
import { useDataCubesComponentsQuery } from "@/graphql/hooks";
import { useLocale } from "@/locales/use-locale";

export const useTableChartController = (
  state: ConfiguratorStateConfiguringChart
) => {
  const locale = useLocale();
  const [, dispatch] = useConfiguratorState(isConfiguring);
  const chartConfig = getChartConfig(state);
  const [{ data: components }] = useDataCubesComponentsQuery({
    variables: {
      sourceType: state.dataSource.type,
      sourceUrl: state.dataSource.url,
      locale,
      cubeFilters: chartConfig.cubes.map((cube) => ({
        iri: cube.iri,
        joinBy: cube.joinBy,
      })),
    },
  });

  const [currentDraggableId, setCurrentDraggableId] = useState<string | null>(
    null
  );

  const handleDragEnd = useCallback(
    ({
      source,
      destination,
    }: {
      source: DraggableLocation;
      destination?: DraggableLocation | null;
    }) => {
      setCurrentDraggableId(null);

      if (
        !destination ||
        chartConfig.chartType !== "table" ||
        !components?.dataCubesComponents
      ) {
        return;
      }

      const newChartConfig = moveFields(chartConfig, {
        source,
        destination,
      });

      dispatch({
        type: "CHART_CONFIG_REPLACED",
        value: {
          chartConfig: newChartConfig,
          dataCubesComponents: components.dataCubesComponents,
        },
      });
    },
    [chartConfig, components?.dataCubesComponents, dispatch]
  );

  const handleDragStart = useCallback<OnDragStartResponder>(
    ({ draggableId }) => {
      setCurrentDraggableId(draggableId);
    },
    []
  );

  const handleMove = useCallback(
    (delta: number, droppableId: string) => (curIndex: number) => {
      const newIndex = curIndex + delta;
      if (newIndex < 0) {
        return;
      }

      handleDragEnd({
        source: { droppableId, index: curIndex },
        destination: { droppableId, index: newIndex },
      });
    },
    [handleDragEnd]
  );

  return {
    dimensions: components?.dataCubesComponents.dimensions,
    measures: components?.dataCubesComponents.measures,
    currentDraggableId,
    handleDragStart,
    handleDragEnd,
    handleMove,
    chartConfig: {
      ...chartConfig,
      fields: chartConfig.fields as TableFields,
    },
  };
};
