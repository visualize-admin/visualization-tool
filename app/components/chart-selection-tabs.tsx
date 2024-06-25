import { t, Trans } from "@lingui/macro";
import { TabContext } from "@mui/lab";
import {
  Box,
  Button,
  Divider,
  Grow,
  Popover,
  Stack,
  tabClasses,
  Theme,
  Tooltip,
  Typography,
  useEventCallback,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { PUBLISHED_STATE } from "@prisma/client";
import clsx from "clsx";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { createContext, useContext, useEffect, useState } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { useClient } from "urql";
import { useDebounce } from "use-debounce";

import { extractChartConfigComponentIris } from "@/charts/shared/chart-helpers";
import { ArrowMenu } from "@/components/arrow-menu";
import { DuplicateChartMenuActionItem } from "@/components/chart-shared";
import Flex from "@/components/flex";
import { MenuActionItem } from "@/components/menu-action-item";
import { VisualizeTab, VisualizeTabList } from "@/components/tabs";
import {
  ChartConfig,
  ChartType,
  ConfiguratorStatePublished,
  ConfiguratorStateWithChartConfigs,
  enableLayouting,
  getChartConfig,
  hasChartConfigs,
  initChartStateFromChartEdit,
  isConfiguring,
  isLayouting,
  isPublished,
  isPublishing,
  saveChartLocally,
  useConfiguratorState,
} from "@/configurator";
import { useSearchDatasetPanelStore } from "@/configurator/components/add-new-dataset-panel";
import { ChartTypeSelector } from "@/configurator/components/chart-type-selector";
import { getIconName } from "@/configurator/components/ui-helpers";
import { useUserConfig } from "@/domain/user-configs";
import { useFlag } from "@/flags";
import { useDataCubesComponentsQuery } from "@/graphql/hooks";
import { Icon, IconName } from "@/icons";
import { defaultLocale, useLocale } from "@/locales";
import { createConfig, updateConfig } from "@/utils/chart-config/api";
import { getRouterChartId } from "@/utils/router/helpers";
import { replaceLinks } from "@/utils/ui-strings";
import useEvent from "@/utils/use-event";
import { useMutate } from "@/utils/use-fetch-data";

import { DragHandle } from "./drag-handle";
import { useLocalSnack } from "./use-local-snack";

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
  const data: TabDatum[] = state.chartConfigs.map((d) => {
    return {
      key: d.key,
      chartType: d.chartType,
      active: d.key === chartConfig.key,
      label:
        d.meta.title[locale] !== ""
          ? d.meta.title[locale]
          : d.meta.title[defaultLocale] !== ""
            ? d.meta.title[defaultLocale]
            : undefined,
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
        <ArrowMenu
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
        </ArrowMenu>
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

type TabsFixedProps = {
  data: TabDatum[];
};

const TabsFixed = (props: TabsFixedProps) => {
  const { data } = props;
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

const NextStepButton = (props: React.PropsWithChildren<{}>) => {
  const { children } = props;
  const locale = useLocale();
  const [state, dispatch] = useConfiguratorState(hasChartConfigs);
  const chartConfig = getChartConfig(state);
  const componentIris = extractChartConfigComponentIris(chartConfig);
  const [{ data: components }] = useDataCubesComponentsQuery({
    variables: {
      sourceType: state.dataSource.type,
      sourceUrl: state.dataSource.url,
      locale,
      cubeFilters: chartConfig.cubes.map((cube) => ({
        iri: cube.iri,
        componentIris,
        filters: cube.filters,
        joinBy: cube.joinBy,
        loadValues: true,
      })),
    },
  });
  const handleClick = useEvent(() => {
    if (components?.dataCubesComponents) {
      dispatch({
        type: "STEP_NEXT",
        dataCubesComponents: components.dataCubesComponents,
      });
    }
  });

  return (
    <Button
      color="primary"
      variant="contained"
      onClick={handleClick}
      sx={{ minWidth: "fit-content" }}
    >
      {children}
    </Button>
  );
};

const LayoutChartButton = () => {
  return (
    <NextStepButton>
      <Trans id="button.layout">Proceed to layout options</Trans>
    </NextStepButton>
  );
};

export const SaveDraftButton = ({
  chartId,
}: {
  chartId: string | undefined;
}) => {
  const { data: config, invalidate: invalidateConfig } = useUserConfig(chartId);
  const session = useSession();
  const client = useClient();

  const [state, dispatch] = useConfiguratorState();

  const [snack, enqueueSnackbar, dismissSnack] = useLocalSnack();
  const [debouncedSnack] = useDebounce(snack, 500);
  const { asPath, replace } = useRouter();

  const createConfigMut = useMutate(createConfig);
  const updatePublishedStateMut = useMutate(updateConfig);
  const loggedInId = session.data?.user.id;

  const handleClick = useEventCallback(async () => {
    try {
      if (config?.user_id && loggedInId) {
        const updated = await updatePublishedStateMut.mutate({
          data: state,
          published_state: PUBLISHED_STATE.DRAFT,
          key: config.key,
        });

        if (updated) {
          if (asPath !== `/create/${updated.key}`) {
            replace(`/create/new?edit=${updated.key}`);
          }
        } else {
          throw new Error("Could not update draft");
        }
      } else if (state) {
        const saved = await createConfigMut.mutate({
          data: state,
          user_id: loggedInId,
          published_state: PUBLISHED_STATE.DRAFT,
        });
        if (saved) {
          const config = await initChartStateFromChartEdit(
            client,
            saved.key,
            state.state
          );

          if (!config) {
            return;
          }

          dispatch({ type: "INITIALIZED", value: config });
          saveChartLocally(saved.key, config);
          replace(`/create/${saved.key}`, undefined, {
            shallow: true,
          });
        } else {
          throw new Error("Could not save draft");
        }
      }

      enqueueSnackbar({
        message: (
          <>
            {replaceLinks(
              t({
                id: "button.save-draft.saved",
                message: "Draft saved in [My visualisations](/profile)",
              }),
              (label, href) => {
                return (
                  <div>
                    <Link href={href}>{label}</Link>
                  </div>
                );
              }
            )}
          </>
        ),
        variant: "success",
      });

      invalidateConfig();
    } catch (e) {
      console.log(
        `Error while saving draft: ${e instanceof Error ? e.message : e}`
      );
      enqueueSnackbar({
        message: t({
          id: "button.save-draft.error",
          message: "Could not save draft",
        }),
        variant: "error",
      });
    }

    setTimeout(() => {
      updatePublishedStateMut.reset();
      createConfigMut.reset();
    }, 2000);
  });

  const hasUpdated = !!(updatePublishedStateMut.data || createConfigMut.data);
  const [debouncedHasUpdated] = useDebounce(hasUpdated, 300);

  if (!loggedInId) {
    return null;
  }

  return (
    <Tooltip
      arrow
      title={debouncedSnack?.message ?? ""}
      open={!!snack}
      disableFocusListener
      disableHoverListener
      disableTouchListener
      onClose={() => dismissSnack()}
    >
      <Button
        endIcon={
          hasUpdated || debouncedHasUpdated ? (
            <Grow in={hasUpdated}>
              <span>
                <Icon name="check" />
              </span>
            </Grow>
          ) : null
        }
        variant="outlined"
        onClick={handleClick}
      >
        <Trans id="button.save-draft">Save draft</Trans>
      </Button>
    </Tooltip>
  );
};

export const PublishChartButton = ({
  chartId,
}: {
  chartId: string | undefined;
}) => {
  const session = useSession();
  const { data: config } = useUserConfig(chartId);
  const editingPublishedChart =
    session.data?.user.id &&
    config?.user_id === session.data.user.id &&
    config.published_state === "PUBLISHED";

  return (
    <NextStepButton>
      {editingPublishedChart ? (
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Tooltip
            title={t({
              id: "button.update.warning",
              message:
                "Keep in mind that updating this visualization will affect all the places where it might be already embedded!",
            })}
          >
            <div>
              <Icon name="hintWarning" />
            </div>
          </Tooltip>
          <Trans id="button.update">Update this visualization</Trans>
        </Box>
      ) : (
        <Trans id="button.publish">Publish</Trans>
      )}
    </NextStepButton>
  );
};

type TabsInnerProps = {
  data: TabDatum[];
  addable: boolean;
  editable: boolean;
  draggable: boolean;
  onChartAdd?: (e: React.MouseEvent<HTMLElement>) => void;
  onChartEdit?: (e: React.MouseEvent<HTMLElement>, key: string) => void;
  onChartSwitch?: (key: string) => void;
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
    justifyContent: "space-between",
    gap: 1,
  },
  tab: {
    zIndex: 1,
    maxWidth: "auto",
    "&:first-child": {
      // We need to add a negative margin to the first tab so that its left margin
      // goes "under" the border of the tab list.
      marginLeft: -1,
    },
  },
  // :last-child does not work when the tabs are not scrollable
  // MUI seems to add an empty element at the end, thus we cannot use :last-child
  lastTab: {
    // We need to add a negative margin to the last tab so that its right margin
    // goes "under" the border of the tab list.
    marginRight: -1,
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

    "&:before, &:after": {
      top: 1,
      content: '""',
      bottom: 1,
      position: "absolute",
      width: "var(--cut-off-width)",
      zIndex: 10,
    },
    "&:before": {
      borderBottom: 0,
      left: 0,
      right: "auto",
      backgroundImage: "linear-gradient(to left, transparent, var(--bg))",
    },
    "&:after": {
      left: "auto",
      right: 0,
      backgroundImage: "linear-gradient(to right, transparent, var(--bg))",
    },
  },
}));

const TabsInner = (props: TabsInnerProps) => {
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
  const [state, dispatch] = useConfiguratorState(hasChartConfigs);

  const { asPath } = useRouter();
  const chartId = getRouterChartId(asPath);

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
                scrollButtons={false}
                className={classes.tabList}
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
                              i === activeTabIndex ? "Mui-selected" : "",
                              i === data.length - 1 ? classes.lastTab : ""
                            )}
                            sx={{
                              px: 0,
                              flexShrink: 1,
                              minWidth: d.label ? 180 : 0,
                              flexBasis: "100%",
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
        <VisualizeTab
          component="div"
          className={classes.tab}
          sx={{
            px: 0,
            pt: "2px",
            top: 1,
            margin: "0 1rem",
            height: "100%",
            border: "1px solid",
            borderColor: "divider",
            minWidth: "fit-content",
          }}
          onClick={onChartAdd}
          label={<TabContent iconName="add" chartKey="" />}
        />
      )}
      <Box flexGrow={1} />
      <Box gap="0.5rem" display="flex" flexShrink={0}>
        {isConfiguring(state) ? <SaveDraftButton chartId={chartId} /> : null}
        {editable &&
          isConfiguring(state) &&
          (enableLayouting(state) ? (
            <LayoutChartButton />
          ) : (
            <PublishChartButton chartId={chartId} />
          ))}
      </Box>
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

type TabContentProps = {
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
};

const TabContent = (props: TabContentProps) => {
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

  return (
    <Flex className={classes.root}>
      <Button
        className={classes.chartIconWrapper}
        variant="text"
        onClick={onSwitchClick}
      >
        <Icon name={iconName} />
      </Button>

      {label ? (
        <Tooltip title={label} enterDelay={750}>
          <Button
            variant="text"
            color="primary"
            className={classes.label}
            onClick={onSwitchClick}
          >
            {label}
          </Button>
        </Tooltip>
      ) : null}
      {editable && (
        <Button
          variant="text"
          onClick={(e) => {
            onChevronDownClick?.(e, chartKey);
          }}
          className={classes.editIconWrapper}
        >
          <Icon name="chevronDown" />
        </Button>
      )}

      {draggable && <DragHandle dragging={dragging} />}
    </Flex>
  );
};
