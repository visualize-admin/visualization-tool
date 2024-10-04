import { Client } from "urql";

import { getInitialConfig, getPossibleChartTypes } from "@/charts";
import { getPossibleFiltersQueryVariables } from "@/charts/shared/ensure-possible-filters";
import {
  ConfiguratorState,
  ConfiguratorStateConfiguringChart,
  DataSource,
  decodeConfiguratorState,
  SingleFilters,
} from "@/config-types";
import { SELECTING_DATASET_STATE } from "@/configurator/configurator-state/initial";
import {
  DataCubePreviewDocument,
  DataCubePreviewQuery,
  DataCubePreviewQueryVariables,
  PossibleFiltersDocument,
  PossibleFiltersQuery,
  PossibleFiltersQueryVariables,
} from "@/graphql/query-hooks";
import { fetchChartConfig } from "@/utils/chart-config/api";
import {
  upgradeConfiguratorState,
  upgradeCubePublishIri,
} from "@/utils/chart-config/upgrade-cube";
import { migrateConfiguratorState } from "@/utils/chart-config/versioning";

import { getLocalStorageKey } from "./localstorage";
import { deriveFiltersFromFields, transitionStepNext } from "./reducer";

import { getStateWithCurrentDataSource } from "./index";

export const initChartStateFromCube = async (
  client: Client,
  cubePublishIri: string,
  dataSource: DataSource,
  locale: string
): Promise<ConfiguratorState | undefined> => {
  // Technically we already have most recent iri assured by useRedirectToLatestCube, but
  // just to be extra sure, we fetch it again here.
  const cubeIri = await upgradeCubePublishIri(cubePublishIri, {
    client,
    dataSource,
  });

  const { data: dataCubePreview } = await client
    .query<DataCubePreviewQuery, DataCubePreviewQueryVariables>(
      DataCubePreviewDocument,
      {
        sourceType: dataSource.type,
        sourceUrl: dataSource.url,
        locale,
        cubeFilter: { iri: cubeIri },
      }
    )
    .toPromise();

  if (!dataCubePreview?.dataCubePreview) {
    throw new Error(`Could not fetch preview for ${cubeIri}!`);
  }

  const { dimensions, measures } = dataCubePreview.dataCubePreview;
  const { data: possibleFilters } = await client
    .query<PossibleFiltersQuery, PossibleFiltersQueryVariables>(
      PossibleFiltersDocument,
      getPossibleFiltersQueryVariables({
        cubeIri,
        dataSource,
        unmappedFilters: dataCubePreview.dataCubePreview.dimensions.reduce(
          (acc, { iri, values }) => ({
            ...acc,
            [iri]: {
              type: "single",
              value: values[0].value,
            },
          }),
          {} as SingleFilters
        ),
      })
    )
    .toPromise();

  if (!possibleFilters?.possibleFilters) {
    throw new Error(`Could not fetch possible filters for ${cubeIri}!`);
  }

  const possibleChartTypes = getPossibleChartTypes({
    dimensions,
    measures,
    cubeCount: 1,
  });
  const chartConfig = deriveFiltersFromFields(
    getInitialConfig({
      chartType: possibleChartTypes[0],
      iris: [{ iri: cubeIri, publishIri: cubePublishIri }],
      dimensions,
      measures,
    }),
    { dimensions, possibleFilters: possibleFilters.possibleFilters }
  );

  return transitionStepNext(
    getStateWithCurrentDataSource(SELECTING_DATASET_STATE),
    { chartConfig }
  );
};

/**
 * Tries to parse state from localStorage.
 * If state is invalid, it is removed from localStorage.
 */
export const initChartStateFromLocalStorage = async (
  client: Client,
  chartId: string
): Promise<ConfiguratorState | undefined> => {
  const storedState = window.localStorage.getItem(getLocalStorageKey(chartId));

  if (!storedState) {
    return;
  }

  let state: ConfiguratorState | undefined;
  try {
    const rawState = JSON.parse(storedState);
    const migratedState = migrateConfiguratorState(rawState);
    state = decodeConfiguratorState(migratedState);
  } catch (e) {
    console.error("Error while parsing stored state", e);
  }

  if (state) {
    return upgradeConfiguratorState(state, {
      client,
      dataSource: state.dataSource,
    });
  }

  console.warn(
    "Attempted to restore invalid state. Removing from localStorage.",
    state
  );
  window.localStorage.removeItem(getLocalStorageKey(chartId));
};

export const initChartStateFromChartCopy = async (
  client: Client,
  fromChartId: string
): Promise<ConfiguratorStateConfiguringChart | undefined> => {
  const config = await fetchChartConfig(fromChartId);

  if (config?.data) {
    // Do not keep the previous chart key
    delete config.data.key;
    const state = migrateConfiguratorState({
      ...config.data,
      state: "CONFIGURING_CHART",
    }) as ConfiguratorStateConfiguringChart;
    return await upgradeConfiguratorState(state, {
      client,
      dataSource: state.dataSource,
    });
  }
};

export const initChartStateFromChartEdit = async (
  client: Client,
  fromChartId: string,
  state?: string
): Promise<ConfiguratorStateConfiguringChart | undefined> => {
  const config = await fetchChartConfig(fromChartId);

  if (config?.data) {
    const configState = migrateConfiguratorState({
      ...config.data,
      state: state ?? "CONFIGURING_CHART",
    }) as ConfiguratorStateConfiguringChart;
    return await upgradeConfiguratorState(configState, {
      client,
      dataSource: configState.dataSource,
    });
  }
};
