import {
  DndContext,
  DragOverlay,
  Over,
  pointerWithin,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import { getEventCoordinates } from "@dnd-kit/utilities";
import { Trans } from "@lingui/macro";
import { Box, useMediaQuery } from "@mui/material";
import Head from "next/head";
import React from "react";

import { DataSetTable } from "@/browse/datatable";
import { ChartDataFilters } from "@/charts/shared/chart-data-filters";
import { LoadingStateProvider } from "@/charts/shared/chart-loading-state";
import { ChartErrorBoundary } from "@/components/chart-error-boundary";
import { ChartFootnotes } from "@/components/chart-footnotes";
import {
  ChartPanel,
  ChartPanelLayout,
  ChartPanelProps,
} from "@/components/chart-panel";
import { DragHandle } from "@/components/chart-selection-tabs";
import {
  ChartTablePreviewProvider,
  useChartTablePreview,
} from "@/components/chart-table-preview";
import { ChartWithFilters } from "@/components/chart-with-filters";
import DebugPanel from "@/components/debug-panel";
import Flex from "@/components/flex";
import { HintYellow } from "@/components/hint";
import { MetadataPanel } from "@/components/metadata-panel";
import {
  ChartConfig,
  DataSource,
  Layout,
  getChartConfig,
  hasChartConfigs,
  isConfiguring,
  isLayouting,
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
import useEvent from "@/utils/use-event";

import type { Modifier } from "@dnd-kit/core";

type TallLayoutRowProps = {
  row: TallLayoutRow;
  dataSource: DataSource;
  editing?: boolean;
  layout?: Layout;
};

const TallLayoutRow = (props: TallLayoutRowProps) => {
  const { row, dataSource, editing, layout } = props;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  switch (row.type) {
    case "wide":
      return (
        <DndChartPreview
          chartKey={row.chartConfig.key}
          dataSource={dataSource}
          layout={layout}
          editing={editing}
        />
      );
    case "narrow":
      if (isMobile) {
        return (
          <>
            {row.chartConfigs.map((chartConfig) => (
              <AlignChartElementsProvider key={chartConfig.key}>
                <DndChartPreview
                  chartKey={chartConfig.key}
                  dataSource={dataSource}
                  layout={layout}
                  editing={editing}
                />
              </AlignChartElementsProvider>
            ))}
          </>
        );
      }

      return (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 4,
          }}
        >
          <AlignChartElementsProvider>
            {row.chartConfigs.map((chartConfig) => (
              <DndChartPreview
                key={chartConfig.key}
                chartKey={chartConfig.key}
                dataSource={dataSource}
                layout={layout}
                editing={editing}
              />
            ))}
          </AlignChartElementsProvider>
        </Box>
      );
  }
};

type TallLayoutRow =
  | {
      type: "wide";
      chartConfig: ChartConfig;
    }
  | {
      type: "narrow";
      chartConfigs: [ChartConfig] | [ChartConfig, ChartConfig];
    };

const getTallLayoutRows = (chartConfigs: ChartConfig[]): TallLayoutRow[] => {
  const result: TallLayoutRow[] = [];

  for (let i = 0; i < chartConfigs.length; i += 1) {
    if (i % 3 === 0) {
      result.push({ type: "wide", chartConfig: chartConfigs[i] });
    }

    if (i % 3 === 1) {
      const currentConfig = chartConfigs[i];
      const nextConfig = chartConfigs[i + 1];
      result.push({
        type: "narrow",
        chartConfigs: nextConfig
          ? [currentConfig, nextConfig]
          : [currentConfig],
      });
    }
  }

  return result;
};

type AlignChartElementsContext = {
  reset: () => void;
  maxHeaderHeight: number;
  setMaxHeaderHeight: (height: number) => void;
  maxChartHeight: number;
  setMaxChartHeight: (height: number) => void;
};

const AlignChartElementsContext =
  React.createContext<AlignChartElementsContext>({
    reset: () => {},
    maxHeaderHeight: 0,
    setMaxHeaderHeight: () => {},
    maxChartHeight: 0,
    setMaxChartHeight: () => {},
  });

export const useAlignChartElements = () => {
  const ctx = React.useContext(AlignChartElementsContext);

  if (ctx === undefined) {
    throw Error(
      "You need to wrap your component in <AlignChartElementsProvider /> to useAlignChartElements()"
    );
  }

  return ctx;
};

