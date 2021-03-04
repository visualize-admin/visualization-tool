import { interpolateOranges, scaleLinear } from "d3";
import * as React from "react";
import { useEffect, useRef } from "react";
import { Box, Flex, Text } from "theme-ui";
import {
  getColorInterpolator,
  useFormatNumber,
} from "../../configurator/components/ui-helpers";
import { useChartState } from "../shared/use-chart-state";
import { MapState } from "./map-state";

export const MapLegend = ({ legendTitle }: { legendTitle?: string }) => {
  const {
    paletteType,
    palette,
    nbSteps,
    dataDomain,
  } = useChartState() as MapState;
  const formatNumber = useFormatNumber();

  const WIDTH = 256;
  const RAMP_HEIGHT = 12;
  // const linearScale = scaleLinear().domain(dataDomain).range([0, WIDTH]);
  return (
    <Flex
      sx={{
        flexDirection: "column",
        justifyContent: "flex-start",
        m: 4,
        width: WIDTH,
      }}
    >
      {legendTitle && <Text variant="meta">{legendTitle}</Text>}
      {paletteType === "continuous" && (
        <>
          <Box sx={{ my: 1, width: WIDTH, height: RAMP_HEIGHT }}>
            <ColorRamp
              colorInterpolator={getColorInterpolator(palette)}
              nbSteps={WIDTH}
              width={WIDTH}
              height={RAMP_HEIGHT}
            />
          </Box>
          <Flex sx={{ justifyContent: "space-between" }}>
            <Text variant="meta">{formatNumber(dataDomain[0])}</Text>
            <Text variant="meta">{formatNumber(dataDomain[1])}</Text>
          </Flex>
        </>
      )}
      {paletteType === "discrete" && <Box></Box>}
    </Flex>
  );
};

const ColorRamp = ({
  colorInterpolator = interpolateOranges,
  nbSteps,
  width,
  height,
}: {
  colorInterpolator: (t: number) => string;
  nbSteps: number;
  width: number;
  height: number;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas && canvas.getContext("2d");
    if (canvas && context) {
      context.clearRect(0, 0, width, height);
      canvas.style.imageRendering = "-moz-crisp-edges";
      canvas.style.imageRendering = "pixelated";

      for (let i = 0; i < nbSteps; ++i) {
        context.fillStyle = colorInterpolator(i / (nbSteps - 1));
        context.fillRect(i, 0, 1, height);
      }
    }
  });

  return <canvas ref={canvasRef} />;
};
