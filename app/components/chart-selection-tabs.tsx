import { t, Trans } from "@lingui/macro";
import {
  Box,
  Popover,
  Tab,
  Tabs,
  Theme,
  Button,
  Typography,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import React, {
  createContext,
  Dispatch,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  ChartType,
  ConfiguratorStateConfiguringChart,
  ConfiguratorStatePublishing,
  useConfiguratorState,
} from "@/configurator";
import { ChartTypeSelector } from "@/configurator/components/chart-type-selector";
import { getIconName } from "@/configurator/components/ui-helpers";
import useDisclosure from "@/configurator/components/use-disclosure";
import { useDataCubeMetadataWithComponentValuesQuery } from "@/graphql/query-hooks";
import { Icon, IconName } from "@/icons";
import { useLocale } from "@/src";
import useEvent from "@/utils/use-event";

import { Boldify } from "./boldify";
import { CopyToClipboardTextInput } from "./copy-to-clipboard-text-input";
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
      backgroundColor: ({ editable }) =>
        editable ? theme.palette.grey[200] : undefined,
    },
  },
  tabContentIconContainer: {
    color: theme.palette.grey[700],
  },
}));

const TabsEditable = ({ chartType }: { chartType: ChartType }) => {
  const [configuratorState] = useConfiguratorState() as unknown as [
    ConfiguratorStateConfiguringChart | ConfiguratorStatePublishing
  ];
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
  }, [configuratorState.chartConfig.chartType]);

  return (
    <>
      <TabsInner
        chartType={chartType}
        editable={true}
        onActionButtonClick={(e: React.MouseEvent<HTMLElement>) => {
          setPopoverAnchorEl(e.currentTarget);
          setTabsState({ isPopoverOpen: true });
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
          state={configuratorState}
        />
      </Popover>
    </>
  );
};

const TabsFixed = ({ chartType }: { chartType: ChartType }) => {
  return <TabsInner chartType={chartType} editable={false} />;
};

const PublishChartButton = () => {
  const [state, dispatch] = useConfiguratorState();
  const { dataSet: dataSetIri } = state as
    | ConfiguratorStatePublishing
    | ConfiguratorStateConfiguringChart;
  const locale = useLocale();
  const [{ data }] = useDataCubeMetadataWithComponentValuesQuery({
    variables: {
      iri: dataSetIri ?? "",
      sourceType: state.dataSource.type,
      sourceUrl: state.dataSource.url,
      locale,
    },
    pause: !dataSetIri,
  });
  const goNext = useEvent(() => {
    if (data?.dataCubeByIri) {
      dispatch({
        type: "STEP_NEXT",
        dataSetMetadata: data?.dataCubeByIri,
      });
    }
  });

  return (
    <Button
      color="primary"
      variant="contained"
      onClick={data ? goNext : undefined}
    >
      <Trans id="button.publish">Publish the chart</Trans>
    </Button>
  );
};

const usePopoverArrowStyles = makeStyles((theme: Theme) => ({
  paper: {
    overflowX: "unset",
    overflowY: "unset",
    "&::before": {
      content: '""',
      position: "absolute",
      top: -9,
      right: "1rem",
      width: 10,
      height: 10,
      backgroundColor: theme.palette.background.paper,
      boxShadow: theme.shadows[1],
      transform: "translate(-50%, 50%) rotate(-45deg)",
      clipPath:
        "polygon(-5px -5px, calc(100% + 5px) -5px, calc(100% + 5px) calc(100% + 5px))",
    },
  },
}));

const ShareChartEditionButton = () => {
  const [state] = useConfiguratorState();
  const classes = usePopoverArrowStyles();
  const { isOpen, open, close } = useDisclosure();
  const { key } = state as
    | ConfiguratorStatePublishing
    | ConfiguratorStateConfiguringChart;

  const locale = useLocale();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const handleOpen = useEvent(() => {
    open();
  });
  const handleClose = useEvent(() => {
    close();
  });

  if (!key) {
    return null;
  }

  return (
    <>
      <Button
        color="primary"
        variant="outlined"
        onClick={handleOpen}
        ref={buttonRef}
      >
        <Trans id="share-creation.button">Share</Trans>
      </Button>
      <Popover
        open={isOpen}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        anchorEl={buttonRef.current}
        onClose={handleClose}
        PaperProps={{ className: classes.paper }}
      >
        <Box minWidth={200} p={4} sx={{ "& > * + *": { mt: 2 } }}>
          <Typography variant="h4" gutterBottom>
            <Trans id="share-creation.popover.title">Share creation URL</Trans>
          </Typography>
          <div>
            <Typography variant="h5" gutterBottom>
              <Trans id="share-creation.popover.share-copy.title">
                Share a copy
              </Trans>
            </Typography>
            <CopyToClipboardTextInput
              content={`${window.location.origin}/${locale}/create/${key}`}
            />

            <Typography variant="caption">
              <Boldify>
                {t({
                  id: "share-creation.popover.share-with-editing-rights.caption",
                  message:
                    "The other person *will not be able* to overwrite your chart settings.",
                })}
              </Boldify>
            </Typography>
          </div>
          <div>
            <Typography variant="h5" gutterBottom>
              Share with editing rights
            </Typography>
            <CopyToClipboardTextInput
              content={`${window.location.origin}/${locale}/create/new?from=${key}`}
            />
            <Typography variant="caption">
              <Boldify>
                {t({
                  id: "share-creation.popover.share-copy.caption",
                  message:
                    "The other person *will be able* to overwrite your chart settings.",
                })}
              </Boldify>
            </Typography>
          </div>
        </Box>
      </Popover>
    </>
  );
};

const TabsInner = ({
  chartType,
  editable,
  onActionButtonClick,
}: {
  chartType: ChartType;
  editable: boolean;
  onActionButtonClick?: (e: React.MouseEvent<HTMLElement>) => void;
}) => {
  return (
    <Box display="flex" sx={{ width: "100%", alignItems: "flex-start" }}>
      <Tabs
        value={0}
        TabIndicatorProps={{ style: { display: "none" } }}
        sx={{ position: "relative", top: 1, flexGrow: 1 }}
      >
        {/* TODO: Generate dynamically when chart composition is implemented. Add useStyles */}
        <Tab
          sx={{
            p: 0,
            background: "white",
            border: "1px solid",
            borderBottomWidth: 0,
            borderColor: "divider",
          }}
          onClick={onActionButtonClick}
          label={
            <TabContent iconName={getIconName(chartType)} editable={editable} />
          }
        />
      </Tabs>
      <Flex sx={{ gap: "0.5rem" }}>
        <ShareChartEditionButton />
        <PublishChartButton />
      </Flex>
    </Box>
  );
};

const TabContent = ({
  iconName,
  editable = false,
}: {
  iconName: IconName;
  editable?: boolean;
}) => {
  const classes = useStyles({ editable });

  return (
    <Flex className={classes.tabContent}>
      <Icon name={iconName} />
      {editable && (
        <Box component="span" className={classes.tabContentIconContainer}>
          <Icon name="chevronDown" size={16} />
        </Box>
      )}
    </Flex>
  );
};
