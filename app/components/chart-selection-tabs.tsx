import { Trans } from "@lingui/macro";
import { Box, Button, Popover, Tab, Tabs, Theme } from "@mui/material";
import { makeStyles } from "@mui/styles";
import React, {
  Dispatch,
  ReactNode,
  createContext,
  useContext,
  useState,
} from "react";

import Flex from "@/components/flex";
import {
  ChartConfig,
  ChartType,
  ConfiguratorStateConfiguringChart,
  ConfiguratorStatePublished,
  ConfiguratorStatePublishing,
  getChartConfig,
  isPublished,
  useConfiguratorState,
} from "@/configurator";
import { ChartTypeSelector } from "@/configurator/components/chart-type-selector";
import { getIconName } from "@/configurator/components/ui-helpers";
import {
  useComponentsQuery,
  useDataCubeMetadataQuery,
} from "@/graphql/query-hooks";
import { Icon, IconName } from "@/icons";
import { useLocale } from "@/src";
import useEvent from "@/utils/use-event";

type TabsState = {
  isPopoverOpen: boolean;
  popoverType: "edit" | "add";
  activeChartKey?: string;
};

const TabsStateContext = createContext<
  [TabsState, Dispatch<TabsState>] | undefined
>(undefined);

export const useTabsState = () => {
  const ctx = useContext(TabsStateContext);

  if (ctx === undefined) {
    throw Error(
      "You need to wrap your component in <TabsStateProvider /> to useTabsState()"
    );
  }

  return ctx;
};

const TabsStateProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useState<TabsState>({
    popoverType: "add",
    isPopoverOpen: false,
  });

  return (
    <TabsStateContext.Provider value={[state, dispatch]}>
      {children}
    </TabsStateContext.Provider>
  );
};

export const ChartSelectionTabs = () => {
  const [state] = useConfiguratorState() as [
    (
      | ConfiguratorStateConfiguringChart
      | ConfiguratorStatePublishing
      | ConfiguratorStatePublished
    ),
    Dispatch<any>
  ];
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
      editable: editable && state.chartConfigs.length > 1,
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
  const [tabsState, setTabsState] = useTabsState();
  const [popoverAnchorEl, setPopoverAnchorEl] = useState<HTMLElement | null>(
    null
  );

  const classes = useStyles({ editable: true });

  const handleClose = useEvent(() => {
    setPopoverAnchorEl(null);
    setTabsState({
      isPopoverOpen: false,
      popoverType: tabsState.popoverType,
      activeChartKey: tabsState.activeChartKey,
    });
  });

  React.useEffect(() => {
    handleClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chartConfig.chartType]);

  React.useEffect(() => {
    setTabsState({
      isPopoverOpen: false,
      popoverType: "add",
      activeChartKey: chartConfig.key,
    });
  }, [chartConfig.key, setTabsState]);

  return (
    <>
      <TabsInner
        data={data}
        editable
        onActionButtonClick={(
          e: React.MouseEvent<HTMLElement>,
          activeChartKey: string
        ) => {
          e.stopPropagation();
          setPopoverAnchorEl(e.currentTarget);
          setTabsState({
            isPopoverOpen: true,
            popoverType: "edit",
            activeChartKey,
          });
        }}
        onSwitchButtonClick={(key: string) => {
          dispatch({
            type: "SWITCH_ACTIVE_CHART",
            value: key,
          });
        }}
        onAddButtonClick={(e) => {
          e.stopPropagation();
          setPopoverAnchorEl(e.currentTarget);
          setTabsState({
            isPopoverOpen: true,
            popoverType: "add",
            activeChartKey: tabsState.activeChartKey,
          });
        }}
      />
      <Popover
        id="chart-selection-popover"
        open={tabsState.isPopoverOpen}
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
          <Box>
            <Button
              sx={{ m: 4, justifyContent: "center" }}
              onClick={() => {
                dispatch({
                  type: "CHART_CONFIG_REMOVE",
                  value: {
                    chartKey: tabsState.activeChartKey as string,
                  },
                });
                handleClose();
              }}
            >
              <Trans id="controls.remove.visualization">
                Remove this visualization
              </Trans>
            </Button>
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
  editable: boolean;
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
      onSwitchButtonClick={(key: string) => {
        dispatch({
          type: "SWITCH_ACTIVE_CHART",
          value: key,
        });
      }}
    />
  );
};

const PublishChartButton = () => {
  const [state, dispatch] = useConfiguratorState();
  const { dataSet: dataSetIri } = state as
    | ConfiguratorStateConfiguringChart
    | ConfiguratorStatePublishing;
  const locale = useLocale();
  const [{ data: metadata }] = useDataCubeMetadataQuery({
    variables: {
      iri: dataSetIri ?? "",
      sourceType: state.dataSource.type,
      sourceUrl: state.dataSource.url,
      locale,
    },
    pause: !dataSetIri,
  });
  const [{ data: components }] = useComponentsQuery({
    variables: {
      iri: dataSetIri ?? "",
      sourceType: state.dataSource.type,
      sourceUrl: state.dataSource.url,
      locale,
    },
    pause: !dataSetIri,
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

const TabsInner = ({
  data,
  editable,
  onActionButtonClick,
  onSwitchButtonClick,
  onAddButtonClick,
}: {
  data: TabDatum[];
  editable: boolean;
  onActionButtonClick?: (
    e: React.MouseEvent<HTMLElement>,
    activeChartKey: string
  ) => void;
  onSwitchButtonClick?: (key: string) => void;
  onAddButtonClick?: (e: React.MouseEvent<HTMLElement>) => void;
}) => {
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
                editable={d.editable}
                active={d.active}
                onEditClick={onActionButtonClick}
                onSwitchClick={(e) => {
                  e.stopPropagation();
                  onSwitchButtonClick?.(d.key);
                }}
              />
            }
          />
        ))}
        {editable && (
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
            onClick={onAddButtonClick}
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

const TabContent = ({
  iconName,
  chartKey,
  editable,
  active,
  onEditClick,
  onSwitchClick,
}: {
  iconName: IconName;
  chartKey: string;
  editable: boolean;
  active: boolean;
  onEditClick?: (
    e: React.MouseEvent<HTMLElement>,
    activeChartKey: string
  ) => void;
  onSwitchClick?: (e: React.MouseEvent<HTMLElement>) => void;
}) => {
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
