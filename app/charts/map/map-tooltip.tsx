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
  const [state] = useMapTooltip();
  const [{ interaction }] = useInteraction();
  const {
    sameAreaAndSymbolComponentIri,
    areaLayer: {
      showAreaLayer,
      areaMeasureLabel,
      getAreaLabel,
      getAreaValue,
      colorScale,
    },
    symbolLayer: {
      showSymbolLayer,
      symbolMeasureLabel,
      getSymbolLabel,
      getSymbolValue,
      color: symbolColor,
    },
  } = useChartState() as MapState;
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
              {state.hoverObjectType === "area"
                ? getAreaLabel(interaction.d)
                : getSymbolLabel(interaction.d)}
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
              {sameAreaAndSymbolComponentIri ? (
                <>
                  {showAreaLayer && getAreaValue(interaction.d) !== null && (
                    <>
                      <Text as="div" variant="meta">
                        {areaMeasureLabel}
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
                            getAreaValue(interaction.d) !== null
                              ? colorScale(
                                  getAreaValue(interaction.d) as number
                                )
                              : "transparent",
                          color:
                            getAreaValue(interaction.d) !== null &&
                            hcl(
                              colorScale(getAreaValue(interaction.d) as number)
                            ).l < 55
                              ? "#fff"
                              : "#000",
                        }}
                      >
                        <Text as="div" variant="meta">
                          {formatNumber(getAreaValue(interaction.d))}
                        </Text>
                      </Box>
                    </>
                  )}

                  {showSymbolLayer && getSymbolValue(interaction.d) !== null && (
                    <>
                      <Text as="div" variant="meta">
                        {symbolMeasureLabel}
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
                            typeof getSymbolValue(interaction.d) === "number"
                              ? symbolColor
                              : "transparent",
                        }}
                      >
                        <Text
                          as="div"
                          variant="meta"
                          sx={{ color: "monochrome100" }}
                        >
                          {formatNumber(getSymbolValue(interaction.d))}
                        </Text>
                      </Box>
                    </>
                  )}
                </>
              ) : (
                <>
                  {state.hoverObjectType === "area" &&
                    showAreaLayer &&
                    getAreaValue(interaction.d) !== null && (
                      <>
                        <Text as="div" variant="meta">
                          {areaMeasureLabel}
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
                              getAreaValue(interaction.d) !== null
                                ? colorScale(
                                    getAreaValue(interaction.d) as number
                                  )
                                : "transparent",
                            color:
                              getAreaValue(interaction.d) !== null &&
                              hcl(
                                colorScale(
                                  getAreaValue(interaction.d) as number
                                )
                              ).l < 55
                                ? "#fff"
                                : "#000",
                          }}
                        >
                          <Text as="div" variant="meta">
                            {formatNumber(getAreaValue(interaction.d))}
                          </Text>
                        </Box>
                      </>
                    )}

                  {state.hoverObjectType === "symbol" &&
                    showSymbolLayer &&
                    getSymbolValue(interaction.d) !== null && (
                      <>
                        <Text as="div" variant="meta">
                          {symbolMeasureLabel}
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
                              typeof getSymbolValue(interaction.d) === "number"
                                ? symbolColor
                                : "transparent",
                          }}
                        >
                          <Text
                            as="div"
                            variant="meta"
                            sx={{ color: "monochrome100" }}
                          >
                            {formatNumber(getSymbolValue(interaction.d))}
                          </Text>
                        </Box>
                      </>
                    )}
                </>
              )}
            </Grid>
          </Box>
        </TooltipBox>
      )}
    </>
  );
};
