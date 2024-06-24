import {
  DndContext,
  DragOverlay,
  Over,
  pointerWithin,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import { Trans, t } from "@lingui/macro";
import { Box, IconButton, useEventCallback } from "@mui/material";
import { makeStyles } from "@mui/styles";
import Head from "next/head";
import React, {
  ReactNode,
  forwardRef,
  useCallback,
  useMemo,
  useState,
} from "react";

import { DataSetTable } from "@/browse/datatable";
import { LoadingStateProvider } from "@/charts/shared/chart-loading-state";
import { ArrowMenu } from "@/components/arrow-menu";
import { ChartErrorBoundary } from "@/components/chart-error-boundary";
import { ChartFootnotes } from "@/components/chart-footnotes";
import {
  ChartPanelLayout,
  ChartWrapper,
  ChartWrapperProps,
} from "@/components/chart-panel";
import { chartPanelLayoutGridClasses } from "@/components/chart-panel-layout-grid";
import { ChartControls } from "@/components/chart-shared";
import {
  ChartTablePreviewProvider,
  useChartTablePreview,
} from "@/components/chart-table-preview";
import { useChartStyles } from "@/components/chart-utils";
import { ChartWithFilters } from "@/components/chart-with-filters";
import { DashboardInteractiveFilters } from "@/components/dashboard-interactive-filters";
import DebugPanel from "@/components/debug-panel";
import { DragHandle, DragHandleProps } from "@/components/drag-handle";
import Flex from "@/components/flex";
import { Checkbox } from "@/components/form";
import { HintYellow } from "@/components/hint";
import { MenuActionItem } from "@/components/menu-action-item";
import { BANNER_MARGIN_TOP } from "@/components/presence";
import {
  ChartConfig,
  DataSource,
  Layout,
  getChartConfig,
  hasChartConfigs,
  isConfiguring,
  useConfiguratorState,
} from "@/configurator";
import { Description, Title } from "@/configurator/components/annotators";
import {
  useDataCubesComponentsQuery,
  useDataCubesMetadataQuery,
} from "@/graphql/hooks";
import { DataCubePublicationStatus } from "@/graphql/resolver-types";
import SvgIcMore from "@/icons/components/IcMore";
import { useLocale } from "@/locales/use-locale";
import { InteractiveFiltersChartProvider } from "@/stores/interactive-filters";
import { useTransitionStore } from "@/stores/transition";
import { useTheme } from "@/themes";
import { createSnapCornerToCursor } from "@/utils/dnd";
import useEvent from "@/utils/use-event";

type ChartPreviewProps = {
  dataSource: DataSource;
};

export const ChartPreview = (props: ChartPreviewProps) => {
  const { dataSource } = props;
  const [state] = useConfiguratorState(hasChartConfigs);
  const editing = isConfiguring(state);
  const { layout } = state;

  return layout.type === "dashboard" && !editing ? (
    <DashboardPreview dataSource={dataSource} layoutType={layout.layout} />
  ) : layout.type === "singleURLs" && !editing ? (
    <SingleURLsPreview dataSource={dataSource} layout={layout} />
  ) : (
    // Important to keep the key here to force re-rendering of the chart when
    // we switch tabs in the configurator, otherwise we end up with the wrong
    // data in the downstream hooks (useDataCubesMetadataQuery, etc.)
    <>
      {state.state !== "CONFIGURING_CHART" ? (
        <DashboardInteractiveFilters
          key={state.chartConfigs.map((x) => x.key).join(",")}
        />
      ) : null}
      <ChartTablePreviewProvider key={state.activeChartKey}>
        <ChartWrapper editing={editing} layoutType={layout.type}>
          <ChartPreviewInner dataSource={dataSource} />
        </ChartWrapper>
      </ChartTablePreviewProvider>
    </>
  );
};

const DRAG_OVERLAY_WIDTH = 400;
const snapCornerToCursor = createSnapCornerToCursor({
  xOffset: -DRAG_OVERLAY_WIDTH,
});

type DashboardPreviewProps = ChartPreviewProps & {
  layoutType: Extract<Layout, { type: "dashboard" }>["layout"];
  editing?: boolean;
};

const useStyles = makeStyles(() => ({
  canvasChartPanelLayout: {
    // Provide some space at the bottom of the canvas layout to make it possible
    // to resize vertically the last charts
    marginBottom: "10rem",
  },
}));

const DashboardPreview = (props: DashboardPreviewProps) => {
  const { dataSource, layoutType, editing } = props;
  const [state, dispatch] = useConfiguratorState(hasChartConfigs);
  const theme = useTheme();
  const transition = useTransitionStore();
  const [isDragging, setIsDragging] = useState(false);
  const [activeChartKey, setActiveChartKey] = useState<string | null>(null);
  const [over, setOver] = useState<Over | null>(null);
  const classes = useStyles();
  const renderChart = useCallback(
    (chartConfig: ChartConfig) => {
      return layoutType === "canvas" ? (
        <ReactGridChartPreview
          key={chartConfig.key}
          chartKey={chartConfig.key}
          dataSource={dataSource}
          layoutType={state.layout.type}
          editing={editing}
        />
      ) : (
        <DndChartPreview
          key={chartConfig.key}
          chartKey={chartConfig.key}
          dataSource={dataSource}
          layoutType={state.layout.type}
          editing={editing}
        />
      );
    },
    [dataSource, editing, layoutType, state.layout.type]
  );

  if (layoutType === "canvas") {
    return (
      <ChartPanelLayout
        chartConfigs={state.chartConfigs}
        renderChart={renderChart}
        layoutType={layoutType}
        className={classes.canvasChartPanelLayout}
      />
    );
  }

  return (
    <DndContext
      autoScroll={{ layoutShiftCompensation: false }}
      collisionDetection={pointerWithin}
      onDragStart={(e) => {
        transition.setEnable(false);
        setIsDragging(true);
        setActiveChartKey(`${e.active.id}`);
      }}
      onDragMove={(e) => {
        if (e.over?.id !== over?.id && e.over?.id !== activeChartKey) {
          setOver(e.over);
        }
      }}
      onDragEnd={(e) => {
        transition.setEnable(true);
        setIsDragging(false);
        setActiveChartKey(null);
        setOver(null);

        const { active, over } = e;

        if (!active || !over) {
          return;
        }

        dispatch({
          type: "CHART_CONFIG_SWAP",
          value: {
            oldIndex: state.chartConfigs.findIndex((c) => c.key === active.id),
            newIndex: state.chartConfigs.findIndex((c) => c.key === over.id),
          },
        });
      }}
    >
      <ChartPanelLayout
        chartConfigs={state.chartConfigs}
        renderChart={renderChart}
        layoutType={layoutType}
      />
      {isDragging && (
        <DragOverlay
          zIndex={1000}
          modifiers={[snapCornerToCursor]}
          style={{
            opacity: over ? 0.8 : 1,
            width: DRAG_OVERLAY_WIDTH,
            height: "fit-content",
            border: `2px solid ${
              over ? theme.palette.primary.main : "transparent"
            }`,
            cursor: "grabbing",
          }}
        >
          <ChartWrapper>
            <ChartPreviewInner
              dataSource={dataSource}
              chartKey={activeChartKey}
              actionElementSlot={<DragHandle dragging />}
            />
          </ChartWrapper>
        </DragOverlay>
      )}
    </DndContext>
  );
};

type CommonChartPreviewProps = ChartWrapperProps & {
  chartKey: string;
  dataSource: DataSource;
};

const ChartPreviewChartMoreButton = ({ chartKey }: { chartKey: string }) => {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const handleClose = useEventCallback(() => setAnchor(null));
  const [state, dispatch] = useConfiguratorState(hasChartConfigs);
  return (
    <>
      <IconButton onClick={(ev) => setAnchor(ev.currentTarget)}>
        <SvgIcMore />
      </IconButton>
      <ArrowMenu
        open={!!anchor}
        anchorEl={anchor}
        onClose={handleClose}
        anchorOrigin={{ horizontal: "center", vertical: "bottom" }}
        transformOrigin={{ horizontal: "center", vertical: "top" }}
      >
        <MenuActionItem
          type="button"
          as="menuitem"
          onClick={() => {
            dispatch({ type: "CONFIGURE_CHART", value: { chartKey } });
            handleClose();
          }}
          iconName="edit"
          label={<Trans id="chart-controls.edit">Edit</Trans>}
        />
        {state.chartConfigs.length > 1 ? (
          <MenuActionItem
            type="button"
            as="menuitem"
            color="error"
            requireConfirmation
            confirmationTitle={t({
              id: "chart-controls.delete.title",
              message: "Delete chart?",
            })}
            confirmationText={t({
              id: "chart-controls.delete.confirmation",
              message: "Are you sure you want to delete this chart?",
            })}
            onClick={() => {
              dispatch({ type: "CHART_CONFIG_REMOVE", value: { chartKey } });
              handleClose();
            }}
            iconName="trash"
            label={<Trans id="chart-controls.delete">Delete</Trans>}
          />
        ) : null}
      </ArrowMenu>
    </>
  );
};

const ChartTopRightControls = ({
  chartKey,
  dragHandleProps,
}: {
  chartKey: string;
  dragHandleProps?: DragHandleProps;
}) => {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: "-0.5rem" }}>
      <ChartPreviewChartMoreButton chartKey={chartKey} />
      <DragHandle
        dragging
        className={chartPanelLayoutGridClasses.dragHandle}
        {...dragHandleProps}
      />
    </Box>
  );
};

