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
  const { getFormattedError: formatAreaError } = areaLayer;
  const { getFormattedError: formatSymbolError } = symbolLayer;

  const formatNumber = useFormatNumber();
  const areaValue = useMemo(
    () =>
      interaction.d !== undefined ? areaLayer.getValue(interaction.d) : null,
    [areaLayer, interaction.d]
  );
  const symbolValue = useMemo(
    () =>
      interaction.d !== undefined ? symbolLayer.getValue(interaction.d) : null,
    [symbolLayer, interaction.d]
  );
  const showAreaValue =
    areaLayer.show &&
    (identicalLayerComponentIris || hoverObjectType === "area");
  const showSymbolValue =
    symbolLayer.show &&
    (identicalLayerComponentIris || hoverObjectType === "symbol");
  const areaColor = useMemo(
    () => (areaValue !== null ? areaLayer.colorScale(areaValue) : null),
    [areaValue, areaLayer]
  );

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
                    <TooltipRow
                      title={areaLayer.measureLabel}
                      background={areaColor || "#dedede"}
                      color={
                        areaColor
                          ? hcl(areaColor).l < 55
                            ? "#fff"
                            : "#000"
                          : "#000"
                      }
                      value={formatNumberWithUnit(
                        areaValue,
                        formatNumber,
                        areaLayer?.measureDimension?.unit
                      )}
                      error={
                        formatAreaError
                          ? ` ± ${formatAreaError(interaction.d)}`
                          : null
                      }
                    />
                  )}

                  {showSymbolValue && (
                    <TooltipRow
                      title={symbolLayer.measureLabel}
                      background={symbolLayer.color}
                      color={hcl(symbolLayer.color).l < 55 ? "#fff" : "#000"}
                      value={formatNumberWithUnit(
                        symbolValue,
                        formatNumber,
                        symbolLayer?.measureDimension?.unit
                      )}
                      error={
                        formatSymbolError
                          ? ` ± ${formatSymbolError(interaction.d)}`
                          : null
                      }
                    />
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

interface TooltipRowProps {
  title: string;
  background: string;
  color: string;
  value: string;
  error: string | null;
}

const TooltipRow = (props: TooltipRowProps) => {
  const { title, background, color, value, error } = props;
  return (
    <>
      <Text as="div" variant="meta">
        {title}
      </Text>
      <Box
        sx={{
          borderRadius: "circle",
          px: 2,
          display: "inline-block",
          textAlign: "center",
        }}
        style={{ background, color }}
      >
        <Text as="div" variant="meta">
          {value}
          {error}
        </Text>
      </Box>
    </>
  );
};
