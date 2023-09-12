import { Trans } from "@lingui/macro";
import { Box, Button, Popover, Tab, Tabs, Theme } from "@mui/material";
import { makeStyles } from "@mui/styles";
import React from "react";

import Flex from "@/components/flex";
import {
  ChartConfig,
  ChartType,
  ConfiguratorStateConfiguringChart,
  ConfiguratorStatePublishing,
  getChartConfig,
  hasChartConfigs,
  isPublished,
  useConfiguratorState,
} from "@/configurator";
import { ChartTypeSelector } from "@/configurator/components/chart-type-selector";
import { getIconName } from "@/configurator/components/ui-helpers";
import { flag } from "@/flags";
import {
  useComponentsQuery,
  useDataCubeMetadataQuery,
} from "@/graphql/query-hooks";
import { Icon, IconName } from "@/icons";
import { useLocale } from "@/src";
import { createChartId } from "@/utils/create-chart-id";
import useEvent from "@/utils/use-event";

type TabsState = {
  popoverOpen: boolean;
  popoverType: "edit" | "add";
  activeChartKey: string;
};

const TABS_STATE: TabsState = {
  popoverOpen: false,
  popoverType: "add",
  activeChartKey: "",
};

const TabsStateContext = React.createContext<
  [TabsState, React.Dispatch<TabsState>] | undefined
>(undefined);

export const useTabsState = () => {
  const ctx = React.useContext(TabsStateContext);

  if (ctx === undefined) {
    throw Error(
      "You need to wrap your component in <TabsStateProvider /> to useTabsState()"
    );
  }

  return ctx;
};

const TabsStateProvider = (props: React.PropsWithChildren<{}>) => {
  const { children } = props;
  const [state, dispatch] = React.useState<TabsState>(TABS_STATE);

  return (
    <TabsStateContext.Provider value={[state, dispatch]}>
      {children}
    </TabsStateContext.Provider>
  );
};

export const ChartSelectionTabs = () => {
  const [state] = useConfiguratorState(hasChartConfigs);
  const editable =
    state.state === "CONFIGURING_CHART" || state.state === "PUBLISHING";

  if (!editable && state.chartConfigs.length === 1) {
    return null;
  }

  const chartConfig = getChartConfig(state);
  const data: TabDatum[] = state.chartConfigs.map((d) => {
    return {
      key: d.key,
      chartType: d.chartType,
      active: d.key === chartConfig.key,
    };
  });

  return (
    <TabsStateProvider>
      {editable ? (
        <TabsEditable state={state} chartConfig={chartConfig} data={data} />
      ) : (
        <TabsFixed data={data} />
      )}
    </TabsStateProvider>
  );
};

const useStyles = makeStyles<Theme>((theme) => ({
  editableChartTypeSelector: {
    width: 320,
    padding: `0 ${theme.spacing(3)} ${theme.spacing(3)}`,
  },
  tabContent: {
    gap: theme.spacing(1),
    alignItems: "center",
    padding: theme.spacing(2),
    borderTopLeftRadius: theme.spacing(1),
    borderTopRightRadius: theme.spacing(1),
    transition: "0.125s ease background-color",
    cursor: "default",
  },
  tabContentIconContainer: {
    padding: 0,
    minWidth: "fit-content",
    color: theme.palette.grey[700],
  },
}));

type TabsEditableProps = {
  state: ConfiguratorStateConfiguringChart | ConfiguratorStatePublishing;
  chartConfig: ChartConfig;
  data: TabDatum[];
};

const TabsEditable = (props: TabsEditableProps) => {
  const { state, chartConfig, data } = props;
  const [, dispatch] = useConfiguratorState();
  const locale = useLocale();
  const [tabsState, setTabsState] = useTabsState();
  const [popoverAnchorEl, setPopoverAnchorEl] =
    React.useState<HTMLElement | null>(null);
  const classes = useStyles({ editable: true });

  const handleClose = useEvent(() => {
    setPopoverAnchorEl(null);
    setTabsState({
      popoverOpen: false,
      popoverType: tabsState.popoverType,
      activeChartKey: tabsState.activeChartKey,
    });
  });

  React.useEffect(() => {
    handleClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.activeChartKey]);

  return (
    <>
      <TabsInner
        data={data}
        editable
        onChartAdd={(e) => {
          setPopoverAnchorEl(e.currentTarget);
          setTabsState({
            popoverOpen: true,
            popoverType: "add",
            activeChartKey: tabsState.activeChartKey,
          });
        }}
        onChartEdit={(e, key) => {
          setPopoverAnchorEl(e.currentTarget);
          setTabsState({
            popoverOpen: true,
            popoverType: "edit",
            activeChartKey: key,
          });
        }}
        onChartSwitch={(key) => {
          dispatch({
            type: "SWITCH_ACTIVE_CHART",
            value: key,
          });
        }}
      />

      <Popover
        id="chart-selection-popover"
        open={tabsState.popoverOpen}
        anchorEl={popoverAnchorEl}
        anchorOrigin={{
          horizontal: "left",
          vertical: "bottom",
        }}
        onClose={handleClose}
      >
        {tabsState.popoverType === "add" ? (
          <ChartTypeSelector
            className={classes.editableChartTypeSelector}
            state={state}
            type="add"
            chartKey={tabsState.activeChartKey ?? chartConfig.key}
          />
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, p: 4 }}>
            <Button
              onClick={() => {
                dispatch({
                  type: "CHART_CONFIG_ADD",
                  value: {
                    chartConfig: {
                      ...getChartConfig(state, tabsState.activeChartKey),
                      key: createChartId(),
                    },
                    locale,
                  },
                });
                handleClose();
              }}
              sx={{ justifyContent: "center" }}
            >
              <Trans id="controls.duplicate.visualization">
                Duplicate this visualization
              </Trans>
            </Button>

            {state.chartConfigs.length > 1 && (
              <Button
                color="error"
                onClick={() => {
                  dispatch({
                    type: "CHART_CONFIG_REMOVE",
                    value: {
                      chartKey: tabsState.activeChartKey,
                    },
                  });
                  handleClose();
                }}
                sx={{ justifyContent: "center" }}
              >
                <Trans id="controls.remove.visualization">
                  Remove this visualization
                </Trans>
              </Button>
            )}
          </Box>
        )}
      </Popover>
    </>
  );
};

