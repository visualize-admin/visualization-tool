import { hcl } from "d3";
import * as React from "react";
import { Box, Text, Grid } from "theme-ui";
import { useFormatNumber } from "../../configurator/components/ui-helpers";
import { TooltipBox } from "../shared/interaction/tooltip-box";
import { TooltipSingle } from "../shared/interaction/tooltip-content";
import { useChartState } from "../shared/use-chart-state";
import { useInteraction } from "../shared/use-interaction";
import { MapState } from "./map-state";

export const MapTooltip = () => {
  const [{ interaction }] = useInteraction();
  const {
    getFeatureLabel,
    areaLayer: { showAreaLayer, areaMeasureLabel, getValue, colorScale },
    symbolLayer: {
      showSymbolLayer,
      symbolMeasureLabel,
      getRadius,
      symbolColorScale,
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
            <Text variant="meta" sx={{ fontWeight: "bold" }}>
              {getFeatureLabel(interaction.d)}
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
              {showAreaLayer && (
                <>
                  <Text variant="meta">{areaMeasureLabel}</Text>
                  <Box
                    sx={{
                      borderRadius: "circle",
                      px: 2,
                      display: "inline-block",
                      textAlign: "center",
                    }}
                    style={{
                      background: colorScale(getValue(interaction.d)),
                      color:
                        hcl(colorScale(getValue(interaction.d))).l < 55
                          ? "#fff"
                          : "#000",
                    }}
                  >
                    <Text variant="meta">
                      {formatNumber(getValue(interaction.d))}
                    </Text>
                  </Box>
                </>
              )}
              {showSymbolLayer && (
                <>
                  <Text variant="meta">{symbolMeasureLabel}</Text>
                  <Box
                    sx={{
                      borderRadius: "circle",
                      px: 2,
                      display: "inline-block",
                      textAlign: "center",
                    }}
                    style={{
                      background: symbolColorScale(getValue(interaction.d)),
                    }}
                  >
                    <Text variant="meta" sx={{ color: "monochrome100" }}>
                      {formatNumber(getRadius(interaction.d))}
                    </Text>
                  </Box>
                </>
              )}
            </Grid>
          </Box>
        </TooltipBox>
      )}
    </>
  );
};
