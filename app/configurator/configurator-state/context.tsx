import { ParsedUrlQuery } from "querystring";

import { PUBLISHED_STATE } from "@prisma/client";
import { NextRouter, useRouter } from "next/router";
import {
  createContext,
  Dispatch,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
} from "react";
import { Client, useClient } from "urql";
import { useImmerReducer } from "use-immer";

import {
  ChartConfig,
  ConfiguratorState,
  ConfiguratorStatePublishing,
} from "@/config-types";
import { ConfiguratorStateAction } from "@/configurator/configurator-state/actions";
import {
  initChartStateFromChartCopy,
  initChartStateFromChartEdit,
  initChartStateFromCube,
  initChartStateFromLocalStorage,
} from "@/configurator/configurator-state/init";
import { INITIAL_STATE } from "@/configurator/configurator-state/initial";
import { saveChartLocally } from "@/configurator/configurator-state/local-storage";
import { reducer } from "@/configurator/configurator-state/reducer";
import { ParsedConfig } from "@/db/config";
import { useLocale } from "@/locales/use-locale";
import { useUser } from "@/login/utils";
import { useDataSourceStore } from "@/stores/data-source";
import {
  createConfig,
  fetchChartConfig,
  updateConfig,
} from "@/utils/chart-config/api";
import { createId } from "@/utils/create-id";
import { getRouterChartId } from "@/utils/router/helpers";

const ConfiguratorStateContext = createContext<
  [ConfiguratorState, Dispatch<ConfiguratorStateAction>] | undefined
>(undefined);

type ConfiguratorStateProviderProps = PropsWithChildren<{
  chartId: string;
  initialState?: ConfiguratorState;
  allowDefaultRedirect?: boolean;
}>;

export const ConfiguratorStateProvider = (
  props: ConfiguratorStateProviderProps
) => {
  return (
    <ConfiguratorStateProviderInternal
      // Ensure that the state is reset by using the `chartId` as `key`
      key={props.chartId}
      {...props}
    />
  );
};

export const useConfiguratorState = <T extends ConfiguratorState>(
  predicate?: (s: ConfiguratorState) => s is T
) => {
  const ctx = useContext(ConfiguratorStateContext);

  if (ctx === undefined) {
    throw Error(
      "You need an <ConfiguratorStateProvider> to useConfiguratorState"
    );
  }

  const [state, dispatch] = ctx;

  if (predicate && !predicate(state)) {
    throw Error("State does not respect type guard");
  }

  return [state, dispatch] as [T, typeof dispatch];
};

export const useReadOnlyConfiguratorState = <T extends ConfiguratorState>(
  predicate?: (s: ConfiguratorState) => s is T
) => {
  const ctx = useContext(ConfiguratorStateContext);

  if (ctx === undefined) {
    throw Error(
      "You need an <ConfiguratorStateProvider> to useConfiguratorState"
    );
  }

  const [state] = ctx;

  if (predicate && !predicate(state)) {
    throw Error("State does not respect type guard");
  }

  return state as T;
};

const preparePublishingState = (
  state: ConfiguratorStatePublishing,
  chartConfigs: ChartConfig[],
  activeChartKey?: string
): ConfiguratorStatePublishing => {
  return {
    ...state,
    chartConfigs: [
      ...chartConfigs.map((chartConfig) => {
        return {
          ...chartConfig,
          cubes: chartConfig.cubes.map((cube) => {
            return {
              ...cube,
              // Ensure that the filters are in the correct order, as JSON
              // does not guarantee order (and we need this as interactive
              // filters are dependent on the order of the filters).
              filters: Object.fromEntries(
                Object.entries(cube.filters).map(([k, v], i) => {
                  return [k, { ...v, position: i }];
                })
              ),
            };
          }),
        };
      }),
    ],
    // Technically, we do not need to store the active chart key, as
    // it's only used in the edit mode, but it makes it easier to manage
    // the state when retrieving the chart from the database. Potentially,
    // it might also be useful for other things in the future (e.g. when we
    // have multiple charts in the "stepper mode", and we'd like to start
    // the story from a specific point and e.g. toggle back and forth between
    // the different charts).
    activeChartKey: activeChartKey ?? state.chartConfigs[0].key,
  };
};

const handlePublishSuccess = async (
  chartId: string,
  push: NextRouter["push"]
) => {
  /**
   * EXPERIMENTAL: Post back created chart ID to opener and close window.
   *
   * This allows the chart creation workflow to be integrated with other tools like a CMS
   */

  // FIXME: Check for more than just opener?
  const opener = window.opener;
  if (opener) {
    opener.postMessage(`CHART_ID:${chartId}`, "*");
    window.close();
    return;
  }

  await push({
    pathname: `/v/${chartId}`,
    query: { publishSuccess: true },
  });
};

async function initializeChartState(
  chartId: string,
  query: ParsedUrlQuery,
  client: Client,
  dataSource: { type: "sql" | "sparql"; url: string },
  locale: string
) {
  if (chartId === "new") {
    if (query.copy && typeof query.copy === "string") {
      return initChartStateFromChartCopy(client, query.copy);
    } else if (query.edit && typeof query.edit === "string") {
      return initChartStateFromChartEdit(
        client,
        query.edit,
        typeof query.state === "string" ? query.state : undefined
      );
    } else if (query.cube && typeof query.cube === "string") {
      return initChartStateFromCube(client, query.cube, dataSource, locale);
    }
  } else if (chartId !== "published") {
    return initChartStateFromLocalStorage(client, chartId);
  }
}

