import { t, Trans } from "@lingui/macro";
import { TabContext } from "@mui/lab";
import {
  Button,
  Divider,
  Popover,
  Stack,
  tabClasses,
  Theme,
  Tooltip,
  Typography,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import clsx from "clsx";
import React, { createContext, useContext, useEffect, useState } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";

import { ArrowMenuTopCenter } from "@/components/arrow-menu";
import { DuplicateChartMenuActionItem } from "@/components/chart-shared";
import { DragHandle } from "@/components/drag-handle";
import Flex from "@/components/flex";
import { MenuActionItem } from "@/components/menu-action-item";
import { VisualizeTab, VisualizeTabList } from "@/components/tabs";
import {
  ChartConfig,
  ChartType,
  ConfiguratorStatePublished,
  ConfiguratorStateWithChartConfigs,
  getChartConfig,
  hasChartConfigs,
  isConfiguring,
  isLayouting,
  isPublished,
  isPublishing,
  useConfiguratorState,
} from "@/configurator";
import { useSearchDatasetPanelStore } from "@/configurator/components/add-new-dataset-panel";
import { ChartTypeSelector } from "@/configurator/components/chart-type-selector";
import { getIconName } from "@/configurator/components/ui-helpers";
import { useFlag } from "@/flags";
import { Icon, IconName } from "@/icons";
import { useLocale } from "@/locales";
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

const TabsStateContext = createContext<
  [TabsState, React.Dispatch<TabsState>] | undefined
>(undefined);

const useTabsState = () => {
  const ctx = useContext(TabsStateContext);

  if (ctx === undefined) {
    throw Error(
      "You need to wrap your component in <TabsStateProvider /> to useTabsState()"
    );
  }

  return ctx;
};

const TabsStateProvider = (props: React.PropsWithChildren<{}>) => {
  const { children } = props;
  const [state, dispatch] = useState<TabsState>(TABS_STATE);

  return (
    <TabsStateContext.Provider value={[state, dispatch]}>
      {children}
    </TabsStateContext.Provider>
  );
};

export const ChartSelectionTabs = () => {
  const [state] = useConfiguratorState(hasChartConfigs);
  const editable =
    isConfiguring(state) || isLayouting(state) || isPublishing(state);
  const locale = useLocale();

  if (!editable && state.chartConfigs.length === 1) {
    return null;
  }

  const chartConfig = getChartConfig(state);
  const data: TabDatum[] = state.chartConfigs.map(
    ({ key, chartType, meta }) => {
      return {
        key,
        chartType,
        active: key === chartConfig.key,
        label: meta.label[locale] !== "" ? meta.label[locale] : undefined,
      };
    }
  );

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

type TabsEditableProps = {
  state: Exclude<ConfiguratorStateWithChartConfigs, ConfiguratorStatePublished>;
  chartConfig: ChartConfig;
  data: TabDatum[];
};

const TabsEditable = (props: TabsEditableProps) => {
  const { state, chartConfig, data } = props;
  const [, dispatch] = useConfiguratorState();
  const isConfiguringChart = isConfiguring(state);
  const [tabsState, setTabsState] = useTabsState();
  const [popoverAnchorEl, setPopoverAnchorEl] = useState<HTMLElement | null>(
    null
  );

  const handleClose = useEvent(() => {
    setPopoverAnchorEl(null);
    setTabsState({
      popoverOpen: false,
      popoverType: tabsState.popoverType,
      activeChartKey: tabsState.activeChartKey,
    });
  });

  useEffect(() => {
    handleClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.activeChartKey]);

  const { open: openAddDatasetPanel } = useSearchDatasetPanelStore();

  const addNewDatasetFlag = useFlag("configurator.add-dataset.new");

  return (
    <>
      <TabsInner
        data={data}
        addable={isConfiguringChart}
        editable={isConfiguringChart}
        draggable={state.chartConfigs.length > 1}
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

      {tabsState.popoverType === "add" ? (
        <Popover
          id="chart-selection-popover"
          open={tabsState.popoverOpen}
          anchorEl={popoverAnchorEl}
          anchorOrigin={{
            horizontal: "left",
            vertical: "bottom",
          }}
          onClose={handleClose}
          PaperProps={{
            sx: {
              py: "1rem",
            },
          }}
        >
          <Stack
            divider={<Divider sx={{ mx: "1.5rem" }} />}
            gap="0.5rem"
            direction="column"
          >
            <Stack direction="column" gap="0.5rem" m="1rem">
              {addNewDatasetFlag ? (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  textAlign="center"
                  gutterBottom
                >
                  <Trans id="chart-selection-tabs.add-chart-same-dataset.caption">
                    Add chart based on the same dataset
                  </Trans>
                </Typography>
              ) : null}
              <ChartTypeSelector
                state={state}
                type="add"
                showHelp={false}
                showComparisonCharts={false}
                chartKey={tabsState.activeChartKey ?? chartConfig.key}
                sx={{ width: 320, px: 3, pb: 3 }}
              />
            </Stack>
            {addNewDatasetFlag ? (
              <Stack direction="column" gap="0.5rem" mx="1.5rem" my="1rem">
                <Typography
                  variant="body2"
                  color="text.secondary"
                  textAlign="center"
                  gutterBottom
                >
                  <Trans id="chart-selection-tabs.add-chart-different-dataset.caption">
                    Add chart based on a different dataset
                  </Trans>
                </Typography>
                <Button
                  fullWidth
                  sx={{ justifyContent: "center" }}
                  onClick={() => {
                    setTabsState({ ...tabsState, popoverOpen: false });
                    openAddDatasetPanel();
                  }}
                >
                  <Trans id="chart-selection-tabs.add-chart-different-dataset.button">
                    Select dataset
                  </Trans>
                </Button>
              </Stack>
            ) : null}
          </Stack>
        </Popover>
      ) : null}

      {tabsState.popoverType === "edit" ? (
        <ArrowMenuTopCenter
          id="chart-selection-popover"
          open={tabsState.popoverOpen}
          anchorEl={popoverAnchorEl}
          anchorOrigin={{
            horizontal: "center",
            vertical: "bottom",
          }}
          transformOrigin={{
            horizontal: "center",
            vertical: "top",
          }}
          onClose={handleClose}
        >
          <DuplicateChartMenuActionItem
            chartConfig={getChartConfig(state, tabsState.activeChartKey)}
            onSuccess={handleClose}
          />

          {state.chartConfigs.length > 1 && (
            <MenuActionItem
              as="menuitem"
              type="button"
              iconName="trash"
              label={<Trans id="chart-controls.delete">Delete</Trans>}
              color="error"
              requireConfirmation
              confirmationTitle={t({
                id: "chat-preview.delete.title",
                message: "Delete chart?",
              })}
              confirmationText={t({
                id: "chat-preview.delete.confirmation",
                message: "Are you sure you want to delete this chart?",
              })}
              onClick={() => {
                dispatch({
                  type: "CHART_CONFIG_REMOVE",
                  value: {
                    chartKey: tabsState.activeChartKey,
                  },
                });
                handleClose();
              }}
            />
          )}
        </ArrowMenuTopCenter>
      ) : null}
    </>
  );
};

type TabDatum = {
  key: string;
  chartType: ChartType;
  active: boolean;
  label?: string | undefined;
};

const TabsFixed = ({ data }: { data: TabDatum[] }) => {
  const [, dispatch] = useConfiguratorState(isPublished);
  return (
    <TabsInner
      data={data}
      addable={false}
      editable={false}
      draggable={false}
      onChartSwitch={(key) => {
        dispatch({
          type: "SWITCH_ACTIVE_CHART",
          value: key,
        });
      }}
    />
  );
};

/**
 * The Tabs component clones its children adding extra properties, expecting that we use Tab components.
 * Since we either use a Draggable or a div, we must not forward directly the properties.
 * Forwarding the props directly to a DOM node would result in for example "textColor" not being a valid HTML prop.
 */
const PassthroughTab = ({
  children,
  value: _value,
}: {
  children: React.ReactNode;
  value?: string;
}) => {
  return <>{children}</>;
};

const useTabsInnerStyles = makeStyles<Theme>((theme) => ({
  root: {
    display: "flex",
    alignItems: "center",
    gap: 1,
  },
  tab: {
    zIndex: 1,
    maxWidth: "auto",
  },
  tabList: {
    top: 1,
    border: "1px solid",
    borderColor: theme.palette.divider,
    borderTop: 0,
    borderBottom: 0,
    position: "relative",
    "--bg": theme.palette.background.paper,
    "--cut-off-width": "1rem",

    [`& .${tabClasses.root}`]: {
      maxWidth: "max-content",
    },
  },
  scrollButton: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "2.5rem",
    minWidth: "2.5rem",
    padding: 0,
    minHeight: 0,
    color: theme.palette.text.primary,
    "&:hover": {
      backgroundColor: "transparent",
    },
    "& > svg": {
      pointerEvents: "none",
    },
  },
}));

const TabsInner = (props: {
  data: TabDatum[];
  addable: boolean;
  editable: boolean;
  draggable: boolean;
  onChartAdd?: (e: React.MouseEvent<HTMLElement>) => void;
  onChartEdit?: (e: React.MouseEvent<HTMLElement>, key: string) => void;
  onChartSwitch?: (key: string) => void;
}) => {
  const classes = useTabsInnerStyles();
  const {
    data,
    addable,
    editable,
    draggable,
    onChartEdit,
    onChartAdd,
    onChartSwitch,
  } = props;
  const [_, dispatch] = useConfiguratorState(hasChartConfigs);
  const activeTabIndex = data.findIndex((x) => x.active);
  return (
    <div className={classes.root}>
      <TabContext value={`${activeTabIndex}`}>
        <DragDropContext
          onDragEnd={(d) => {
            if (d.destination && d.source.index !== d.destination.index) {
              dispatch({
                type: "CHART_CONFIG_REORDER",
                value: {
                  oldIndex: d.source.index,
                  newIndex: d.destination.index,
                },
              });
            }
          }}
        >
          <Droppable droppableId="droppable" direction="horizontal">
            {(provided) => (
              <VisualizeTabList
                ref={provided.innerRef}
                variant="scrollable"
                className={classes.tabList}
                ScrollButtonComponent={({ direction, disabled, onClick }) => (
                  <Button
                    className={classes.scrollButton}
                    onClick={onClick}
                    style={{ cursor: disabled ? "auto" : "pointer" }}
                    variant="text"
                  >
                    {disabled ? null : (
                      <Icon
                        name={
                          direction === "left" ? "chevronLeft" : "chevronRight"
                        }
                      />
                    )}
                  </Button>
                )}
              >
                {data.map((d, i) => (
                  <PassthroughTab key={d.key} value={`${i}`}>
                    <Draggable draggableId={d.key} index={i}>
                      {(provided, snapshot) => {
                        const { style } = provided.draggableProps;
                        // Limit the drag movement to the x-axis.
                        const transform = style?.transform
                          ? `${style.transform.split(",")[0]}, 0px)`
                          : undefined;
                        return (
                          <VisualizeTab
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{ ...style, transform, opacity: 1 }}
                            component="div"
                            key={d.key}
                            value={`${i}`}
                            className={clsx(
                              classes.tab,
                              // We need to add the "selected" class ourselves since we are wrapping
                              // the tabs by Draggable.
                              i === activeTabIndex ? "Mui-selected" : ""
                            )}
                            sx={{
                              px: 0,
                              minWidth: d.label ? 180 : 0,
                            }}
                            label={
                              <TabContent
                                iconName={getIconName(d.chartType)}
                                chartKey={d.key}
                                editable={editable}
                                draggable={draggable}
                                active={d.active}
                                label={d.label}
                                dragging={snapshot.isDragging}
                                onChevronDownClick={(e) => {
                                  onChartEdit?.(e, d.key);
                                }}
                                onSwitchClick={() => {
                                  onChartSwitch?.(d.key);
                                }}
                              />
                            }
                          />
                        );
                      }}
                    </Draggable>
                  </PassthroughTab>
                ))}
                <PassthroughTab>
                  <div style={{ opacity: 0 }}>{provided.placeholder}</div>
                </PassthroughTab>
              </VisualizeTabList>
            )}
          </Droppable>
        </DragDropContext>
      </TabContext>
      {addable && (
        <Button
          color="primary"
          variant="contained"
          startIcon={<Icon name="add" />}
          onClick={onChartAdd}
          sx={{ minWidth: "fit-content", ml: "0.5rem", px: 3 }}
        >
          <Trans id="chart-selection-tabs.add-chart">Add chart</Trans>
        </Button>
      )}
    </div>
  );
};