const ReactGridChartPreview = forwardRef<
  HTMLDivElement,
  CommonChartPreviewProps
>((props, ref) => {
  const { children, chartKey, dataSource, ...rest } = props;
  return (
    <ChartTablePreviewProvider>
      <ChartWrapper {...rest} ref={ref}>
        <ChartPreviewInner
          dataSource={dataSource}
          chartKey={chartKey}
          actionElementSlot={<ChartTopRightControls chartKey={chartKey} />}
        >
          {children}
        </ChartPreviewInner>
      </ChartWrapper>
    </ChartTablePreviewProvider>
  );
});

const DndChartPreview = (props: CommonChartPreviewProps) => {
  const { children, chartKey, dataSource, ...rest } = props;
  const theme = useTheme();
  const {
    setActivatorNodeRef,
    setNodeRef: setDraggableNodeRef,
    attributes,
    listeners,
    isDragging,
  } = useDraggable({ id: chartKey });

  const {
    setNodeRef: setDroppableNodeRef,
    isOver,
    active,
  } = useDroppable({ id: chartKey });

  const setRef = useCallback(
    (node: HTMLElement | null) => {
      setDraggableNodeRef(node);
      setDroppableNodeRef(node);
    },
    [setDraggableNodeRef, setDroppableNodeRef]
  );

  return (
    <ChartTablePreviewProvider>
      <ChartWrapper
        {...rest}
        ref={setRef}
        {...attributes}
        style={{
          display: active ? "flex" : "contents",
          opacity: isDragging ? 0.2 : isOver ? 0.8 : 1,
          outline: `2px solid ${
            isOver && !isDragging ? theme.palette.primary.main : "transparent"
          }`,
          pointerEvents: active ? "none" : "auto",
        }}
      >
        <ChartPreviewInner
          dataSource={dataSource}
          chartKey={chartKey}
          actionElementSlot={
            <ChartTopRightControls
              chartKey={chartKey}
              dragHandleProps={{
                ...listeners,
                ref: setActivatorNodeRef,
                dragging: isDragging,
              }}
            />
          }
        />
      </ChartWrapper>
    </ChartTablePreviewProvider>
  );
};

