import { Box, Typography } from "@mui/material";
import { hcl } from "d3";
import {
  Dispatch,
  ReactNode,
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";

import { MapState } from "@/charts/map/map-state";
import { useChartState } from "@/charts/shared/chart-state";
import { rgbArrayToHex } from "@/charts/shared/colors";
import { TooltipBox } from "@/charts/shared/interaction/tooltip-box";
import useChartFormatters from "@/charts/shared/use-chart-formatters";
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

export const MapTooltip = () => {
  const [hoverObjectType] = useMapTooltip();
  const [{ interaction }] = useInteraction();
  const { identicalLayerComponentIris, areaLayer, symbolLayer } =
    useChartState() as MapState;
  const formatNumber = useFormatNumber();

  const { getFormattedError: formatSymbolError } = symbolLayer || {};
  const formatters = useChartFormatters({
    dimensions: [],
    measures: [
      areaLayer?.colors.component,
      symbolLayer?.measureDimension,
    ].filter(truthy),
  });

  const areaTooltipState = useMemo(() => {
    const obs = interaction.d;
    if (areaLayer && obs) {
      const { colors } = areaLayer;
      const value = colors.getValue(obs);
      if (value !== null) {
        const error =
          colors.type === "continuous" && colors.getFormattedError
            ? ` ± ${colors.getFormattedError(obs)}`
            : null;
        const show = identicalLayerComponentIris || hoverObjectType === "area";
        const color = rgbArrayToHex(colors.getColor(obs));
        const textColor = getTooltipTextColor(color);
        const valueFormatter = (d: number | null) =>
          formatNumberWithUnit(
            d,
            formatters[colors.component.iri] || formatNumber,
            colors.component.unit
          );
        const formattedValue =
          typeof value === "number" ? valueFormatter(value) : value;

        return {
          show,
          value: formattedValue,
          error,
          componentIri: colors.component.iri,
          label: colors.component.label,
          color,
          textColor,
        };
      }
    }
  }, [
    areaLayer,
    interaction.d,
    identicalLayerComponentIris,
    hoverObjectType,
    formatNumber,
    formatters,
  ]);

  const symbolTooltipState = useMemo(() => {
    const obs = interaction.d;
    if (symbolLayer && obs) {
      const { colors } = symbolLayer;
      const value = symbolLayer.getValue(obs);
      if (value !== null) {
        const error = formatSymbolError ? ` ± ${formatSymbolError(obs)}` : null;
        const show =
          identicalLayerComponentIris || hoverObjectType === "symbol";
        const color = rgbArrayToHex(colors.getColor(obs));
        const textColor = getTooltipTextColor(color);
        const valueFormatter = (d: number | null) =>
          formatNumberWithUnit(
            d,
            symbolLayer.measureDimension?.iri
              ? formatters[symbolLayer.measureDimension.iri] || formatNumber
              : formatNumber,
            symbolLayer.measureDimension?.unit
          );
        const formattedValue = valueFormatter(value);

        let preparedColors;

        if (colors.type === "fixed") {
          preparedColors = {
            type: "fixed" as "fixed",
            color,
            textColor,
            sameAsValue: false,
            error: null,
          };
        } else if (colors.type === "categorical") {
          preparedColors = {
            type: "categorical" as "categorical",
            component: colors.component,
            value: colors.getValue(obs),
            error: null,
            color,
            textColor,
            sameAsValue: false,
          };
        } else {
          const rawValue = obs[colors.component.iri] as number;
          const rawError = colors.getFormattedError?.(obs);
          preparedColors = {
            type: "continuous",
            component: colors.component,
            value: formatNumberWithUnit(
              rawValue,
              formatNumber,
              colors.component.unit
            ),
            error: rawError ? ` ± ${rawError}` : null,
            color,
            textColor,
            sameAsValue:
              colors.component.iri === symbolLayer.measureDimension?.iri,
          };
        }

        return {
          value: formattedValue,
          error,
          measureDimension: symbolLayer.measureDimension,
          show,
          color,
          textColor,
          colors: preparedColors,
        };
      }
    }
  }, [
    symbolLayer,
    interaction.d,
    formatSymbolError,
    identicalLayerComponentIris,
    hoverObjectType,
    formatNumber,
    formatters,
  ]);

  const showAreaColorTooltip = areaTooltipState?.show;
  const showSymbolMeasureTooltip =
    symbolTooltipState?.show &&
    (showAreaColorTooltip
      ? areaTooltipState!.componentIri !==
        symbolTooltipState.measureDimension?.iri
      : true);
  const showSymbolColorTooltip =
    symbolTooltipState &&
    symbolTooltipState.colors.type !== "fixed" &&
    (showSymbolMeasureTooltip
      ? symbolTooltipState.measureDimension?.iri !==
        symbolTooltipState.colors.component?.iri
      : showAreaColorTooltip &&
        areaTooltipState!.componentIri !==
          symbolTooltipState.colors.component?.iri);

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
            <Typography
              component="div"
              variant="caption"
              sx={{ fontWeight: "bold" }}
            >
              {hoverObjectType === "area"
                ? areaLayer?.getLabel(interaction.d)
                : symbolLayer?.getLabel(interaction.d)}
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
                      error={symbolTooltipState.colors.error}
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

type TooltipRowProps = {
  title: string;
  background: string;
  color: string;
  value: string;
  error: string | null;
  border?: string;
};

const TooltipRow = (props: TooltipRowProps) => {
  const { title, background, color, value, error, border = "none" } = props;
  return (
    <>
      <Typography component="div" variant="caption">
        {title}
      </Typography>
      <Box
        sx={{
          borderRadius: 9999,
          px: 2,
          display: "inline-block",
          textAlign: "center",
        }}
        style={{
          background,
          color,
          border,
        }}
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
