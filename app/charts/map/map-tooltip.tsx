import { Box, Typography } from "@mui/material";
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

import { MapState } from "@/charts/map/map-state";
import { convertRgbArrayToHex } from "@/charts/shared/colors";
import { TooltipBox } from "@/charts/shared/interaction/tooltip-box";
import { useChartState } from "@/charts/shared/use-chart-state";
import { useInteraction } from "@/charts/shared/use-interaction";
import {
  formatNumberWithUnit,
  useFormatNumber,
} from "@/configurator/components/ui-helpers";

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
  const areaColorProps = useMemo(() => {
    const color =
      areaValue !== null ? areaLayer.colorScale(areaValue) : "#dedede";
    const textColor = getTooltipTextColor(color);
    return {
      color,
      textColor,
    };
  }, [areaValue, areaLayer]);
  const symbolColorProps = useMemo(() => {
    const obs = interaction.d;
    const colors = symbolLayer.colors;
    const color = obs ? convertRgbArrayToHex(colors.getColor(obs)) : "#fff";
    const textColor = getTooltipTextColor(color);

    switch (colors.type) {
      case "fixed":
        return {
          type: "fixed",
          color,
          textColor,
          sameAsValue: false,
        } as const;
      case "categorical":
        return {
          type: "categorical",
          component: colors.component,
          value: obs ? (obs[colors.component.iri] as string) : null,
          error: null,
          color,
          textColor,
          sameAsValue: false,
        } as const;
      case "continuous":
        const rawValue = obs ? (obs[colors.component.iri] as number) : null;
        const rawError = obs ? colors.getFormattedError?.(obs) : null;
        return {
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
        } as const;
    }
  }, [
    interaction.d,
    symbolLayer.colors,
    symbolLayer.measureDimension?.iri,
    formatNumber,
  ]);

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
                ? areaLayer.getLabel(interaction.d)
                : symbolLayer.getLabel(interaction.d)}
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
                  {showAreaValue && (
                    <TooltipRow
                      title={areaLayer.measureLabel}
                      background={areaColorProps.color}
                      color={areaColorProps.textColor}
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

                  {showSymbolValue ? (
                    <>
                      {!symbolColorProps.sameAsValue && (
                        <TooltipRow
                          title={symbolLayer.measureLabel}
                          background={
                            symbolColorProps.type === "fixed"
                              ? symbolColorProps.color
                              : "#fff"
                          }
                          border={
                            symbolColorProps.type === "fixed"
                              ? undefined
                              : "1px solid #ccc"
                          }
                          color={
                            symbolColorProps.type === "fixed"
                              ? symbolColorProps.textColor
                              : "#000"
                          }
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
                      {symbolColorProps.type !== "fixed" && (
                        <TooltipRow
                          title={symbolColorProps.component.label}
                          background={symbolColorProps.color}
                          color={symbolColorProps.textColor}
                          value={symbolColorProps.value ?? ""}
                          error={symbolColorProps.error}
                        />
                      )}
                    </>
                  ) : null}
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
