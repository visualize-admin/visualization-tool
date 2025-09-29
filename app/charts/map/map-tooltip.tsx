import { Box, Typography } from "@mui/material";
import { hcl } from "d3-color";
import {
  createContext,
  Dispatch,
  ReactNode,
  useContext,
  useMemo,
  useState,
} from "react";

import { MapState } from "@/charts/map/map-state";
import { useChartState } from "@/charts/shared/chart-state";
import { rgbArrayToHex } from "@/charts/shared/colors";
import { TooltipBox } from "@/charts/shared/interaction/tooltip-box";
import { useChartFormatters } from "@/charts/shared/use-chart-formatters";
import { useInteraction } from "@/charts/shared/use-interaction";
import { truthy } from "@/domain/types";
import { formatNumberWithUnit, useFormatNumber } from "@/formatters";

export type HoverObjectType = "area" | "symbol";

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

const isTooltipValueValid = (
  v: string | number | null
): v is number | string => {
  return v !== null && (typeof v === "number" ? !isNaN(v) : true);
};

export const MapTooltip = () => {
  const [hoverObjectType] = useMapTooltip();
  const [interaction] = useInteraction();
  const { identicalLayerComponentIds, areaLayer, symbolLayer } =
    useChartState() as MapState;
  const formatNumber = useFormatNumber();

  const { getFormattedError: formatSymbolError } = symbolLayer ?? {};
  const formatters = useChartFormatters({
    dimensions: [
      areaLayer?.colors.type === "continuous"
        ? null
        : areaLayer?.colors.component,
    ].filter(truthy),
    measures: [
      areaLayer?.colors.type === "continuous"
        ? areaLayer?.colors.component
        : null,
      symbolLayer?.measureDimension,
    ].filter(truthy),
  });

  const areaTooltipState = useMemo(() => {
    if (areaLayer && interaction.observation) {
      const { colors } = areaLayer;
      const value = colors.getValue(interaction.observation);

      if (isTooltipValueValid(value)) {
        const show = identicalLayerComponentIds || hoverObjectType === "area";
        const color = rgbArrayToHex(colors.getColor(interaction.observation));
        const textColor = getTooltipTextColor(color);
        const valueFormatter = (d: number | null) => {
          return formatNumberWithUnit(
            d,
            formatters[colors.component.id] ?? formatNumber,
            colors.component.unit
          );
        };

        return {
          show,
          value: typeof value === "number" ? valueFormatter(value) : value,
          error:
            colors.type === "continuous"
              ? colors.getFormattedError?.(interaction.observation)
              : null,
          componentId: colors.component.id,
          label: colors.component.label,
          color,
          textColor,
        };
      }
    }
  }, [
    interaction.observation,
    areaLayer,
    identicalLayerComponentIds,
    hoverObjectType,
    formatters,
    formatNumber,
  ]);

  const symbolTooltipState = useMemo(() => {
    const { observation } = interaction;

    if (symbolLayer && observation) {
      const { colors } = symbolLayer;
      const value = symbolLayer.getValue(observation);

      if (isTooltipValueValid(value)) {
        const show = identicalLayerComponentIds || hoverObjectType === "symbol";
        const color = rgbArrayToHex(colors.getColor(observation));
        const textColor = getTooltipTextColor(color);
        const valueFormatter = (d: number | null) => {
          return formatNumberWithUnit(
            d,
            symbolLayer.measureDimension?.id
              ? (formatters[symbolLayer.measureDimension.id] ?? formatNumber)
              : formatNumber,
            symbolLayer.measureDimension?.unit
          );
        };

        let preparedColors;

        if (colors.type === "fixed") {
          preparedColors = {
            type: "fixed" as const,
            color,
            textColor,
            sameAsValue: false,
            error: null,
          };
        } else if (colors.type === "categorical") {
          preparedColors = {
            type: "categorical" as const,
            component: colors.component,
            value: colors.getValue(observation),
            error: null,
            color,
            textColor,
            sameAsValue: false,
          };
        } else {
          const rawValue = observation[colors.component.id] as number;
          const formattedError = colors.getFormattedError?.(observation);
          preparedColors = {
            type: "continuous",
            component: colors.component,
            value: formatNumberWithUnit(
              rawValue,
              formatNumber,
              colors.component.unit
            ),
            error: formattedError,
            color,
            textColor,
            sameAsValue:
              colors.component.id === symbolLayer.measureDimension?.id,
          };
        }

        return {
          value: valueFormatter(value),
          error: formatSymbolError?.(observation),
          measureDimension: symbolLayer.measureDimension,
          show,
          color,
          textColor,
          colors: preparedColors,
        };
      }
    }
  }, [
    interaction,
    symbolLayer,
    identicalLayerComponentIds,
    hoverObjectType,
    formatSymbolError,
    formatters,
    formatNumber,
  ]);

  const showAreaColorTooltip = areaTooltipState?.show;
  const showSymbolMeasureTooltip =
    symbolTooltipState?.show &&
    (showAreaColorTooltip
      ? areaTooltipState!.componentId !==
        symbolTooltipState.measureDimension?.id
      : true);
  const showSymbolColorTooltip =
    symbolTooltipState &&
    symbolTooltipState.colors.type !== "fixed" &&
    (showSymbolMeasureTooltip
      ? symbolTooltipState.measureDimension?.id !==
        symbolTooltipState.colors.component?.id
      : showAreaColorTooltip &&
        areaTooltipState!.componentId !==
          symbolTooltipState.colors.component?.id);

  return (
    <>
      {interaction.type === "tooltip" &&
        interaction.mouse &&
        interaction.observation && (
          <TooltipBox
            x={interaction.mouse.x}
            y={interaction.mouse.y - 20}
            placement={{ x: "center", y: "top" }}
            margins={{ bottom: 0, left: 0, right: 0, top: 0 }}
          >
            <Box sx={{ minWidth: 200 }}>
              <Typography
                component="div"
                variant="caption"
                sx={{ fontWeight: "bold" }}
              >
                {hoverObjectType === "area"
                  ? areaLayer?.getLabel(interaction.observation)
                  : symbolLayer?.getLabel(interaction.observation)}
              </Typography>
              <Box
                display="grid"
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
                    {areaTooltipState && showAreaColorTooltip && (
                      <TooltipRow
                        title={areaTooltipState.label}
                        background={areaTooltipState.color}
                        color={areaTooltipState.textColor}
                        value={areaTooltipState.value}
                        error={areaTooltipState.error}
                      />
                    )}

                    {symbolTooltipState && showSymbolMeasureTooltip && (
                      <TooltipRow
                        title={symbolTooltipState.measureDimension?.label || ""}
                        {...(symbolTooltipState.colors.type === "fixed"
                          ? {
                              background: symbolTooltipState.color,
                              border: undefined,
                              color: symbolTooltipState.textColor,
                            }
                          : {
                              background: "#fff",
                              border: "1px solid #ccc",
                              color: "#000",
                            })}
                        value={symbolTooltipState.value}
                        error={symbolTooltipState.error}
                      />
                    )}

                    {symbolTooltipState && showSymbolColorTooltip && (
                      <TooltipRow
                        title={symbolTooltipState.colors.component?.label || ""}
                        background={symbolTooltipState.color}
                        color={symbolTooltipState.textColor}
                        value={symbolTooltipState.colors.value ?? ""}
                        error={symbolTooltipState.colors.error}
                      />
                    )}
                  </>
                }
              </Box>
            </Box>
          </TooltipBox>
        )}
    </>
  );
};

const TooltipRow = ({
  title,
  background,
  color,
  value,
  error,
  border = "none",
}: {
  title: string;
  background: string;
  color: string;
  value: string;
  error?: string | null;
  border?: string;
}) => {
  return (
    <>
      <Typography component="div" variant="caption">
        {title}
      </Typography>
      <Box
        style={{
          display: "inline-block",
          border,
          borderRadius: 9999,
          background,
          color,
          textAlign: "center",
        }}
        sx={{ px: 2 }}
      >
        <Typography component="div" variant="caption">
          {value}
          {error}
        </Typography>
      </Box>
    </>
  );
};

const getTooltipTextColor = (color: string) => {
  return hcl(color).l < 55 ? "#fff" : "#000";
};
