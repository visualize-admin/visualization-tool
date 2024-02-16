import { t, Trans } from "@lingui/macro";
import {
  Box,
  BoxProps,
  Button,
  Popover,
  Tab,
  Tabs,
  Theme,
  Tooltip,
  useEventCallback,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { PUBLISHED_STATE } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";

import { extractChartConfigComponentIris } from "@/charts/shared/chart-helpers";
import Flex from "@/components/flex";
import {
  ChartConfig,
  ChartType,
  ConfiguratorStatePublished,
  ConfiguratorStateWithChartConfigs,
  enableLayouting,
  getChartConfig,
  hasChartConfigs,
  isConfiguring,
  isLayouting,
  isPublished,
  isPublishing,
  useConfiguratorState,
} from "@/configurator";
import { ChartTypeSelector } from "@/configurator/components/chart-type-selector";
import { getIconName } from "@/configurator/components/ui-helpers";
import { useUserConfig } from "@/domain/user-configs";
import { useDataCubesComponentsQuery } from "@/graphql/hooks";
import { Icon, IconName } from "@/icons";
import { useLocale } from "@/src";
import { createConfig, updateConfig } from "@/utils/chart-config/api";
import { createChartId } from "@/utils/create-chart-id";
import { getRouterChartId } from "@/utils/router/helpers";
import useEvent from "@/utils/use-event";
import { useMutate } from "@/utils/use-fetch-data";

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
    isConfiguring(state) || isLayouting(state) || isPublishing(state);

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

type TabsEditableProps = {
  state: Exclude<ConfiguratorStateWithChartConfigs, ConfiguratorStatePublished>;
  chartConfig: ChartConfig;
  data: TabDatum[];
};

const TabsEditable = (props: TabsEditableProps) => {
  const { state, chartConfig, data } = props;
  const [, dispatch] = useConfiguratorState();
  const isConfiguringChart = isConfiguring(state);
  const locale = useLocale();
  const [tabsState, setTabsState] = useTabsState();
  const [popoverAnchorEl, setPopoverAnchorEl] =
    React.useState<HTMLElement | null>(null);

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
            state={state}
            type="add"
            chartKey={tabsState.activeChartKey ?? chartConfig.key}
            sx={{ width: 320, px: 3, pb: 3 }}
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

export const LayoutChartButton = () => {
  return (
    <NextStepButton>
      <Trans id="button.layout">Proceed to layout options</Trans>
    </NextStepButton>
  );
};

const SaveAsDraftButton = ({ chartId }: { chartId: string | undefined }) => {
  const { data: config, invalidate: invalidateConfig } = useUserConfig(chartId);
  const session = useSession();

  const [state] = useConfiguratorState();

  const [snack, enqueueSnackbar] = useLocalSnack();
  const { asPath, replace } = useRouter();

  const createConfigMut = useMutate(createConfig);
  const updatePublishedStateMut = useMutate(updateConfig);
  const loggedInId = session.data?.user.id;

  const handleClick = useEventCallback(async () => {
    try {
      if (config?.user_id && loggedInId) {
        const updated = await updatePublishedStateMut.mutate(state, {
          userId: loggedInId,
          published_state: PUBLISHED_STATE.DRAFT,
          key: config.key,
        });

        if (updated) {
          if (asPath !== `/create/${updated.key}`) {
            replace(`/create/new?edit=${updated.key}`);
          }
          enqueueSnackbar({
            message: "Draft updated !",
            variant: "success",
          });
        } else {
          throw new Error("Could not update draft");
        }
      } else if (state) {
        const saved = await createConfigMut.mutate(
          state,
          PUBLISHED_STATE.DRAFT
        );
        if (saved) {
          enqueueSnackbar({
            message: "Draft saved !",
            variant: "success",
          });
          replace(`/create/${saved.key}`);
        } else {
          throw new Error("Could not save draft");
        }
      }
      invalidateConfig();
    } catch (e) {
      enqueueSnackbar({
        message: `Error while saving draft: ${
          e instanceof Error ? e.message : e
        }`,
        variant: "error",
      });
    }
  });

  return (
    <Tooltip
      arrow
      title={snack?.message ?? ""}
      open={!!snack}
      disableFocusListener
      disableHoverListener
      disableTouchListener
    >
      <Button variant="outlined" onClick={handleClick}>
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
  const { data: config, status } = useUserConfig(chartId);
  const editingPublishedChart =
    session.data?.user.id &&
    config?.user_id === session.data.user.id &&
    config.published_state === "PUBLISHED";

  return status === "fetching" && !config ? (
    <>{status}</>
  ) : (
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

const TabsInner = (props: TabsInnerProps) => {
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

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 5,
      }}
    >
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
            <Tabs
              ref={provided.innerRef}
              variant="scrollable"
              value={0}
              scrollButtons={false}
              TabIndicatorProps={{ style: { display: "none" } }}
              sx={{ position: "relative", top: 1 }}
            >
              {data.map((d, i) => (
                <Draggable key={d.key} draggableId={d.key} index={i}>
                  {(provided, snapshot) => {
                    const { style } = provided.draggableProps;
                    // Limit the drag movement to the x-axis.
                    const transform = style?.transform
                      ? `${style.transform.split(",")[0]}, 0px)`
                      : undefined;

                    return (
                      <Tab
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={{ ...style, transform, opacity: 1 }}
                        component="div"
                        key={d.key}
                        sx={{
                          mr: 2,
                          p: 0,
                          background: (theme) => theme.palette.background.paper,
                          border: (theme) =>
                            `1px solid ${theme.palette.divider}`,
                          borderBottom: (theme) =>
                            `1px solid ${
                              d.active ? "transparent" : theme.palette.divider
                            }`,
                          minWidth: "fit-content",
                        }}
                        label={
                          <TabContent
                            iconName={getIconName(d.chartType)}
                            chartKey={d.key}
                            editable={editable}
                            draggable={draggable}
                            active={d.active}
                            dragging={snapshot.isDragging}
                            onEditClick={(e) => {
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
              ))}
              <div style={{ opacity: 0 }}>{provided.placeholder}</div>

              {addable && (
                <Tab
                  component="div"
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
                  label={<TabContent iconName="add" chartKey="" />}
                />
              )}
            </Tabs>
          )}
        </Droppable>
      </DragDropContext>

      {editable &&
        isConfiguring(state) &&
        (enableLayouting(state) ? (
          <LayoutChartButton />
        ) : (
          <Box gap={"1rem"} display="flex">
            <SaveAsDraftButton chartId={chartId} />
            <PublishChartButton chartId={chartId} />
          </Box>
        ))}
    </Box>
  );
};

const useIconStyles = makeStyles<
  Theme,
  { active: boolean | undefined; dragging: boolean | undefined }
>(({ palette, spacing }) => ({
  root: {
    alignItems: "center",
    padding: spacing(2),
    borderTopLeftRadius: spacing(1),
    borderTopRightRadius: spacing(1),
    cursor: "default",
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
    color: (d) =>
      d.dragging ? palette.secondary.active : palette.secondary.disabled,
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
  onEditClick?: (
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
    dragging,
    onEditClick,
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

      {editable && (
        <Button
          variant="text"
          onClick={(e) => {
            onEditClick?.(e, chartKey);
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

type DragHandleProps = BoxProps & {
  dragging?: boolean;
};

export const DragHandle = React.forwardRef<HTMLDivElement, DragHandleProps>(
  (props, ref) => {
    const { dragging, ...rest } = props;
    const classes = useIconStyles({ active: false, dragging });

    return (
      <Box
        ref={ref}
        {...rest}
        className={classes.dragIconWrapper}
        sx={{
          color: dragging ? "secondary.active" : "secondary.disabled",
        }}
      >
        <Icon name="dragndrop" />
      </Box>
    );
  }
);
