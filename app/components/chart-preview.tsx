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
import Head from "next/head";
import React from "react";

import { DataSetTable } from "@/browse/datatable";
import { ChartDataFilters } from "@/charts/shared/chart-data-filters";
import { LoadingStateProvider } from "@/charts/shared/chart-loading-state";
import { ChartErrorBoundary } from "@/components/chart-error-boundary";
import { ChartFootnotes } from "@/components/chart-footnotes";
import {
  useAlignChartElements,
  useChartHeaderMarginBottom,
} from "@/components/chart-helpers";
import {
  ChartPanelLayoutTall,
  ChartPanelLayoutVertical,
  ChartWrapper,
  ChartWrapperProps,
} from "@/components/chart-panel";
import { DragHandle } from "@/components/chart-selection-tabs";
import {
  ChartTablePreviewProvider,
  useChartTablePreview,
} from "@/components/chart-table-preview";
import { ChartWithFilters } from "@/components/chart-with-filters";
import DebugPanel from "@/components/debug-panel";
import Flex from "@/components/flex";
import { Checkbox } from "@/components/form";
import { HintYellow } from "@/components/hint";
import { MetadataPanel } from "@/components/metadata-panel";
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
import { useLocale } from "@/locales/use-locale";
import { InteractiveFiltersProvider } from "@/stores/interactive-filters";
import { useTransitionStore } from "@/stores/transition";
import { useTheme } from "@/themes";
import { snapCornerToCursor } from "@/utils/dnd";
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
  ) : layout.type === "singleURLs" ? (
    <SingleURLsPreview dataSource={dataSource} layout={layout} />
  ) : (
    <ChartTablePreviewProvider>
      <ChartWrapper editing={editing} layoutType={layout.type}>
        <ChartPreviewInner dataSource={dataSource} />
      </ChartWrapper>
    </ChartTablePreviewProvider>
  );
};

type DashboardPreviewProps = ChartPreviewProps & {
  layoutType: Extract<Layout, { type: "dashboard" }>["layout"];
  editing?: boolean;
};