export async function publishState(
  user: ReturnType<typeof useUser>,
  key: string,
  state: Extract<ConfiguratorState, { state: "PUBLISHING" }>,

  /** Will be called for all configs that have been shared (multiple ones in case of layout:singleURLs) */
  onSaveConfig: (savedConfig: { key: string }, i: number, total: number) => void
) {
  switch (state.layout.type) {
    case "singleURLs":
      const { publishableChartKeys, meta, blocks } = state.layout;
      const reversedChartKeys = publishableChartKeys.slice().reverse();

      // Charts are published in order, keep the current tab open with first chart
      // subSequent charts are opened in a new window
      return allSequential(reversedChartKeys, async (chartKey, i) => {
        const preparedConfig = preparePublishingState(
          {
            ...state,
            // Ensure that the layout is reset to single-chart mode
            layout: {
              type: "tab",
              meta,
              blocks,
              activeField: undefined,
            },
          },
          state.chartConfigs.filter((d) => d.key === chartKey) as ChartConfig[],
          chartKey
        );

        const result = await createConfig({
          data: preparedConfig,
          published_state: PUBLISHED_STATE.PUBLISHED,
        });
        onSaveConfig(result, i + 1, reversedChartKeys.length);

        return result;
      });
    default:
      let dbConfig: ParsedConfig | undefined;

      if (key && user) {
        const config = await fetchChartConfig(key);

        if (config && config.user_id === user.id) {
          dbConfig = config;
        }
      }

      const preparedConfig = preparePublishingState(state, state.chartConfigs);

      const result = await (dbConfig && user
        ? updateConfig({
            data: preparedConfig,
            key: dbConfig.key,
            published_state: PUBLISHED_STATE.PUBLISHED,
          })
        : createConfig({
            data: preparedConfig,
            published_state: PUBLISHED_STATE.PUBLISHED,
          }));

      onSaveConfig(result, 0, 1);
      return result;
  }
}

const allSequential = async <TInput, TOutput>(
  input: TInput[],
  cb: (item: TInput, i: number) => TOutput
) => {
  const res = [];
  for (let i = 0; i < input.length; i++) {
    const r = input[i];
    const result = await cb(r, i);
    res.push(result);
  }
  return res;
};

const ConfiguratorStateProviderInternal = (
  props: ConfiguratorStateProviderProps
) => {
  const {
    chartId,
    initialState,
    allowDefaultRedirect = true,
    children,
  } = props;
  const { dataSource } = useDataSourceStore();
  const initialStateWithDataSource = useMemo(() => {
    return initialState ? initialState : { ...INITIAL_STATE, dataSource };
  }, [initialState, dataSource]);
  const locale = useLocale();
  const stateAndDispatch = useImmerReducer(reducer, initialStateWithDataSource);
  const [state, dispatch] = stateAndDispatch;
  const { asPath, push, replace, query } = useRouter();
  const user = useUser();
  const client = useClient();

  // Initialize state on page load.
  useEffect(() => {
    let stateToInitialize = initialStateWithDataSource;
    const initialize = async () => {
      try {
        const newChartState = await initializeChartState(
          chartId,
          query,
          client,
          dataSource,
          locale
        );

        if (!newChartState && allowDefaultRedirect && chartId !== "published") {
          replace(`/create/new`);
        }
        stateToInitialize = newChartState ?? stateToInitialize;
      } finally {
        dispatch({ type: "INITIALIZED", value: stateToInitialize });
      }
    };

    initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (state.state === "INITIAL" || state.state === "SELECTING_DATASET") {
      dispatch({ type: "DATASOURCE_CHANGED", value: dataSource });
    }
  }, [dataSource, dispatch, state.state]);

  useEffect(() => {
    try {
      switch (state.state) {
        case "CONFIGURING_CHART":
        case "LAYOUTING":
          const savedChartId =
            chartId === "new"
              ? query.edit && typeof query.edit === "string"
                ? query.edit
                : createId()
              : chartId;
          if (chartId === "new") {
            replace(`/create/${savedChartId}`);
          }
          saveChartLocally(savedChartId, state);
          return;

        case "PUBLISHING":
          (async () => {
            try {
              const key = getRouterChartId(asPath);

              if (!key) {
                return;
              }

              return publishState(
                user,
                key,
                state,
                async (result, i, total) => {
                  if (state.layout.type === "singleURLs" && i < total) {
                    // Open new tab for each chart, except the first one
                    return window.open(`/${locale}/v/${result.key}`, "_blank");
                  }

                  await handlePublishSuccess(result.key, push);
                }
              );
            } catch (e) {
              console.error(e);
              dispatch({ type: "PUBLISH_FAILED" });
            }
          })();

          return;
      }
    } catch (e) {
      console.error(e);
    }
  }, [
    state,
    dispatch,
    chartId,
    push,
    asPath,
    locale,
    query.from,
    replace,
    user,
    query.edit,
  ]);

  return (
    <ConfiguratorStateContext.Provider value={stateAndDispatch}>
      {children}
    </ConfiguratorStateContext.Provider>
  );
};
