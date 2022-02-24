import { hcl } from "d3";
import * as React from "react";
import {
  createContext,
  Dispatch,
  ReactNode,
  useContext,
  useMemo,
  useState,
} from "react";
import { Box, Grid, Text } from "theme-ui";
import {
  formatNumberWithUnit,
  useFormatNumber,
} from "../../configurator/components/ui-helpers";
import { TooltipBox } from "../shared/interaction/tooltip-box";
import { useChartState } from "../shared/use-chart-state";
import { useInteraction } from "../shared/use-interaction";
import { MapState } from "./map-state";

type HoverObjectType = "area" | "symbol";

const MapTooltipStateContext = createContext<
  [HoverObjectType, Dispatch<HoverObjectType>] | undefined
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
  const [state, dispatch] = useState<HoverObjectType>("area");

  return (
    <MapTooltipStateContext.Provider value={[state, dispatch]}>
      {children}
    </MapTooltipStateContext.Provider>
  );
};

export const MapTooltip = () => {
  const [hoverObjectType] = useMapTooltip();
  const [{ interaction }] = useInteraction();
  const { identicalLayerComponentIris, areaLayer, symbolLayer } =
    useChartState() as MapState;

  const formatNumber = useFormatNumber();
  const areaLayerValue = useMemo(() => {
    if (interaction.d) {
      return areaLayer.getValue(interaction.d);
    } else {
      return null;
    }
  }, [areaLayer, interaction.d]);
  const symbolLayerValue = useMemo(() => {
    if (interaction.d) {
      return symbolLayer.getValue(interaction.d);
    } else {
      return null;
    }
  }, [symbolLayer, interaction.d]);
  const showAreaValue =
    areaLayer.show &&
    (identicalLayerComponentIris || hoverObjectType === "area");
  const showSymbolValue =
    symbolLayer.show &&
    (identicalLayerComponentIris || hoverObjectType === "symbol");

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
                  {showAreaValue && (
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
                            areaLayerValue !== null
                              ? areaLayer.colorScale(areaLayerValue)
                              : "rgb(222, 222, 222)",
                          color:
                            areaLayerValue !== null
                              ? hcl(areaLayer.colorScale(areaLayerValue)).l < 55
                                ? "#fff"
                                : "#000"
                              : "#000",
                        }}
                      >
                        <Text as="div" variant="meta">
                          <Text as="div" variant="meta">
                            {formatNumberWithUnit(
                              areaLayerValue,
                              formatNumber,
                              areaLayer?.measureDimension?.unit
                            )}
                            {areaLayer.getFormattedError
                              ? ` ± ${areaLayer?.getFormattedError?.(
                                  interaction.d
                                )}`
                              : null}
                          </Text>
                        </Text>
                      </Box>
                    </>
                  )}

                  {showSymbolValue && (
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
                          background: symbolLayer.color,
                          color:
                            hcl(symbolLayer.color).l < 55 ? "#fff" : "#000",
                        }}
                      >
                        <Text as="div" variant="meta">
                          {formatNumberWithUnit(
                            symbolLayerValue,
                            formatNumber,
                            symbolLayer?.measureDimension?.unit
                          )}
                          {symbolLayer.getFormattedError
                            ? ` ± ${symbolLayer?.getFormattedError?.(
                                interaction.d
                              )}`
                            : null}
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