export const useIconStyles = makeStyles<
  Theme,
  { active: boolean | undefined; dragging: boolean | undefined }
>(({ palette, spacing }) => ({
  root: {
    "--bg": palette.background.paper,
    backgroundColor: "var(--bg)",
    alignItems: "center",
    padding: spacing(2),
    borderTopLeftRadius: spacing(1),
    borderTopRightRadius: spacing(1),
    cursor: "default",
    textTransform: "none",
    width: "100%",
    justifyContent: "stretch",
  },
  label: {
    flexShrink: 1,
    flexGrow: 1,
    marginLeft: "-0.5rem",
    color: "inherit",
    flexWrap: "nowrap",
    whiteSpace: "nowrap",
    minWidth: 0,
    overflow: "hidden",
    minHeight: "100%",
    position: "relative",
    display: "flex",
    cursor: "pointer",
    alignItems: "center",
    marginRight: "0.15rem",

    "&:after": {
      content: '" "',
      position: "absolute",
      right: 0,
      top: 0,
      bottom: 0,
      height: "auto",
      width: "10px",
      backgroundImage:
        "linear-gradient(to right, rgba(255, 255, 255, 0), var(--bg))",
    },
  },
  chartIconWrapper: {
    minWidth: "fit-content",
    color: (d) => (d.active ? palette.primary.main : palette.secondary.active),
  },
  editIconWrapper: {
    padding: 0,
    minWidth: "fit-content",
    color: palette.secondary.disabled,
    transition: "0.125s ease color",

    "&:hover": {
      background: "transparent",
      color: palette.secondary.hover,
    },
  },
  dragIconWrapper: {
    width: 24,
    height: 24,
    color: palette.grey[500],
    cursor: "grab",

    "&:hover": {
      color: palette.secondary.hover,
    },
  },
}));

