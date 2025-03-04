import { t, Trans } from "@lingui/macro";
import {
  Autocomplete,
  Box,
  MenuItem,
  TextField,
  Typography,
  useEventCallback,
} from "@mui/material";
import { useMemo } from "react";
import {
  DragDropContext,
  Draggable,
  Droppable,
  OnDragEndResponder,
} from "react-beautiful-dnd";

import { ParsedWMSLayer, useWMSLayers } from "@/charts/map/wms-utils";
import { ParsedWMTSLayer, useWMTSLayers } from "@/charts/map/wmts-utils";
import { Select, SelectOption, Switch } from "@/components/form";
import { MoveDragButton } from "@/components/move-drag-button";
import { MapConfig, WMSCustomLayer, WMTSCustomLayer } from "@/config-types";
import { getChartConfig } from "@/config-utils";
import {
  ControlSection,
  ControlSectionContent,
  ControlSectionSkeleton,
  SectionTitle,
} from "@/configurator/components/chart-controls/section";
import {
  isConfiguring,
  useConfiguratorState,
} from "@/configurator/configurator-state";
import { FIELD_VALUE_NONE } from "@/configurator/constants";

export const CustomLayersSelector = () => {
  const [state, dispatch] = useConfiguratorState(isConfiguring);
  const chartConfig = getChartConfig(state) as MapConfig;
  const customLayers = chartConfig.baseLayer.customLayers;
  const { data: wmsLayers, error: wmsError } = useWMSLayers();
  const { data: wmtsLayers, error: wmtsError } = useWMTSLayers();
  const error = wmsError ?? wmtsError;
  const options = useMemo(() => {
    return getCustomLayerOptions({ wmsLayers, wmtsLayers });
  }, [wmsLayers, wmtsLayers]);
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

  return error ? (
    <Typography>{error.message}</Typography>
  ) : !wmsLayers || !wmtsLayers ? (
    <ControlSectionSkeleton />
  ) : (
    <ControlSection collapse>
      <SectionTitle>
        <Trans id="chart.map.layers.custom-layers">Custom Layers</Trans>
      </SectionTitle>
      <ControlSectionContent gap="large">
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="layers">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {customLayers.map((customLayer, i) => {
                  return (
                    <DraggableLayer
                      key={`${customLayer.type}-${customLayer.id}`}
                      customLayer={customLayer}
                      wmtsLayers={wmtsLayers}
                      options={options}
                      index={i}
                    />
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
        <Autocomplete
          key={customLayers.length}
          options={options.filter(
            (option) =>
              !option.isNoneValue &&
              !customLayers.some(
                (layer) =>
                  layer.type === option.type && layer.id === option.value
              )
          )}
          getOptionLabel={(option) => option.label}
          groupBy={(option) => option.type?.toUpperCase() ?? ""}
          renderInput={(params) => {
            return (
              <TextField
                {...params}
                label={t({
                  id: "chart.map.layers.base.add-layer",
                  message: "Add layer",
                })}
              />
            );
          }}
          renderOption={(props, option) => (
            <MenuItem {...props} key={option.value}>
              <Typography>{option.label}</Typography>
            </MenuItem>
          )}
          onChange={(_, value) => {
            const valueType = value?.type;

            if (!valueType) {
              return;
            }

            switch (valueType) {
              case "wms":
                const wmsLayer = wmsLayers.find(
                  (layer) => layer.id === value.value
                );

                if (!wmsLayer) {
                  return;
                }

                dispatch({
                  type: "CUSTOM_LAYER_ADD",
                  value: {
                    layer: {
                      type: "wms",
                      id: wmsLayer.id,
                      isBehindAreaLayer: false,
                      syncTemporalFilters: false,
                    },
                  },
                });
                break;
              case "wmts":
                const wmtsLayer = wmtsLayers.find(
                  (layer) => layer.id === value.value
                );

                if (!wmtsLayer) {
                  return;
                }

                dispatch({
                  type: "CUSTOM_LAYER_ADD",
                  value: {
                    layer: {
                      type: "wmts",
                      id: wmtsLayer.id,
                      url: wmtsLayer.url,
                      isBehindAreaLayer: false,
                      syncTemporalFilters: false,
                    },
                  },
                });
                break;
              default:
                const _exhaustiveCheck: never = valueType;
                return _exhaustiveCheck;
            }
          }}
        />
      </ControlSectionContent>
    </ControlSection>
  );
};

type CustomLayerOption = SelectOption & { type?: "wms" | "wmts" };

const getCustomLayerOptions = ({
  wmsLayers,
  wmtsLayers,
}: {
  wmsLayers?: ParsedWMSLayer[];
  wmtsLayers?: ParsedWMTSLayer[];
}): CustomLayerOption[] => {
  if (!wmsLayers || !wmtsLayers) {
    return [];
  }

  return [
    {
      label: t({ id: "controls.none", message: "None" }),
      value: FIELD_VALUE_NONE,
      isNoneValue: true,
    },
  ]
    .concat(
      wmtsLayers
        .map((layer) => ({
          type: "wmts" as const,
          ...getBaseLayerOption(layer),
        }))
        .sort((a, b) => a.label.localeCompare(b.label))
    )
    .concat(
      wmsLayers
        .map((layer) => ({
          type: "wms" as const,
          ...getBaseLayerOption(layer),
        }))
        .sort((a, b) => a.label.localeCompare(b.label))
    );
};

const getBaseLayerOption = (layer: ParsedWMSLayer | ParsedWMTSLayer) => {
  return {
    value: layer.id,
    label: layer.title,
    isNoneValue: false,
  };
};

const DraggableLayer = ({
  customLayer,
  wmtsLayers,
  options,
  index,
}: {
  customLayer: WMSCustomLayer | WMTSCustomLayer;
  wmtsLayers: ParsedWMTSLayer[];
  options: CustomLayerOption[];
  index: number;
}) => {
  const [_, dispatch] = useConfiguratorState(isConfiguring);
  const value = customLayer.id;
  const enableTemporalFiltering = useMemo(() => {
    switch (customLayer.type) {
      case "wms":
        return false;
      case "wmts":
        const wmtsLayer = wmtsLayers.find((l) => l.id === customLayer.id);
        return (
          wmtsLayer?.availableDimensionValues &&
          wmtsLayer.availableDimensionValues.length > 1
        );
      default:
        const _exhaustiveCheck: never = customLayer;
        return _exhaustiveCheck;
    }
  }, [customLayer, wmtsLayers]);

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
              mb: 2,
            }}
          >
            <Select
              id={`layer-${value}`}
              options={options.filter(
                (o) =>
                  (o.type === customLayer.type && o.value === customLayer.id) ||
                  o.isNoneValue
              )}
              sortOptions={false}
              onChange={(e) => {
                const value = e.target.value as string;

                if (value === FIELD_VALUE_NONE) {
                  dispatch({
                    type: "CUSTOM_LAYER_REMOVE",
                    value: {
                      type: customLayer.type,
                      id: customLayer.id,
                    },
                  });
                }
              }}
              value={value}
              sx={{ maxWidth: 280 }}
            />
            <MoveDragButton />
          </Box>
          <Switch
            label={t({
              id: "chart.map.layers.base.behind-area-layer",
              message: "Behind area layer",
            })}
            checked={customLayer.isBehindAreaLayer}
            onChange={(e) => {
              dispatch({
                type: "CUSTOM_LAYER_UPDATE",
                value: {
                  layer: {
                    ...customLayer,
                    isBehindAreaLayer: e.target.checked,
                  },
                },
              });
            }}
          />
          {customLayer.type === "wmts" ? (
            <Switch
              label={t({
                id: "chart.map.layers.base.enable-temporal-filtering",
                message: "Sync with temporal filters",
              })}
              checked={customLayer.syncTemporalFilters}
              disabled={!enableTemporalFiltering}
              onChange={(e) => {
                dispatch({
                  type: "CUSTOM_LAYER_UPDATE",
                  value: {
                    layer: {
                      ...customLayer,
                      syncTemporalFilters: e.target.checked,
                    },
                  },
                });
              }}
            />
          ) : null}
        </Box>
      )}
    </Draggable>
  );
};