type SingleURLsPreviewProps = ChartPreviewProps & {
  layout: Extract<Layout, { type: "singleURLs" }>;
};

const SingleURLsPreview = (props: SingleURLsPreviewProps) => {
  const { dataSource, layout } = props;
  const [state, dispatch] = useConfiguratorState(hasChartConfigs);
  const renderChart = useCallback(
    (chartConfig: ChartConfig) => {
      const checked = layout.publishableChartKeys.includes(chartConfig.key);
      const { publishableChartKeys: keys } = layout;
      const { key } = chartConfig;

      return (
        <ChartTablePreviewProvider>
          <ChartWrapper>
            <ChartPreviewInner
              dataSource={dataSource}
              chartKey={chartConfig.key}
              actionElementSlot={
                <>
                  <ChartPreviewChartMoreButton chartKey={key} />
                  <Checkbox
                    checked={checked}
                    disabled={keys.length === 1 && checked}
                    onChange={() => {
                      dispatch({
                        type: "LAYOUT_CHANGED",
                        value: {
                          ...layout,
                          publishableChartKeys: checked
                            ? keys.filter((k) => k !== key)
                            : state.chartConfigs
                                .map((c) => c.key)
                                .filter((k) => keys.includes(k) || k === key),
                        },
                      });
                    }}
                    label=""
                  />
                </>
              }
            />
          </ChartWrapper>
        </ChartTablePreviewProvider>
      );
    },
    [dataSource, dispatch, layout, state.chartConfigs]
  );

  return (
    <ChartPanelLayout
      layoutType="vertical"
      chartConfigs={state.chartConfigs}
      renderChart={renderChart}
    />
  );
};

type ChartPreviewInnerProps = ChartPreviewProps & {
  chartKey?: string | null;
  actionElementSlot?: ReactNode;
  children?: React.ReactNode;
};

