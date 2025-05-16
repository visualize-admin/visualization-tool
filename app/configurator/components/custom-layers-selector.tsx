import { t, Trans } from "@lingui/macro";
import {
  Box,
  Button,
  DrawerProps,
  IconButton,
  Typography,
  useEventCallback,
} from "@mui/material";
import uniq from "lodash/uniq";
import { ReactNode, useMemo, useState } from "react";
import {
  DragDropContext,
  Draggable,
  Droppable,
  OnDragEndResponder,
} from "react-beautiful-dnd";

import { RemoteWMSLayer } from "@/charts/map/wms-utils";
import {
  getLayerKey,
  makeKey,
  useWMTSorWMSLayers,
} from "@/charts/map/wms-wmts-endpoint-utils";
import WMTSSelector from "@/charts/map/wms-wmts-selector";
import { RemoteWMTSLayer } from "@/charts/map/wmts-utils";
import { Switch } from "@/components/form";
import { MoveDragButton } from "@/components/move-drag-button";
import { MapConfig, WMSCustomLayer, WMTSCustomLayer } from "@/config-types";
import { getChartConfig } from "@/config-utils";
import {
  ControlSection,
  ControlSectionContent,
  ControlSectionSkeleton,
  SectionTitle,
  useSectionTitleStyles,
} from "@/configurator/components/chart-controls/section";
import { ConfiguratorDrawer } from "@/configurator/components/drawers";
import {
  isConfiguring,
  useConfiguratorState,
} from "@/configurator/configurator-state";
import { truthy } from "@/domain/types";
import { Icon } from "@/icons";

const LeftDrawer = ({
  children,
  open,
  onClose,
  onExited,
}: {
  children: ReactNode;
  open?: DrawerProps["open"];
  onClose?: DrawerProps["onClose"];
  onExited?: () => void;
}) => {
  return (
    <ConfiguratorDrawer
      anchor="left"
      open={open}
      variant="temporary"
      onClose={onClose}
      SlideProps={{
        onExited: onExited,
      }}
      hideBackdrop
    >
      {children}
    </ConfiguratorDrawer>
  );
};