export const AlignChartElementsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [maxHeaderHeight, setMaxHeaderHeight] = React.useState(0);
  const [maxChartHeight, setMaxChartHeight] = React.useState(0);
  const reset = React.useCallback(() => {
    setMaxHeaderHeight(0);
    setMaxChartHeight(0);
  }, []);

  return (
    <AlignChartElementsContext.Provider
      value={{
        reset,
        maxHeaderHeight,
        setMaxHeaderHeight,
        maxChartHeight,
        setMaxChartHeight,
      }}
    >
      {children}
    </AlignChartElementsContext.Provider>
  );
};

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
  ) : (
    <ChartTablePreviewProvider>
      <ChartPanel editing={editing} layout={layout}>
        <ChartPreviewInner dataSource={dataSource} />
      </ChartPanel>
    </ChartTablePreviewProvider>
  );
};

type DashboardPreviewProps = ChartPreviewProps & {
  layoutType: Extract<Layout, { type: "dashboard" }>["layout"];
  editing?: boolean;
};

const DashboardPreview = (props: DashboardPreviewProps) => {
  const { dataSource, layoutType, editing } = props;
  const [state, dispatch] = useConfiguratorState(isLayouting);
  const theme = useTheme();
  const transition = useTransitionStore();
  const [isDragging, setIsDragging] = React.useState(false);
  const [activeChartKey, setActiveChartKey] = React.useState<string | null>(
    null
  );
  const [over, setOver] = React.useState<Over | null>(null);

  return (
    <ChartPanelLayout type={layoutType}>
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
              oldIndex: state.chartConfigs.findIndex(
                (c) => c.key === active.id
              ),
              newIndex: state.chartConfigs.findIndex((c) => c.key === over.id),
            },
          });
        }}
      >
        {getTallLayoutRows(state.chartConfigs).map((chartConfig, i) => (
          <TallLayoutRow
            key={i}
            row={chartConfig}
            dataSource={props.dataSource}
            layout={state.layout}
            editing={editing}
          />
        ))}
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
            <ChartPanel layout={state.layout}>
              <ChartPreviewInner
                dataSource={dataSource}
                chartKey={activeChartKey}
                dragHandleSlot={<DragHandle dragging />}
              />
            </ChartPanel>
          </DragOverlay>
        )}
      </DndContext>
    </ChartPanelLayout>
  );
};

type DndChartPreviewProps = ChartPanelProps & {
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
      <ChartPanel
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
          dragHandleSlot={
            <DragHandle
              {...listeners}
              ref={setActivatorNodeRef}
              dragging={isDragging}
            />
          }
        />
      </ChartPanel>
    </ChartTablePreviewProvider>
  );
};

type ChartPreviewInnerProps = ChartPreviewProps & {
  chartKey?: string | null;
  dragHandleSlot?: React.ReactNode;
  disableMetadataPanel?: boolean;
};

export const ChartPreviewInner = (props: ChartPreviewInnerProps) => {
  const { dataSource, chartKey, dragHandleSlot, disableMetadataPanel } = props;
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
  const alignChartElements = useAlignChartElements();
  const headerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (headerRef.current) {
      const { height } = headerRef.current.getBoundingClientRect();

      if (height > alignChartElements.maxHeaderHeight) {
        alignChartElements.setMaxHeaderHeight(height);
      }
    }
  }, [alignChartElements]);

  const headerMarginBottom = React.useMemo(() => {
    if (headerRef.current) {
      const { height } = headerRef.current.getBoundingClientRect();
      return alignChartElements.maxHeaderHeight - height;
    }

    return 0;
  }, [alignChartElements.maxHeaderHeight]);

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
                  <Box style={{ height: "100%" }}>
                    <Box ref={headerRef} sx={{ mb: `${headerMarginBottom}px` }}>
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
                              // FIXME: adapt to design
                              datasetIri={chartConfig.cubes[0].iri}
                              dataSource={dataSource}
                              dimensions={allComponents}
                              top={96}
                            />
                          )}
                          {dragHandleSlot}
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
                    </Box>
                    <Box
                      ref={containerRef}
                      height={containerHeight.current}
                      mt={4}
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
                  </Box>
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

const snapCornerToCursor: Modifier = ({
  activatorEvent,
  draggingNodeRect,
  transform,
}) => {
  if (draggingNodeRect && activatorEvent) {
    const activatorCoordinates = getEventCoordinates(activatorEvent);

    if (!activatorCoordinates) {
      return transform;
    }

    const offsetX = activatorCoordinates.x - draggingNodeRect.left + 48;

    return {
      ...transform,
      x: transform.x + offsetX - draggingNodeRect.width,
      y: transform.y,
    };
  }

  return transform;
};
