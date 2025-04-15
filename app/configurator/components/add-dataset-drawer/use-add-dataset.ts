import { useEventCallback } from "@mui/material";
import { useState } from "react";
import { useClient } from "urql";

import { getEnabledChartTypes } from "@/charts";
import { getChartConfig } from "@/config-utils";
import {
  addDatasetInConfig,
  isConfiguring,
  useConfiguratorState,
} from "@/configurator/configurator-state";
import { PartialSearchCube } from "@/domain/data";
import { executeDataCubesComponentsQuery } from "@/graphql/hooks";
import { VersionedJoinBy } from "@/graphql/join";
import { useLocale } from "@/locales/use-locale";

/**
 * Adds a dataset to the current chart configuration.
 * Is currently responsible for finding the correct joinBy dimension.
 */
const useAddDataset = () => {
  const [hookState, setHookState] = useState({
    fetching: false,
    otherIri: null as null | string,
  });
  const [state, dispatch] = useConfiguratorState(isConfiguring);
  const { type: sourceType, url: sourceUrl } = state.dataSource;
  const locale = useLocale();
  const client = useClient();
  const addDataset = useEventCallback(
    async ({
      otherCube,
      joinBy,
    }: {
      otherCube: PartialSearchCube;
      joinBy: VersionedJoinBy;
    }) => {
      const iri = otherCube.iri;
      setHookState((hs) => ({ ...hs, fetching: true, otherIri: iri }));
      try {
        const addDatasetOptions = {
          iri,
          joinBy: joinBy,
        };
        const nextState = structuredClone(state);
        addDatasetInConfig(nextState, addDatasetOptions);
        const chartConfig = getChartConfig(nextState, state.activeChartKey);

        const res = await executeDataCubesComponentsQuery(client, {
          locale,
          sourceType,
          sourceUrl,
          cubeFilters: chartConfig.cubes.map((cube) => ({
            iri: cube.iri,
            joinBy: cube.joinBy,
            componentIds: undefined,
            loadValues: true,
          })),
        });

        if (res.error || !res.data) {
          throw Error("Could not fetch dimensions and measures");
        }

        dispatch({
          type: "DATASET_ADD",
          value: addDatasetOptions,
        });
        const { dimensions, measures } = res.data.dataCubesComponents;
        const { enabledChartTypes } = getEnabledChartTypes({
          dimensions,
          measures,
          cubeCount: chartConfig.cubes.length,
        });
        dispatch({
          type: "CHART_TYPE_CHANGED",
          value: {
            locale,
            chartKey: state.activeChartKey,
            chartType: enabledChartTypes[0],
            isAddingNewCube: true,
          },
        });
      } finally {
        setHookState((hs) => ({ ...hs, fetching: false, otherIri: null }));
      }
    }
  );

  return [hookState, { addDataset }] as const;
};

export default useAddDataset;
