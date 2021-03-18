import * as React from "react";
import { Box, Text } from "theme-ui";
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
    areaLayer: { showAreaLayer, getValue },
    symbolLayer: { showSymbolLayer, getRadius },
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
          <Box sx={{ width: 200 }}>
            <Text variant="meta" sx={{ fontWeight: "bold" }}>
              {getFeatureLabel(interaction.d)}
            </Text>

            {/* {segment && <Text variant="meta">{segment}</Text>} */}
            {showAreaLayer && (
              <Text variant="meta">
                {formatNumber(getValue(interaction.d))}
              </Text>
            )}
            {showSymbolLayer && (
              <Text variant="meta">
                {formatNumber(getRadius(interaction.d))}
              </Text>
            )}

            {/* <TooltipSingle
              xValue={getLabel(interaction.d)}
              segment={""}
              yValue={formatNumber(getValue(interaction.d))}
            /> */}
          </Box>
        </TooltipBox>
      )}
    </>
  );
};
