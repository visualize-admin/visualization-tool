import {
  DndContext,
  DragOverlay,
  Over,
  pointerWithin,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import { Trans } from "@lingui/macro";
import { Box } from "@mui/material";
import { makeStyles } from "@mui/styles";
import Head from "next/head";
import {
  forwardRef,
  ReactNode,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";

import { DataSetTable } from "@/browse/datatable";
import { LoadingStateProvider } from "@/charts/shared/chart-loading-state";
import { ActionElementsContainer } from "@/components/action-elements-container";
import { ChartErrorBoundary } from "@/components/chart-error-boundary";
import { ChartFootnotes } from "@/components/chart-footnotes";
import {
  ChartPanelLayout,
  ChartWrapper,
  ChartWrapperProps,
} from "@/components/chart-panel";
import {
  ChartControls,
  ChartMoreButton,
  useChartStyles,
} from "@/components/chart-shared";
import {
  ChartTablePreviewProvider,
  TablePreviewWrapper,
  useChartTablePreview,
} from "@/components/chart-table-preview";
import { ChartWithFilters } from "@/components/chart-with-filters";
import { DashboardInteractiveFilters } from "@/components/dashboard-interactive-filters";
import DebugPanel from "@/components/debug-panel";
import { DragHandle } from "@/components/drag-handle";
import Flex from "@/components/flex";
import { Checkbox } from "@/components/form";
import { HintYellow } from "@/components/hint";
import {
  createMetadataPanelStore,
  MetadataPanelStoreContext,
} from "@/components/metadata-panel-store";
import { BANNER_MARGIN_TOP } from "@/components/presence";
import { getChartConfig } from "@/config-utils";
import {
  ChartConfig,
  DataSource,
  hasChartConfigs,
  isConfiguring,
  Layout,
  useConfiguratorState,
} from "@/configurator";
import { Description, Title } from "@/configurator/components/annotators";
import {
  useDataCubesComponentsQuery,
  useDataCubesMetadataQuery,
} from "@/graphql/hooks";
import { DataCubePublicationStatus } from "@/graphql/resolver-types";
import { useLocale } from "@/locales/use-locale";
import { InteractiveFiltersChartProvider } from "@/stores/interactive-filters";
import { useTransitionStore } from "@/stores/transition";
import { useTheme } from "@/themes";
import { createSnapCornerToCursor } from "@/utils/dnd";
import { DISABLE_SCREENSHOT_ATTR_KEY } from "@/utils/use-screenshot";

export const ChartPreview = ({ dataSource }: { dataSource: DataSource }) => {
  const [state] = useConfiguratorState(hasChartConfigs);
  const editing = isConfiguring(state);
  const { layout } = state;
  const metadataPanelStore = useMemo(() => {
    return createMetadataPanelStore();
  }, []);

  return (
    <MetadataPanelStoreContext.Provider value={metadataPanelStore}>
      {layout.type === "dashboard" && !editing ? (
        <DashboardPreview dataSource={dataSource} layoutType={layout.layout} />
      ) : layout.type === "singleURLs" && !editing ? (
        <SingleURLsPreview dataSource={dataSource} layout={layout} />
      ) : (
        // Important to keep the key here to force re-rendering of the chart when
        // we switch tabs in the configurator, otherwise we end up with the wrong
        // data in the downstream hooks (useDataCubesMetadataQuery, etc.)
        <>
          {!isConfiguring(state) ? (
            <DashboardInteractiveFilters
              key={state.chartConfigs.map((x) => x.key).join(",")}
              sx={{ mb: 4 }}
            />
          ) : null}
          <ChartTablePreviewProvider key={state.activeChartKey}>
            <ChartWrapper
              editing={editing}
              layoutType={layout.type}
              chartKey={state.activeChartKey}
            >
              <ChartPreviewInner dataSource={dataSource} />
            </ChartWrapper>
          </ChartTablePreviewProvider>
        </>
      )}
    </MetadataPanelStoreContext.Provider>
  );
};

const DRAG_OVERLAY_WIDTH = 400;
const snapCornerToCursor = createSnapCornerToCursor({
  xOffset: -DRAG_OVERLAY_WIDTH,
});

const useStyles = makeStyles(() => ({
  canvasChartPanelLayout: {
    // Provide some space at the bottom of the canvas layout to make it possible
    // to resize vertically the last charts
    paddingBottom: "10rem",
  },
}));

const DashboardPreview = ({
  dataSource,
  layoutType,
  editing,
}: {
  dataSource: DataSource;
  layoutType: Extract<Layout, { type: "dashboard" }>["layout"];
  editing?: boolean;
}) => {
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
      // Force re-rendering of the canvas layout when the chart configs change
      // to properly initialize the height of the new charts
      <div key={state.chartConfigs.map((c) => c.key).join(",")}>
        <ChartPanelLayout
          chartConfigs={state.chartConfigs}
          renderChart={renderChart}
          layoutType={layoutType}
          className={classes.canvasChartPanelLayout}
        />
      </div>
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
          <ChartWrapper chartKey="dragged">
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

const ReactGridChartPreview = forwardRef<
  HTMLDivElement,
  CommonChartPreviewProps
>((props, ref) => {
  const { children, chartKey, dataSource, ...rest } = props;
  return (
    <ChartTablePreviewProvider>
      <ChartWrapper {...rest} ref={ref} chartKey={chartKey}>
        <ChartPreviewInner
          dataSource={dataSource}
          chartKey={chartKey}
          actionElementSlot={<DragHandle dragging />}
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
        chartKey={chartKey}
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
            <DragHandle
              ref={setActivatorNodeRef}
              dragging={isDragging}
              {...listeners}
            />
          }
        />
      </ChartWrapper>
    </ChartTablePreviewProvider>
  );
};

const SingleURLsPreview = ({
  dataSource,
  layout,
}: {
  dataSource: DataSource;
  layout: Extract<Layout, { type: "singleURLs" }>;
}) => {
  const [state, dispatch] = useConfiguratorState(hasChartConfigs);
  const renderChart = useCallback(
    (chartConfig: ChartConfig) => {
      const checked = layout.publishableChartKeys.includes(chartConfig.key);
      const { publishableChartKeys: keys } = layout;
      const { key } = chartConfig;
      return (
        <ChartTablePreviewProvider>
          <ChartWrapper chartKey={key}>
            <ChartPreviewInner
              dataSource={dataSource}
              chartKey={chartConfig.key}
              actionElementSlot={
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

const ChartPreviewInner = ({
  children,
  dataSource,
  chartKey,
  actionElementSlot,
}: {
  children?: ReactNode;
  dataSource: DataSource;
  chartKey?: string | null;
  actionElementSlot?: ReactNode;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [state, dispatch] = useConfiguratorState();
  const configuring = isConfiguring(state);
  const chartConfig = getChartConfig(state, chartKey);
  const locale = useLocale();
  const chartClasses = useChartStyles({ disableBorder: false });
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
  const componentIds = undefined;
  const [{ data: components }] = useDataCubesComponentsQuery({
    variables: {
      ...commonQueryVariables,
      cubeFilters: chartConfig.cubes.map((cube) => ({
        iri: cube.iri,
        componentIds,
        filters: cube.filters,
        joinBy: cube.joinBy,
      })),
    },
  });
  const { isTable } = useChartTablePreview();
  const dimensions = components?.dataCubesComponents.dimensions;
  const measures = components?.dataCubesComponents.measures;
  const allComponents = useMemo(() => {
    if (!dimensions || !measures) {
      return [];
    }

    return [...dimensions, ...measures];
  }, [dimensions, measures]);

  return (
    <Box ref={ref} className={chartClasses.root}>
      {children}
      <ChartErrorBoundary resetKeys={[state]}>
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
                    height: "fit-content",
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
                      smaller={state.layout.type === "dashboard"}
                      onClick={
                        configuring
                          ? () =>
                              dispatch({
                                type: "CHART_ACTIVE_FIELD_CHANGED",
                                value: "title",
                              })
                          : undefined
                      }
                      {...{
                        [DISABLE_SCREENSHOT_ATTR_KEY]:
                          !chartConfig.meta.title[locale],
                      }}
                    />
                  ) : (
                    // We need to have a span here to keep the space between the
                    // title and the chart (subgrid layout)
                    <span style={{ height: 1 }} />
                  )}
                  <ActionElementsContainer>
                    <ChartMoreButton
                      chartKey={chartConfig.key}
                      chartWrapperNode={ref.current}
                      components={allComponents}
                    />
                    {actionElementSlot}
                  </ActionElementsContainer>
                </Flex>
                {configuring || chartConfig.meta.description[locale] ? (
                  <Description
                    text={chartConfig.meta.description[locale]}
                    lighterColor
                    smaller={state.layout.type === "dashboard"}
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
                    {...{
                      [DISABLE_SCREENSHOT_ATTR_KEY]:
                        !chartConfig.meta.description[locale],
                    }}
                  />
                ) : (
                  // We need to have a span here to keep the space between the
                  // title and the chart (subgrid layout)
                  <span style={{ height: 1 }} />
                )}
                <Box sx={{ mt: 4 }}>
                  {metadata?.dataCubesMetadata.some(
                    (d) =>
                      d.publicationStatus === DataCubePublicationStatus.Draft
                  ) && (
                    <Box sx={{ mb: 4 }}>
                      <HintYellow>
                        <Trans id="dataset.publicationStatus.draft.warning">
                          Careful, this dataset is only a draft.
                          <br />
                          <strong>Don&apos;t use for reporting!</strong>
                        </Trans>
                      </HintYellow>
                    </Box>
                  )}
                </Box>
                <ChartControls
                  dataSource={dataSource}
                  chartConfig={chartConfig}
                  dashboardFilters={state.dashboardFilters}
                  metadataPanelProps={{
                    components: allComponents,
                    top: BANNER_MARGIN_TOP,
                  }}
                />
                <TablePreviewWrapper>
                  {isTable ? (
                    <DataSetTable
                      dataSource={dataSource}
                      chartConfig={chartConfig}
                      dashboardFilters={state.dashboardFilters}
                      sx={{ width: "100%", maxHeight: "100%" }}
                    />
                  ) : (
                    <ChartWithFilters
                      dataSource={dataSource}
                      componentIds={componentIds}
                      chartConfig={chartConfig}
                      dashboardFilters={state.dashboardFilters}
                    />
                  )}
                </TablePreviewWrapper>
                <ChartFootnotes
                  dataSource={dataSource}
                  chartConfig={chartConfig}
                  dashboardFilters={state.dashboardFilters}
                  components={allComponents}
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