const ChartPreviewInner = (props: ChartPreviewInnerProps) => {
  const { dataSource, chartKey, actionElementSlot } = props;
  const [state, dispatch] = useConfiguratorState();
  const configuring = isConfiguring(state);
  const chartConfig = getChartConfig(state, chartKey);
  const locale = useLocale();
  const chartClasses = useChartStyles();
  const commonQueryVariables = {
    sourceType: dataSource.type,
    sourceUrl: dataSource.url,
    locale,
  };
  const [{ data: metadata }] = useDataCubesMetadataQuery({
    variables: {
      ...commonQueryVariables,
      cubeFilters: chartConfig.cubes.map((cube) => ({ iri: cube.iri })),
    },
  });
  const componentIris = undefined;
  const [{ data: components }] = useDataCubesComponentsQuery({
    variables: {
      ...commonQueryVariables,
      cubeFilters: chartConfig.cubes.map((cube) => ({
        iri: cube.iri,
        componentIris,
        filters: cube.filters,
        joinBy: cube.joinBy,
      })),
    },
  });
  const {
    state: isTablePreview,
    setState: setIsTablePreview,
    containerRef,
    containerHeight,
  } = useChartTablePreview();
  const handleToggleTableView = useEvent(() => setIsTablePreview((c) => !c));
  const dimensions = components?.dataCubesComponents.dimensions;
  const measures = components?.dataCubesComponents.measures;
  const allComponents = useMemo(() => {
    if (!dimensions || !measures) {
      return [];
    }

    return [...dimensions, ...measures];
  }, [dimensions, measures]);

  return (
    <Box className={chartClasses.root}>
      {props.children}
      <ChartErrorBoundary resetKeys={[state]}>
        <div>
          {metadata?.dataCubesMetadata.some(
            (d) => d.publicationStatus === DataCubePublicationStatus.Draft
          ) && (
            <Box sx={{ mb: 4 }}>
              <HintYellow iconName="datasetError" iconSize={64}>
                <Trans id="dataset.publicationStatus.draft.warning">
                  Careful, this dataset is only a draft.
                  <br />
                  <strong>Don&apos;t use for reporting!</strong>
                </Trans>
              </HintYellow>
            </Box>
          )}
        </div>
        {hasChartConfigs(state) && (
          <>
            <Head>
              <title key="title">
                {!chartConfig.meta.title[locale]
                  ? // FIXME: adapt to design
                    metadata?.dataCubesMetadata.map((d) => d.title).join(", ")
                  : chartConfig.meta.title[locale]}{" "}
                - visualize.admin.ch
              </title>
            </Head>
            <LoadingStateProvider>
              <InteractiveFiltersChartProvider chartConfigKey={chartConfig.key}>
                <Flex
                  sx={{
                    justifyContent:
                      configuring || chartConfig.meta.title[locale]
                        ? "space-between"
                        : "flex-end",
                    alignItems: "flex-start",
                    gap: 2,
                  }}
                >
                  {configuring || chartConfig.meta.title[locale] ? (
                    <Title
                      text={chartConfig.meta.title[locale]}
                      lighterColor
                      onClick={
                        configuring
                          ? () =>
                              dispatch({
                                type: "CHART_ACTIVE_FIELD_CHANGED",
                                value: "title",
                              })
                          : undefined
                      }
                    />
                  ) : (
                    // We need to have a span here to keep the space between the
                    // title and the chart (subgrid layout)
                    <span />
                  )}
                  {actionElementSlot}
                </Flex>
                {configuring || chartConfig.meta.description[locale] ? (
                  <Description
                    text={chartConfig.meta.description[locale]}
                    lighterColor
                    onClick={
                      configuring
                        ? () => {
                            dispatch({
                              type: "CHART_ACTIVE_FIELD_CHANGED",
                              value: "description",
                            });
                          }
                        : undefined
                    }
                  />
                ) : (
                  // We need to have a span here to keep the space between the
                  // title and the chart (subgrid layout)
                  <span />
                )}
                <ChartControls
                  dataSource={dataSource}
                  chartConfig={chartConfig}
                  metadataPanelProps={{
                    dimensions: allComponents,
                    top: BANNER_MARGIN_TOP,
                  }}
                />
                <div
                  ref={containerRef}
                  style={{
                    minWidth: 0,
                    height: containerHeight.current,
                    paddingTop: 16,
                    flexGrow: 1,
                  }}
                >
                  {isTablePreview ? (
                    <DataSetTable
                      dataSource={dataSource}
                      chartConfig={chartConfig}
                      sx={{ width: "100%", maxHeight: "100%" }}
                    />
                  ) : (
                    <ChartWithFilters
                      dataSource={dataSource}
                      componentIris={componentIris}
                      chartConfig={chartConfig}
                    />
                  )}
                </div>
                <ChartFootnotes
                  dataSource={dataSource}
                  chartConfig={chartConfig}
                  onToggleTableView={handleToggleTableView}
                  dimensions={dimensions}
                />
                {/* Wrap in div for subgrid layout */}
                <div className="debug-panel">
                  <DebugPanel configurator interactiveFilters />
                </div>
              </InteractiveFiltersChartProvider>
            </LoadingStateProvider>
          </>
        )}
      </ChartErrorBoundary>
    </Box>
  );
};
