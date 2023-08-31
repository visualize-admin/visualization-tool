import { Trans } from "@lingui/macro";
import {
  Box,
  ListSubheader,
  MenuItem,
  Select,
  SelectProps,
} from "@mui/material";
import get from "lodash/get";
import { useEffect, useMemo, useRef } from "react";

import { EncodingFieldType } from "@/charts/chart-config-ui-options";
import { Label } from "@/components/form";
import {
  DivergingPaletteType,
  SequentialPaletteType,
  useConfiguratorState,
} from "@/configurator";
import { useLocale } from "@/locales/use-locale";
import { Palette, divergingPalettes, sequentialPalettes } from "@/palettes";
import useEvent from "@/utils/use-event";

// Adapted from https://observablehq.com/@mbostock/color-ramp

type ColorRampProps = {
  colorInterpolator: (t: number) => string;
  nbClass?: number;
  width?: number;
  height?: number;
  disabled?: boolean;
};

export const ColorRamp = ({
  colorInterpolator,
  nbClass = 512,
  width = 148,
  height = 28,
  disabled = false,
}: ColorRampProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas && canvas.getContext("2d");

    if (canvas && context) {
      context.clearRect(0, 0, width, height);
      canvas.style.imageRendering = "-moz-crisp-edges";
      canvas.style.imageRendering = "pixelated";
      canvas.style.borderRadius = "2px";
      canvas.style.opacity = disabled ? "0.5" : "1";

      const [widthPerClass, numberOfSteps] =
        nbClass > width ? [1, width] : [width / nbClass, nbClass];

      for (let i = 0; i < numberOfSteps; ++i) {
        context.fillStyle = colorInterpolator(i / (numberOfSteps - 1));
        context.fillRect(widthPerClass * i, 0, widthPerClass, height);
      }
    }
  }, [colorInterpolator, nbClass, width, height, disabled]);

  return <canvas ref={canvasRef} width={width} height={height} />;
};

type ColorRampFieldProps = Omit<ColorRampProps, "colorInterpolator"> & {
  field: EncodingFieldType;
  path: string;
};

export const ColorRampField = ({
  field,
  path,
  disabled,
  nbClass,
}: ColorRampFieldProps) => {
  const locale = useLocale();
  const [state, dispatch] = useConfiguratorState();

  const { palettes, defaultPalette } = useMemo(() => {
    const palettes = [...sequentialPalettes, ...divergingPalettes];
    const defaultPalette = sequentialPalettes.find(
      (d) => d.value === "oranges"
    ) as Palette<"oranges">;

    return { palettes, defaultPalette };
  }, []);

  const currentPaletteName = get(
    state,
    `chartConfig.fields.${field}.${path}`
  ) as DivergingPaletteType | SequentialPaletteType;

  const currentPalette =
    palettes.find((d) => d.value === currentPaletteName) || defaultPalette;

  const onSelectedItemChange: SelectProps<typeof currentPalette>["onChange"] =
    useEvent((ev) => {
      const value = ev.target.value as typeof currentPalette["value"];
      if (value) {
        dispatch({
          type: "CHART_OPTION_CHANGED",
          value: {
            locale,
            field,
            path,
            value,
          },
        });
      }
    });

  return (
    <Box pb={2} sx={{ pointerEvents: disabled ? "none" : "auto" }}>
      <Label smaller sx={{ mb: 1 }} htmlFor="color-palette">
        <Trans id="controls.color.palette">Color palette</Trans>
      </Label>
      <Select
        value={currentPalette}
        disabled={disabled}
        sx={{
          width: "100%",
          "& .MuiSelect-select": { height: "44px", width: "100%" },
        }}
        onChange={onSelectedItemChange}
        renderValue={(value) => {
          return (
            <Box mr={2}>
              <ColorRamp
                colorInterpolator={value.interpolator}
                nbClass={nbClass}
                disabled={disabled}
                width={220}
              />
            </Box>
          );
        }}
      >
        <ListSubheader>
          <Trans id="controls.color.palette.sequential">Sequential</Trans>
        </ListSubheader>
        {sequentialPalettes.map((d, i) => (
          <MenuItem
            sx={{ flexDirection: "column", alignItems: "flex-start" }}
            key={`sequential-${i}`}
            value={d.value}
          >
            <ColorRamp
              colorInterpolator={d.interpolator}
              nbClass={nbClass}
              width={220}
            />
          </MenuItem>
        ))}
        <ListSubheader>
          <Trans id="controls.color.palette.diverging">Diverging</Trans>
        </ListSubheader>
        {divergingPalettes.map((d, i) => (
          <MenuItem
            sx={{ flexDirection: "column", alignItems: "flex-start" }}
            key={`diverging-${i}`}
            value={d.value}
          >
            <ColorRamp
              colorInterpolator={d.interpolator}
              nbClass={nbClass}
              width={220}
            />
          </MenuItem>
        ))}
      </Select>
    </Box>
  );
};
