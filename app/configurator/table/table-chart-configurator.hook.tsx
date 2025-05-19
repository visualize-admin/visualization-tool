import { useCallback, useState } from "react";
import { DraggableLocation, OnDragStartResponder } from "react-beautiful-dnd";

import { ConfiguratorStateConfiguringChart, TableFields } from "@/config-types";
import { getChartConfig } from "@/config-utils";
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
    chartConfig,
    variables: {
      sourceType: state.dataSource.type,
      sourceUrl: state.dataSource.url,
      locale,
      cubeFilters: chartConfig.cubes.map((cube) => ({
        iri: cube.iri,
        joinBy: cube.joinBy,
        loadValues: true,
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

  return {
    dimensions: components?.dataCubesComponents.dimensions,
    measures: components?.dataCubesComponents.measures,
    currentDraggableId,
    handleDragStart,
    handleDragEnd,
    chartConfig: {
      ...chartConfig,
      fields: chartConfig.fields as TableFields,
    },
  };
};