const TabContent = (props: {
  iconName: IconName;
  chartKey: string;
  editable?: boolean;
  draggable?: boolean;
  active?: boolean;
  dragging?: boolean;
  label?: string;
  onChevronDownClick?: (
    e: React.MouseEvent<HTMLElement>,
    activeChartKey: string
  ) => void;
  onSwitchClick?: () => void;
}) => {
  const {
    iconName,
    chartKey,
    editable,
    draggable,
    active,
    label,
    dragging,
    onChevronDownClick,
    onSwitchClick,
  } = props;
  const classes = useIconStyles({ active, dragging });
  const [_, dispatch] = useConfiguratorState();
  const showAddLabel = editable && !label;
  const addLabel = t({
    id: "chart-selection-tabs.add-label",
    message: "Add label",
  });
  return (
    <Flex className={classes.root}>
      <Button
        className={classes.chartIconWrapper}
        variant="text"
        onClick={onSwitchClick}
      >
        <Icon name={iconName} />
      </Button>
      {label || showAddLabel ? (
        <Tooltip title={label || addLabel} enterDelay={750}>
          <Button
            variant="text"
            className={classes.label}
            onClick={() => {
              onSwitchClick?.();
              if (editable) {
                dispatch({
                  type: "CHART_ACTIVE_FIELD_CHANGED",
                  value: "label",
                });
              }
            }}
            sx={{
              color: (t) =>
                label ? "inherit" : `${t.palette.grey[500]} !important`,
            }}
          >
            {label || `[ ${addLabel} ]`}
          </Button>
        </Tooltip>
      ) : null}
      {editable && (
        <Button
          variant="text"
          onClick={(e) => onChevronDownClick?.(e, chartKey)}
          className={classes.editIconWrapper}
        >
          <Icon name="chevronDown" />
        </Button>
      )}
      {draggable && <DragHandle dragging={dragging} />}
    </Flex>
  );
};