const DashboardPreview = (props: DashboardPreviewProps) => {
  const { dataSource, layoutType, editing } = props;
  const [state, dispatch] = useConfiguratorState(hasChartConfigs);
  const theme = useTheme();
  const transition = useTransitionStore();
  const [isDragging, setIsDragging] = React.useState(false);
  const [activeChartKey, setActiveChartKey] = React.useState<string | null>(
    null
  );
  const [over, setOver] = React.useState<Over | null>(null);
  const renderChart = React.useCallback(
    (chartConfig: ChartConfig) => (
      <DndChartPreview
        chartKey={chartConfig.key}
        dataSource={dataSource}
        layoutType={state.layout.type}
        editing={editing}
      />
    ),
    [dataSource, editing, state.layout]
  );

  return (
    <DndContext
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
      {layoutType === "tall" ? (
        <ChartPanelLayoutTall
          chartConfigs={state.chartConfigs}
          renderChart={renderChart}
        />
      ) : (
        <ChartPanelLayoutVertical
          chartConfigs={state.chartConfigs}
          renderChart={renderChart}
        />
      )}
      {isDragging && (
        <DragOverlay
          zIndex={1000}
          modifiers={[snapCornerToCursor]}
          style={{
            opacity: over ? 0.8 : 1,
            width: "min(40vh, 400px)",
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

type DndChartPreviewProps = ChartWrapperProps & {
  chartKey: string;
  dataSource: DataSource;
};

const DndChartPreview = (props: DndChartPreviewProps) => {
  const { children, chartKey, dataSource, ...rest } = props;
  const theme = useTheme();
  const { reset: resetAlignChartElements } = useAlignChartElements();

  // Reset max heights when the order of the charts changes.
  React.useEffect(() => {
    resetAlignChartElements();
  }, [chartKey, resetAlignChartElements]);

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

  const setRef = React.useCallback(
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
          opacity: isDragging ? 0 : isOver ? 0.8 : 1,
          border: `2px solid ${
            isOver && !isDragging ? theme.palette.primary.main : "transparent"
          }`,
          outline: "none",
          pointerEvents: active ? "none" : "auto",
        }}
      >
        <ChartPreviewInner
          dataSource={dataSource}
          chartKey={chartKey}
          actionElementSlot={
            <DragHandle
              {...listeners}
              ref={setActivatorNodeRef}
              dragging={isDragging}
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
  const renderChart = React.useCallback(
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
    <ChartPanelLayoutVertical
      chartConfigs={state.chartConfigs}
      renderChart={renderChart}
    />
  );
};

type ChartPreviewInnerProps = ChartPreviewProps & {
  chartKey?: string | null;
  actionElementSlot?: React.ReactNode;
  disableMetadataPanel?: boolean;
};

export const ChartPreviewInner = (props: ChartPreviewInnerProps) => {
  const { dataSource, chartKey, actionElementSlot, disableMetadataPanel } =
    props;
  const [state, dispatch] = useConfiguratorState();
  const chartConfig = getChartConfig(state, chartKey);
  const locale = useLocale();
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
  const { headerRef, headerMarginBottom } = useChartHeaderMarginBottom();

  const handleToggleTableView = useEvent(() => setIsTablePreview((c) => !c));
  const dimensions = components?.dataCubesComponents.dimensions;
  const measures = components?.dataCubesComponents.measures;
  const allComponents = React.useMemo(() => {
    if (!components?.dataCubesComponents) {
      return [];
    }

    return [
      ...components.dataCubesComponents.dimensions,
      ...components.dataCubesComponents.measures,
    ];
  }, [components?.dataCubesComponents]);

  return (
    <Flex
      sx={{
        flexDirection: "column",
        flexGrow: 1,
        color: "grey.800",
        p: 6,
        width: "100%",
      }}
    >
      <ChartErrorBoundary resetKeys={[state]}>
        {/* FIXME: adapt to design */}
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
              <InteractiveFiltersProvider>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    height: "100%",
                  }}
                >
                  <div style={{ height: "100%" }}>
                    <div
                      ref={headerRef}
                      style={{
                        marginBottom: `${headerMarginBottom}px`,
                        transition: "margin-bottom 0.2s ease-in-out",
                      }}
                    >
                      <Flex
                        sx={{
                          justifyContent:
                            state.state === "CONFIGURING_CHART" ||
                            chartConfig.meta.title[locale]
                              ? "space-between"
                              : "flex-end",
                          alignItems: "flex-start",
                          gap: 2,
                        }}
                      >
                        {(state.state === "CONFIGURING_CHART" ||
                          chartConfig.meta.title[locale]) && (
                          <Title
                            text={chartConfig.meta.title[locale]}
                            lighterColor
                            onClick={
                              state.state === "CONFIGURING_CHART"
                                ? () =>
                                    dispatch({
                                      type: "CHART_ACTIVE_FIELD_CHANGED",
                                      value: "title",
                                    })
                                : undefined
                            }
                          />
                        )}
                        <Flex sx={{ alignItems: "center", gap: 2 }}>
                          {!disableMetadataPanel && (
                            <MetadataPanel
                              dataSource={dataSource}
                              chartConfigs={[chartConfig]}
                              dimensions={allComponents}
                              top={96}
                            />
                          )}
                          {actionElementSlot}
                        </Flex>
                      </Flex>
                      {(state.state === "CONFIGURING_CHART" ||
                        chartConfig.meta.description[locale]) && (
                        <Description
                          text={chartConfig.meta.description[locale]}
                          lighterColor
                          onClick={
                            state.state === "CONFIGURING_CHART"
                              ? () => {
                                  dispatch({
                                    type: "CHART_ACTIVE_FIELD_CHANGED",
                                    value: "description",
                                  });
                                }
                              : undefined
                          }
                        />
                      )}
                      {chartConfig.interactiveFiltersConfig?.dataFilters
                        .active && (
                        <ChartDataFilters
                          dataSource={dataSource}
                          chartConfig={chartConfig}
                          dimensions={dimensions}
                          measures={measures}
                        />
                      )}
                    </div>
                    <Box
                      ref={containerRef}
                      height={containerHeight.current}
                      pt={4}
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
                          dimensions={dimensions}
                          measures={measures}
                        />
                      )}
                    </Box>
                  </div>
                  <ChartFootnotes
                    dataSource={dataSource}
                    chartConfig={chartConfig}
                    onToggleTableView={handleToggleTableView}
                    dimensions={dimensions}
                    measures={measures}
                  />
                </Box>
                <DebugPanel configurator interactiveFilters />
              </InteractiveFiltersProvider>
            </LoadingStateProvider>
          </>
        )}
      </ChartErrorBoundary>
    </Flex>
  );
};
