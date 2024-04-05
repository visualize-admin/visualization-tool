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
  getChartConfig,
  isConfiguring,
  useConfiguratorState,
} from "@/configurator";
import { useLocale } from "@/locales/use-locale";
import { Palette, divergingPalettes, sequentialPalettes } from "@/palettes";
import useEvent from "@/utils/use-event";

// Adapted from https://observablehq.com/@mbostock/color-ramp

type ColorRampProps = {
  colorInterpolator: (t: number) => string;
  nSteps?: number;
  width?: number;
  height?: number;
  disabled?: boolean;
  rx?: number;
};

export const ColorRamp = (props: ColorRampProps) => {
  const {
    colorInterpolator,
    nSteps: _nSteps = 512,
    width = 220,
    height = 28,
    disabled,
    rx = 2,
  } = props;
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas && canvas.getContext("2d");

    if (ctx) {
      ctx.clearRect(0, 0, width, height);
      const [stepWidth, nSteps] =
        _nSteps > width ? [1, width] : [width / _nSteps, _nSteps];

      for (let i = 0; i < nSteps; ++i) {
        ctx.fillStyle = colorInterpolator(i / (nSteps - 1));
        ctx.fillRect(stepWidth * i, 0, stepWidth, height);
      }
    }
  }, [colorInterpolator, _nSteps, width, height, disabled, rx]);

  return (
    <canvas
      ref={ref}
      width={width}
      height={height}
      style={{
        borderRadius: `${rx}px`,
        imageRendering: "pixelated",
        opacity: disabled ? 0.5 : 1,
      }}
    />
  );
};

type ColorRampFieldProps = Omit<ColorRampProps, "colorInterpolator"> & {
  field: EncodingFieldType;
  path: string;
};

export const ColorRampField = (props: ColorRampFieldProps) => {
  const { field, path, disabled, nSteps } = props;
  const locale = useLocale();
  const [state, dispatch] = useConfiguratorState(isConfiguring);
  const chartConfig = getChartConfig(state);

  const { palettes, defaultPalette } = useMemo(() => {
    const palettes = [...sequentialPalettes, ...divergingPalettes];
    const defaultPalette = sequentialPalettes.find(
      (d) => d.value === "oranges"
    ) as Palette<"oranges">;

    return { palettes, defaultPalette };
  }, []);

  const currentPaletteName = get(chartConfig, `fields["${field}"].${path}`) as
    | DivergingPaletteType
    | SequentialPaletteType;

  const currentPalette =
    palettes.find((d) => d.value === currentPaletteName) || defaultPalette;

  const onSelectedItemChange: SelectProps<typeof currentPalette>["onChange"] =
    useEvent((ev) => {
      const value = ev.target.value as (typeof currentPalette)["value"];
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
        renderValue={({ interpolator }) => {
          return (
            <ColorRamp
              colorInterpolator={interpolator}
              nSteps={nSteps}
              disabled={disabled}
            />
          );
        }}
      >
        <ListSubheader>
          <Trans id="controls.color.palette.sequential">Sequential</Trans>
        </ListSubheader>
        {sequentialPalettes.map(({ value, interpolator }, i) => (
          <MenuItem
            sx={{ flexDirection: "column", alignItems: "flex-start" }}
            key={`sequential-${i}`}
            value={value}
          >
            <ColorRamp colorInterpolator={interpolator} nSteps={nSteps} />
          </MenuItem>
        ))}
        <ListSubheader>
          <Trans id="controls.color.palette.diverging">Diverging</Trans>
        </ListSubheader>
        {divergingPalettes.map(({ value, interpolator }, i) => (
          <MenuItem
            sx={{ flexDirection: "column", alignItems: "flex-start" }}
            key={`diverging-${i}`}
            value={value}
          >
            <ColorRamp colorInterpolator={interpolator} nSteps={nSteps} />
          </MenuItem>
        ))}
      </Select>
    </Box>
  );
};
