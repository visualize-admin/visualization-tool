import { useEffect, useRef } from "react";
import { interpolateOranges } from "d3";
// Adapted from https://observablehq.com/@mbostock/color-ramp
export const ColorRamp = ({
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
      for (let i = 0; i < nbSteps; ++i) {
        context.fillStyle = colorInterpolator(i / (nbSteps - 1));

        context.fillRect((width / nbSteps) * i, 0, width / nbSteps, height);
      }
    }
  });

  return <canvas ref={canvasRef} />;
};
