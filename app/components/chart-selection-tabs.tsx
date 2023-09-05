import { Trans } from "@lingui/macro";
import { Box, Button, Popover, Tab, Tabs, Theme } from "@mui/material";
import { makeStyles } from "@mui/styles";
import React, {
  Dispatch,
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  ChartType,
  ConfiguratorStateConfiguringChart,
  ConfiguratorStatePublishing,
  getChartConfig,
  isConfiguring,
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
import { createChartId } from "@/utils/create-chart-id";
import useEvent from "@/utils/use-event";

import Flex from "./flex";

type TabsState = {
  isPopoverOpen: boolean;
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
  const [state, dispatch] = useState<TabsState>({ isPopoverOpen: false });

  return (
    <TabsStateContext.Provider value={[state, dispatch]}>
      {children}
    </TabsStateContext.Provider>
  );
};

export const ChartSelectionTabs = ({
  chartType,
  editable,
}: {
  chartType: ChartType;
  /** Tabs are not editable when they are published. */
  editable: boolean;
}) => {
  return (
    <TabsStateProvider>
      {editable ? (
        <TabsEditable chartType={chartType} />
      ) : (
        <TabsFixed chartType={chartType} />
      )}
    </TabsStateProvider>
  );
};

const useStyles = makeStyles<Theme, { editable: boolean }>((theme) => ({
  editableChartTypeSelector: {
    width: 320,
    padding: `0 ${theme.spacing(3)} ${theme.spacing(3)}`,
  },
  tabContent: {
    gap: theme.spacing(2),
    alignItems: "center",
    padding: `${theme.spacing(1)} ${theme.spacing(3)}`,
    borderRadius: 3,
    transition: "0.125s ease background-color",
    "&:hover": {
      backgroundColor: ({ editable }: { editable: boolean }) =>
        editable ? theme.palette.grey[200] : undefined,
    },
  },
  tabContentIconContainer: {
    color: theme.palette.grey[700],
  },
}));

const TabsEditable = ({ chartType }: { chartType: ChartType }) => {
  const [state, dispatch] = useConfiguratorState(isConfiguring);
  const chartConfig = getChartConfig(state);
  const [tabsState, setTabsState] = useTabsState();
  const [popoverAnchorEl, setPopoverAnchorEl] = useState<HTMLElement | null>(
    null
  );

  const classes = useStyles({ editable: true });

  const handleClose = useEvent(() => {
    setPopoverAnchorEl(null);
    setTabsState({ isPopoverOpen: false });
  });

  useEffect(() => {
    handleClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chartConfig.chartType]);

  return (
    <>
      <TabsInner
        data={state.chartConfigs.map((d) => {
          return {
            key: d.key,
            chartType: d.chartType,
            editable: true,
          };
        })}
        onActionButtonClick={(e: React.MouseEvent<HTMLElement>) => {
          e.stopPropagation();
          setPopoverAnchorEl(e.currentTarget);
          setTabsState({ isPopoverOpen: true });
        }}
        onSwitchButtonClick={(key: string) => {
          dispatch({
            type: "SWITCH_ACTIVE_CHART",
            value: key,
          });
        }}
        onAddButtonClick={() => {
          dispatch({
            type: "CHART_CONFIG_ADD",
            value: {
              chartConfig: {
                ...chartConfig,
                key: createChartId(),
              },
            },
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
        <ChartTypeSelector
          className={classes.editableChartTypeSelector}
          state={state}
        />
      </Popover>
    </>
  );
};

const TabsFixed = ({ chartType }: { chartType: ChartType }) => {
  return <TabsInner data={[{ key: "", chartType }]} />;
};

const PublishChartButton = () => {
  const [state, dispatch] = useConfiguratorState();
  const { dataSet: dataSetIri } = state as
    | ConfiguratorStatePublishing
    | ConfiguratorStateConfiguringChart;
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
      <Trans id="button.publish">Publish the chart</Trans>
    </Button>
  );
};

const TabsInner = ({
  data,
  onActionButtonClick,
  onSwitchButtonClick,
  onAddButtonClick,
}: {
  data: { key: string; chartType: ChartType; editable?: boolean }[];
  onActionButtonClick?: (e: React.MouseEvent<HTMLElement>) => void;
  onSwitchButtonClick?: (key: string) => void;
  onAddButtonClick?: () => void;
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
              p: 0,
              background: "white",
              border: "1px solid",
              borderBottomWidth: 0,
              borderColor: "divider",
            }}
            label={
              <TabContent
                iconName={getIconName(d.chartType)}
                editable={d.editable ?? false}
                onEditClick={onActionButtonClick}
                onSwitchClick={(e) => {
                  e.stopPropagation();
                  onSwitchButtonClick?.(d.key);
                }}
              />
            }
          />
        ))}
        <Tab
          sx={{
            p: 0,
            background: "white",
            border: "1px solid",
            borderBottomWidth: 0,
            borderColor: "divider",
          }}
          onClick={onAddButtonClick}
          label={<TabContent iconName="add" editable={false} />}
        />
      </Tabs>
      <PublishChartButton />
    </Box>
  );
};

const TabContent = ({
  iconName,
  editable,
  onEditClick,
  onSwitchClick,
}: {
  iconName: IconName;
  editable: boolean;
  onEditClick?: (e: React.MouseEvent<HTMLElement>) => void;
  onSwitchClick?: (e: React.MouseEvent<HTMLElement>) => void;
}) => {
  const classes = useStyles({ editable });

  return (
    <Flex className={classes.tabContent}>
      <Button variant="text" onClick={onSwitchClick}>
        <Icon name={iconName} />
      </Button>
      {editable && (
        <Button variant="text" onClick={onEditClick}>
          <Box component="span" className={classes.tabContentIconContainer}>
            <Icon name="chevronDown" size={16} />
          </Box>
        </Button>
      )}
    </Flex>
  );
};
