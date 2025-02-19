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

import { useWMTSLayers } from "@/charts/map/wmts-utils";
import { Select, SelectOption } from "@/components/form";
import { MoveDragButton } from "@/components/move-drag-button";
import { BaseLayer, MapConfig } from "@/config-types";
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
  const chartConfigLayers = chartConfig.baseLayer.customWMTSLayers;
  const { data, error } = useWMTSLayers();
  const handleChange = useEventCallback(
    (value: BaseLayer["customWMTSLayers"]) => {
      if (!data) {
        return;
      }

      dispatch({
        type: "CUSTOM_WMTS_LAYERS_CHANGED",
        value,
      });
    }
  );
  const options: SelectOption[] = useMemo(() => {
    if (!data) {
      return [];
    }

    return [
      {
        label: t({
          id: "controls.none",
          message: "None",
        }),
        value: FIELD_VALUE_NONE,
        isNoneValue: true,
      },
    ].concat(
      data
        .map((layer) => ({
          value: layer.ResourceURL.template,
          label: layer["ows:Title"],
          isNoneValue: false,
        }))
        .sort((a, b) => a.label.localeCompare(b.label))
    );
  }, [data]);

  const handleDragEnd: OnDragEndResponder = useEventCallback((e) => {
    const sourceIndex = e.source.index;
    const destinationIndex = e.destination?.index;

    if (typeof destinationIndex !== "number" || e.source === e.destination) {
      return;
    }

    const newLayers = [...chartConfigLayers];
    const [removed] = newLayers.splice(sourceIndex, 1);
    newLayers.splice(destinationIndex, 0, removed);

    handleChange(newLayers);
  });

  return error ? (
    <Typography>{error.message}</Typography>
  ) : !data ? (
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
                {chartConfigLayers.map((layer, i) => (
                  <Draggable key={layer.url} draggableId={layer.url} index={i}>
                    {(provided) => (
                      <Box
                        ref={provided.innerRef}
                        {...provided.dragHandleProps}
                        {...provided.draggableProps}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 3,
                        }}
                      >
                        <Select
                          key={layer.url}
                          id={`layer-${layer.url}`}
                          options={options.filter(
                            (option) =>
                              option.value === layer.url || option.isNoneValue
                          )}
                          sortOptions={false}
                          onChange={(e) => {
                            const url = e.target.value as string;

                            if (url === FIELD_VALUE_NONE) {
                              handleChange(
                                chartConfigLayers.filter(
                                  (l) => l.url !== layer.url
                                )
                              );
                            }
                          }}
                          value={layer.url}
                          sx={{ maxWidth: 280 }}
                        />
                        <MoveDragButton />
                      </Box>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
        <Autocomplete
          key={chartConfigLayers.length}
          options={options.filter((option) => !option.isNoneValue)}
          getOptionLabel={(option) => option.label}
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
            if (value) {
              handleChange([...chartConfigLayers, { url: value.value }]);
            }
          }}
        />
      </ControlSectionContent>
    </ControlSection>
  );
};