export const CustomLayersSelector = () => {
  const [state, dispatch] = useConfiguratorState(isConfiguring);
  const chartConfig = getChartConfig(state) as MapConfig;
  const configLayers = chartConfig.baseLayer.customLayers;
  const endpoints = useMemo(() => {
    return uniq(configLayers.map((layer) => layer.endpoint)).filter(truthy);
  }, [configLayers]);
  const {
    data: groupedLayers,
    error,
    status: layersStatus,
  } = useWMTSorWMSLayers(endpoints);
  const {
    wms: wmsLayers,
    wmts: wmtsLayers,
    byKey: layersByKey,
  } = groupedLayers!;

  const handleDragEnd: OnDragEndResponder = useEventCallback((e) => {
    const oldIndex = e.source.index;
    const newIndex = e.destination?.index;

    if (typeof newIndex !== "number" || e.source === e.destination) {
      return;
    }

    dispatch({
      type: "CUSTOM_LAYER_SWAP",
      value: {
        oldIndex,
        newIndex,
      },
    });
  });

  const handleCheckLayer = (
    layer: RemoteWMSLayer | RemoteWMTSLayer | null,
    checked: boolean
  ) => {
    const valueType = layer?.type;

    if (!valueType) {
      return;
    }

    if (!checked) {
      dispatch({
        type: "CUSTOM_LAYER_REMOVE",
        value: {
          type: valueType,
          id: layer.id,
        },
      });
      return;
    } else {
      switch (valueType) {
        case "wms":
          dispatch({
            type: "CUSTOM_LAYER_ADD",
            value: {
              layer: {
                type: "wms",
                id: layer.id,
                isBehindAreaLayer: false,
                syncTemporalFilters: false,
                endpoint: layer.endpoint,
              },
            },
          });
          break;
        case "wmts":
          dispatch({
            type: "CUSTOM_LAYER_ADD",
            value: {
              layer: {
                type: "wmts",
                id: layer.id,
                url: layer.url,
                isBehindAreaLayer: false,
                syncTemporalFilters: false,
                endpoint: layer.endpoint,
              },
            },
          });
          break;
        default:
          const _exhaustiveCheck: never = valueType;
          return _exhaustiveCheck;
      }
    }
  };

  const [addingLayer, setAddingLayer] = useState(false);
  const getParsedLayer = useMemo(() => {
    return (configLayer: WMTSCustomLayer | WMSCustomLayer) => {
      const key = getLayerKey(configLayer);
      return layersByKey[key];
    };
  }, [layersByKey]);
  const sectionTitleClasses = useSectionTitleStyles({
    sectionOpen: true,
    interactive: true,
  });
  return error ? (
    <Typography mx={2} color="error">
      {error.message}
    </Typography>
  ) : !wmsLayers || !wmtsLayers ? (
    <ControlSectionSkeleton />
  ) : (
    <ControlSection hideTopBorder>
      <SectionTitle closable>
        <Trans id="chart.map.layers.custom-layers">Custom Layers</Trans>
      </SectionTitle>
      <LeftDrawer open={addingLayer} onClose={() => setAddingLayer(false)}>
        <div>
          <div
            className={sectionTitleClasses.root}
            onClick={() => setAddingLayer(false)}
          >
            <Typography variant="h6" className={sectionTitleClasses.text}>
              <Icon name="chevronLeft" />
              <Trans id="wmts.custom-layer.section-title">
                Add custom layer
              </Trans>
            </Typography>
          </div>
        </div>
        <Box px={4}>
          {addingLayer ? (
            <WMTSSelector
              onLayerCheck={(x, checked) => {
                return handleCheckLayer(x, checked);
              }}
              selected={configLayers.map((layer) => {
                return makeKey(layer);
              })}
            />
          ) : null}
        </Box>
      </LeftDrawer>
      <ControlSectionContent gap="large">
        {configLayers.length === 0 && (
          <Typography variant="body3" color="text.secondary">
            <Trans id="chart.map.layers.no-layers">No custom layers</Trans>
          </Typography>
        )}

        {layersStatus === "success" ? (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="layers">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {configLayers.map((configLayer, i) => {
                    return (
                      <DraggableLayer
                        key={`${configLayer.type}-${configLayer.id}`}
                        configLayer={configLayer}
                        parsedLayer={getParsedLayer(configLayer)}
                        index={i}
                      />
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        ) : null}

        {layersStatus === "fetching" ? (
          <div style={{ width: "100%" }}>
            <ControlSectionSkeleton />
          </div>
        ) : null}

        <div>
          <Button
            variant="contained"
            color="cobalt"
            onClick={() => setAddingLayer(true)}
          >
            Add layer
          </Button>
        </div>
      </ControlSectionContent>
    </ControlSection>
  );
};

const DraggableLayer = ({
  configLayer,
  index,
  parsedLayer,
}: {
  configLayer: WMSCustomLayer | WMTSCustomLayer;
  index: number;
  parsedLayer: RemoteWMSLayer | RemoteWMTSLayer;
}) => {
  const [_, dispatch] = useConfiguratorState(isConfiguring);
  const value = configLayer.id;

  const enableTemporalFiltering = useMemo(() => {
    switch (configLayer.type) {
      case "wms":
        return false;
      case "wmts":
        return (
          parsedLayer?.availableDimensionValues &&
          parsedLayer.availableDimensionValues.length > 1
        );
      default:
        const _exhaustiveCheck: never = configLayer;
        return _exhaustiveCheck;
    }
  }, [configLayer, parsedLayer?.availableDimensionValues]);

  const handleRemoveClick = () => {
    dispatch({
      type: "CUSTOM_LAYER_REMOVE",
      value: {
        type: configLayer.type,
        id: configLayer.id,
      },
    });
  };

  return (
    <Draggable key={value} draggableId={value} index={index}>
      {(provided) => (
        <Box
          ref={provided.innerRef}
          {...provided.dragHandleProps}
          {...provided.draggableProps}
          sx={{ mb: 3 }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Typography variant="body3" sx={{ flexGrow: 1 }}>
              {parsedLayer?.title ?? "Unknown layer"}
            </Typography>
            <IconButton onClick={handleRemoveClick}>
              <Icon name="trash" />
            </IconButton>
            <MoveDragButton />
          </Box>
          <Box display="flex" flexDirection="column" width="100%" gap={1}>
            <Switch
              label={t({
                id: "chart.map.layers.base.behind-area-layer",
                message: "Behind area layer",
              })}
              checked={configLayer.isBehindAreaLayer}
              onChange={(e) => {
                dispatch({
                  type: "CUSTOM_LAYER_UPDATE",
                  value: {
                    layer: {
                      ...configLayer,
                      isBehindAreaLayer: e.target.checked,
                    },
                  },
                });
              }}
            />
            {configLayer.type === "wmts" ? (
              <Switch
                label={t({
                  id: "chart.map.layers.base.enable-temporal-filtering",
                  message: "Sync with temporal filters",
                })}
                checked={configLayer.syncTemporalFilters}
                disabled={!enableTemporalFiltering}
                onChange={(e) => {
                  dispatch({
                    type: "CUSTOM_LAYER_UPDATE",
                    value: {
                      layer: {
                        ...configLayer,
                        syncTemporalFilters: e.target.checked,
                      },
                    },
                  });
                }}
              />
            ) : null}
          </Box>
        </Box>
      )}
    </Draggable>
  );
};
