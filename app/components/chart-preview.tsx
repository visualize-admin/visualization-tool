import {
  DndContext,
  DragOverlay,
  Over,
  pointerWithin,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import { snapCenterToCursor } from "@dnd-kit/modifiers";
import { Trans } from "@lingui/macro";
import { Box } from "@mui/material";
import Head from "next/head";
import React from "react";

import { DataSetTable } from "@/browse/datatable";
import { ChartErrorBoundary } from "@/components/chart-error-boundary";
import { ChartFootnotes } from "@/components/chart-footnotes";
import {
  ChartPanelLayout,
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
import { HintYellow } from "@/components/hint";
import { MetadataPanel } from "@/components/metadata-panel";
import {
  DataSource,
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
import useEvent from "@/utils/use-event";

type ChartPreviewProps = {
  dataSource: DataSource;
};

export const ChartPreview = (props: ChartPreviewProps) => {
  const [state, dispatch] = useConfiguratorState(hasChartConfigs);
  const editing = isConfiguring(state);
  const [isDragging, setIsDragging] = React.useState(false);
  const [activeChartKey, setActiveChartKey] = React.useState<string | null>(
    null
  );
  const [over, setOver] = React.useState<Over | null>(null);

  return (
    <ChartTablePreviewProvider>
      {state.layout.type === "dashboard" && !editing ? (
        <ChartPanelLayout type={state.layout.layout}>
          <DndContext
            collisionDetection={pointerWithin}
            onDragStart={(e) => {
              setIsDragging(true);
              setActiveChartKey(e.active.id.toString());
            }}
            onDragMove={(e) => {
              if (e.over?.id !== over?.id) {
                setOver(e.over);
              }
            }}
            onDragEnd={(e) => {
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
                  newIndex: state.chartConfigs.findIndex(
                    (c) => c.key === over.id
                  ),
                },
              });
            }}
          >
            {state.chartConfigs.map((chartConfig) => (
              <DndChartPreview
                key={chartConfig.key}
                chartKey={chartConfig.key}
                dataSource={props.dataSource}
                editing={editing}
                layout={state.layout}
              />
            ))}
            {isDragging && (
              <DragOverlay
                zIndex={1000}
                modifiers={[snapCenterToCursor]}
                style={{
                  width: "min(40vh, 400px)",
                  height: "fit-content",
                  border:
                    over && over.id !== activeChartKey
                      ? "2px solid green"
                      : "2px solid transparent",
                  opacity: over && over.id !== activeChartKey ? 0.8 : 1,
                  cursor: "grabbing",
                  pointerEvents: "none",
                  transition:
                    "border 0.2s ease-in-out, opacity 0.2s ease-in-out",
                }}
              >
                <ChartWrapper editing={editing} layout={state.layout}>
                  <ChartPreviewInner
                    {...props}
                    chartKey={activeChartKey ?? undefined}
                    disableMetadataButton
                  />
                </ChartWrapper>
              </DragOverlay>
            )}
          </DndContext>
        </ChartPanelLayout>
      ) : (
        <ChartWrapper editing={editing} layout={state.layout}>
          <ChartPreviewInner {...props} />
        </ChartWrapper>
      )}
    </ChartTablePreviewProvider>
  );
};

type DndChartPreviewProps = ChartWrapperProps & {
  chartKey: string;
  dataSource: DataSource;
};

const DndChartPreview = (props: DndChartPreviewProps) => {
  const { children, chartKey, dataSource, ...rest } = props;

  const {
    setActivatorNodeRef,
    setNodeRef: setDraggableNodeRef,
    attributes,
    listeners,
    isDragging,
  } = useDraggable({ id: chartKey });

  const {
    setNodeRef: setDroppableNodeRef,
    isOver: isOverDroppable,
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
    <ChartWrapper
      {...rest}
      ref={setRef}
      {...attributes}
      style={{
        opacity: isOverDroppable && !isDragging ? 0.8 : 1,
        border:
          isOverDroppable && !isDragging
            ? "2px solid green"
            : "2px solid transparent",
        pointerEvents: active ? "none" : "auto",
        transition: "border 0.2s ease-in-out, opacity 0.2s ease-in-out",
      }}
    >
      <ChartPreviewInner
        {...props}
        chartKey={chartKey}
        titleSlot={
          <DragHandle
            ref={setActivatorNodeRef}
            {...listeners}
            dragging={isDragging}
          />
        }
        disableMetadataButton
      />
    </ChartWrapper>
  );
};

type ChartPreviewInnerProps = ChartPreviewProps & {
  chartKey?: string;
  titleSlot?: React.ReactNode;
  disableMetadataButton?: boolean;
};

export const ChartPreviewInner = (props: ChartPreviewInnerProps) => {
  const { dataSource, chartKey, titleSlot, disableMetadataButton } = props;
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
        justifyContent: "space-between",
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
              {titleSlot}
              {!disableMetadataButton && (
                <MetadataPanel
                  // FIXME: adapt to design
                  datasetIri={chartConfig.cubes[0].iri}
                  dataSource={dataSource}
                  dimensions={allComponents}
                  top={96}
                />
              )}
            </Flex>
            <Head>
              <title key="title">
                {!chartConfig.meta.title[locale]
                  ? // FIXME: adapt to design
                    metadata?.dataCubesMetadata.map((d) => d.title).join(", ")
                  : chartConfig.meta.title[locale]}{" "}
                - visualize.admin.ch
              </title>
            </Head>
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
            <Box ref={containerRef} height={containerHeight.current!} mt={4}>
              {isTablePreview ? (
                <DataSetTable
                  sx={{
                    width: "100%",
                    maxHeight: "100%",
                  }}
                  dataSource={dataSource}
                  chartConfig={chartConfig}
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
            {chartConfig && (
              <ChartFootnotes
                dataSource={dataSource}
                chartConfig={chartConfig}
                onToggleTableView={handleToggleTableView}
                dimensions={dimensions}
                measures={measures}
              />
            )}
            <DebugPanel configurator interactiveFilters />
          </>
        )}
      </ChartErrorBoundary>
    </Flex>
  );
};
