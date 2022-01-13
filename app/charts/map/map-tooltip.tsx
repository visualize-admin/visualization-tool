import { hcl } from "d3";
import * as React from "react";
import {
  createContext,
  Dispatch,
  ReactNode,
  Reducer,
  useContext,
  useReducer,
} from "react";
import { Box, Grid, Text } from "theme-ui";
import { useFormatNumber } from "../../configurator/components/ui-helpers";
import { TooltipBox } from "../shared/interaction/tooltip-box";
import { useChartState } from "../shared/use-chart-state";
import { useInteraction } from "../shared/use-interaction";
import { MapState } from "./map-state";

type HoverObjectType = "area" | "symbol";

type MapTooltipStateAction = {
  type: "SET_HOVER_OBJECT_TYPE";
  value: HoverObjectType;
};

interface MapTooltipState {
  hoverObjectType: HoverObjectType;
}

const MAP_TOOLTIP_INITIAL_STATE: MapTooltipState = {
  hoverObjectType: "area",
};

const MapTooltipStateReducer = (
  state: MapTooltipState,
  action: MapTooltipStateAction
) => {
  switch (action.type) {
    case "SET_HOVER_OBJECT_TYPE":
      return {
        ...state,
        hoverObjectType: action.value,
      };

    default:
      throw new Error();
  }
};

const MapTooltipStateContext = createContext<
  [MapTooltipState, Dispatch<MapTooltipStateAction>] | undefined
>(undefined);

export const useMapTooltip = () => {
  const ctx = useContext(MapTooltipStateContext);

  if (ctx === undefined) {
    throw Error(
      "You need to wrap your component in <MapTooltipProvider /> to useMapTooltip()"
    );
  }

  return ctx;
};

export const MapTooltipProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer<
    Reducer<MapTooltipState, MapTooltipStateAction>
  >(MapTooltipStateReducer, MAP_TOOLTIP_INITIAL_STATE);

  return (
    <MapTooltipStateContext.Provider value={[state, dispatch]}>
      {children}
    </MapTooltipStateContext.Provider>
  );
};

export const MapTooltip = () => {
  const [{ hoverObjectType }] = useMapTooltip();
  const [{ interaction }] = useInteraction();
  const { identicalLayerComponentIris, areaLayer, symbolLayer } =
    useChartState() as MapState;
  const formatNumber = useFormatNumber();

  return (
    <>
      {interaction.mouse && interaction.d && (
        <TooltipBox
          x={interaction.mouse.x}
          y={interaction.mouse.y - 20}
          placement={{ x: "center", y: "top" }}
          margins={{ bottom: 0, left: 0, right: 0, top: 0 }}
        >
          <Box sx={{ minWidth: 200 }}>
            <Text as="div" variant="meta" sx={{ fontWeight: "bold" }}>
              {hoverObjectType === "area"
                ? areaLayer.getLabel(interaction.d)
                : symbolLayer.getLabel(interaction.d)}
            </Text>
            <Grid
              sx={{
                mt: 1,
                width: "100%",
                gridTemplateColumns: "1fr auto",
                gap: 1,
                alignItems: "center",
              }}
            >
              {
                <>
                  {((identicalLayerComponentIris &&
                    areaLayer.show &&
                    areaLayer.getValue(interaction.d) !== null) ||
                    (hoverObjectType === "area" &&
                      areaLayer.show &&
                      areaLayer.getValue(interaction.d) !== null)) && (
                    <>
                      <Text as="div" variant="meta">
                        {areaLayer.measureLabel}
                      </Text>
                      <Box
                        sx={{
                          borderRadius: "circle",
                          px: 2,
                          display: "inline-block",
                          textAlign: "center",
                        }}
                        style={{
                          background:
                            areaLayer.getValue(interaction.d) !== null
                              ? areaLayer.colorScale(
                                  areaLayer.getValue(interaction.d) as number
                                )
                              : "transparent",
                          color:
                            areaLayer.getValue(interaction.d) !== null &&
                            hcl(
                              areaLayer.colorScale(
                                areaLayer.getValue(interaction.d) as number
                              )
                            ).l < 55
                              ? "#fff"
                              : "#000",
                        }}
                      >
                        <Text as="div" variant="meta">
                          {formatNumber(areaLayer.getValue(interaction.d))}
                        </Text>
                      </Box>
                    </>
                  )}

                  {((identicalLayerComponentIris &&
                    symbolLayer.show &&
                    symbolLayer.getValue(interaction.d) !== null) ||
                    (hoverObjectType === "symbol" &&
                      symbolLayer.show &&
                      symbolLayer.getValue(interaction.d) !== null)) && (
                    <>
                      <Text as="div" variant="meta">
                        {symbolLayer.measureLabel}
                      </Text>
                      <Box
                        sx={{
                          borderRadius: "circle",
                          px: 2,
                          display: "inline-block",
                          textAlign: "center",
                        }}
                        style={{
                          background:
                            typeof symbolLayer.getValue(interaction.d) ===
                            "number"
                              ? symbolLayer.color
                              : "transparent",
                        }}
                      >
                        <Text
                          as="div"
                          variant="meta"
                          sx={{ color: "monochrome100" }}
                        >
                          {formatNumber(symbolLayer.getValue(interaction.d))}
                        </Text>
                      </Box>
                    </>
                  )}
                </>
              }
            </Grid>
          </Box>
        </TooltipBox>
      )}
    </>
  );
};