type TabDatum = {
  key: string;
  chartType: ChartType;
  active: boolean;
};

type TabsFixedProps = {
  data: TabDatum[];
};

const TabsFixed = (props: TabsFixedProps) => {
  const { data } = props;
  const [, dispatch] = useConfiguratorState(isPublished);

  return (
    <TabsInner
      data={data}
      editable={false}
      onChartSwitch={(key: string) => {
        dispatch({
          type: "SWITCH_ACTIVE_CHART",
          value: key,
        });
      }}
    />
  );
};

const PublishChartButton = () => {
  const locale = useLocale();
  const [state, dispatch] = useConfiguratorState(hasChartConfigs);
  const { dataSet } = state;
  const variables = {
    iri: dataSet ?? "",
    sourceType: state.dataSource.type,
    sourceUrl: state.dataSource.url,
    locale,
  };
  const [{ data: metadata }] = useDataCubeMetadataQuery({
    variables,
    pause: !dataSet,
  });
  const [{ data: components }] = useComponentsQuery({
    variables,
    pause: !dataSet,
  });
  const goNext = useEvent(() => {
    if (metadata?.dataCubeByIri && components?.dataCubeByIri) {
      dispatch({
        type: "STEP_NEXT",
        dataSetMetadata: {
          ...metadata.dataCubeByIri,
          ...components.dataCubeByIri,
        },
      });
    }
  });

  return (
    <Button
      color="primary"
      variant="contained"
      onClick={metadata && components ? goNext : undefined}
    >
      <Trans id="button.publish">Publish this visualization</Trans>
    </Button>
  );
};

type TabsInnerProps = {
  data: TabDatum[];
  editable: boolean;
  onChartAdd?: (e: React.MouseEvent<HTMLElement>) => void;
  onChartEdit?: (e: React.MouseEvent<HTMLElement>, key: string) => void;
  onChartSwitch?: (key: string) => void;
};

const TabsInner = (props: TabsInnerProps) => {
  const { data, editable, onChartEdit, onChartAdd, onChartSwitch } = props;

  return (
    <Box display="flex" sx={{ width: "100%", alignItems: "flex-start" }}>
      <Tabs
        value={0}
        TabIndicatorProps={{ style: { display: "none" } }}
        sx={{ position: "relative", top: 1, flexGrow: 1 }}
      >
        {data.map((d) => (
          <Tab
            key={d.key}
            sx={{
              width: 100,
              mr: 2,
              p: 0,
              background: "white",
              border: (theme) => `1px solid ${theme.palette.divider}`,
              borderBottom: (theme) =>
                `1px solid ${d.active ? "transparent" : theme.palette.divider}`,
              minWidth: "fit-content",
            }}
            label={
              <TabContent
                iconName={getIconName(d.chartType)}
                chartKey={d.key}
                editable={editable && flag("dashboards")}
                active={d.active}
                onEditClick={(e) => {
                  onChartEdit?.(e, d.key);
                }}
                onSwitchClick={() => {
                  onChartSwitch?.(d.key);
                }}
              />
            }
          />
        ))}

        {editable && flag("dashboards") && (
          <Tab
            sx={{
              ml: (theme) => `-${theme.spacing(2)}`,
              p: 0,
              background: "white",
              borderBottomWidth: 1,
              borderBottomStyle: "solid",
              borderBottomColor: "divider",
              minWidth: "fit-content",
            }}
            onClick={onChartAdd}
            label={
              <TabContent
                iconName="add"
                chartKey=""
                editable={false}
                active={false}
              />
            }
          />
        )}
      </Tabs>
      {editable && <PublishChartButton />}
    </Box>
  );
};

type TabContentProps = {
  iconName: IconName;
  chartKey: string;
  editable: boolean;
  active: boolean;
  onEditClick?: (
    e: React.MouseEvent<HTMLElement>,
    activeChartKey: string
  ) => void;
  onSwitchClick?: () => void;
};

const TabContent = (props: TabContentProps) => {
  const { iconName, chartKey, editable, active, onEditClick, onSwitchClick } =
    props;
  const classes = useStyles();

  return (
    <Flex className={classes.tabContent}>
      <Button
        variant="text"
        onClick={onSwitchClick}
        sx={{
          minWidth: "fit-content",
          color: active ? "primary.main" : "secondary.active",
        }}
      >
        <Icon name={iconName} />
      </Button>
      {editable && (
        <Button
          variant="text"
          onClick={(e) => {
            onEditClick?.(e, chartKey);
          }}
          className={classes.tabContentIconContainer}
        >
          <Icon name="chevronDown" size={16} />
        </Button>
      )}
    </Flex>
  );
};
