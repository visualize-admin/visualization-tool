import { useCallback, useMemo, useState } from "react";
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
import {
  useComponentsWithHierarchiesQuery,
  useDataCubeMetadataQuery,
} from "@/graphql/query-hooks";
import { useLocale } from "@/locales/use-locale";

export const useTableChartController = (
  state: ConfiguratorStateConfiguringChart
) => {
  const locale = useLocale();
  const [, dispatch] = useConfiguratorState(isConfiguring);
  const chartConfig = getChartConfig(state);
  const variables = {
    iri: chartConfig.dataSet,
    sourceType: state.dataSource.type,
    sourceUrl: state.dataSource.url,
    locale,
  };
  const [{ data: metadata }] = useDataCubeMetadataQuery({ variables });
  const [{ data: components }] = useComponentsWithHierarchiesQuery({
    variables,
  });

  const metaData = useMemo(() => {
    return metadata?.dataCubeByIri && components?.dataCubeByIri
      ? {
          ...metadata.dataCubeByIri,
          ...components.dataCubeByIri,
        }
      : null;
  }, [metadata?.dataCubeByIri, components?.dataCubeByIri]);

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

      if (!destination || chartConfig.chartType !== "table" || !metaData) {
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
          dataSetMetadata: metaData,
        },
      });
    },
    [chartConfig, dispatch, metaData]
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
    metaData,
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
