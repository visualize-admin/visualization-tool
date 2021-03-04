import { interpolateOranges } from "d3";
import * as React from "react";
import { useEffect, useRef } from "react";
import { Box, Text } from "theme-ui";
import { getColorInterpolator } from "../../configurator/components/ui-helpers";
import { useChartState } from "../shared/use-chart-state";
import { MapState } from "./map-state";

export const MapLegend = () => {
  const { paletteType, palette, nbSteps } = useChartState() as MapState;

  return (
    <Box sx={{ m: 4 }}>
      <Text>Mesaure</Text>
      <ColorRamp
        colorInterpolator={getColorInterpolator(palette)}
        nbSteps={paletteType === "discrete" ? nbSteps : 512}
        height={50}
      />
    </Box>
  );
};

const ColorRamp = ({
  colorInterpolator = interpolateOranges,
  nbSteps = 512,
  width = 288,
  height = 40,
}: {
  colorInterpolator: (t: number) => string;
  nbSteps: number;
  width?: number;
  height?: number;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Clear by returning a function from usEEFFECT?
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas && canvas.getContext("2d");
    if (canvas && context) {
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      canvas.style.imageRendering = "-moz-crisp-edges";
      canvas.style.imageRendering = "pixelated";
      context.clearRect(0, 0, width, height);
      for (let i = 0; i < nbSteps; ++i) {
        context.fillStyle = colorInterpolator(i / (nbSteps - 1));
        context.fillRect((width / nbSteps) * i, 0, width / nbSteps, height);
      }
    }
  });

  return <canvas ref={canvasRef} />;
};
