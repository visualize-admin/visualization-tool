import { Trans } from "@lingui/macro";
import {
  Box,
  Button,
  Divider,
  MenuItem,
  Select,
  SelectProps,
  Theme,
  Typography,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import get from "lodash/get";
import { useCallback } from "react";

import { hasDimensionColors } from "@/charts/shared/colors";
import Flex from "@/components/flex";
import { Label } from "@/components/form";
import {
  ConfiguratorStateConfiguringChart,
  getChartConfig,
  isColorInConfig,
  isConfiguring,
  useConfiguratorState,
} from "@/configurator";
import { mapValueIrisToColor } from "@/configurator/components/ui-helpers";
import { Component, isNumericalMeasure } from "@/domain/data";
import {
  DEFAULT_CATEGORICAL_PALETTE_ID,
  categoricalPalettes,
  divergingSteppedPalettes,
  getDefaultCategoricalPalette,
  getPalette,
} from "@/palettes";
import useEvent from "@/utils/use-event";

const useStyles = makeStyles({
  root: {
    width: "100%",
  },
  select: {
    "&.MuiSelect-select": {
      padding: "0 0.75rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-start",
    },
  },
});

type Props = {
  field: string;
  disabled?: boolean;
  colorConfigPath?: string;
  component?: Component;
};

export const ColorPalette = ({
  field,
  disabled,
  colorConfigPath,
  component,
}: Props) => {
  const [state, dispatch] = useConfiguratorState(isConfiguring);
  const chartConfig = getChartConfig(state);
  const classes = useStyles();
  const hasColors = hasDimensionColors(component);
  const defaultPalette =
    hasColors && component
      ? getDefaultCategoricalPalette(
          component.values.map((d) => d.color).filter(Boolean) as string[]
        )
      : null;

  const palettes = isNumericalMeasure(component)
    ? divergingSteppedPalettes
    : defaultPalette
      ? [defaultPalette, ...categoricalPalettes]
      : categoricalPalettes;

  const currentPaletteName = isColorInConfig(chartConfig)
    ? get(chartConfig, `fields.color.paletteId`)
    : get(
        chartConfig,
        `fields["${chartConfig.activeField}"].${
          colorConfigPath ? `${colorConfigPath}.` : ""
        }palette`
      );

  const currentPalette =
    palettes.find((p) => p.value === currentPaletteName) ?? palettes[0];

  const handleChangePalette: SelectProps["onChange"] = useEvent((ev) => {
    const palette = palettes.find((p) => p.value === ev.target.value);
    if (!component || !palette) {
      return;
    }
    if (isColorInConfig(chartConfig)) {
      dispatch({
        type: "COLOR_FIELD_SET",
        value:
          chartConfig.fields.color.type === "single"
            ? {
                type: chartConfig.fields.color.type,
                paletteId: palette.value,
                color: palette.colors[0],
              }
            : {
                type: chartConfig.fields.color.type,
                paletteId: palette.value,
                colorMapping: mapValueIrisToColor({
                  paletteId: palette.value,
                  dimensionValues: component.values,
                }),
              },
      });
    } else {
      dispatch({
        type: "CHART_PALETTE_CHANGED",
        value: {
          field,
          colorConfigPath,
          paletteId: palette.value,
          colorMapping: mapValueIrisToColor({
            paletteId: palette.value,
            dimensionValues: component.values,
          }),
        },
      });
    }
  });

  return (
    <Box mt={2} sx={{ pointerEvents: disabled ? "none" : "auto" }}>
      <Label smaller htmlFor="color-palette-toggle" sx={{ mb: 1 }}>
        <Trans id="controls.color.palette">Color palette</Trans>
      </Label>
      <Select
        className={classes.root}
        classes={classes}
        renderValue={() => {
          return (
            <Flex>
              {currentPalette.colors.map((color: string) => (
                <ColorSquare key={color} color={color} disabled={disabled} />
              ))}
            </Flex>
          );
        }}
        value={currentPalette.value}
        onChange={handleChangePalette}
      >
        <Button
          variant="text"
          sx={{
            width: "100%",
            paddingY: "12px",
            paddingX: "16px",
          }}
        >
          Add color palette
        </Button>
        <Box
          sx={{
            paddingTop: "12px",
            paddingX: "16px",
            display: "flex",
            gap: "8px",
            flexDirection: "column",
          }}
        >
          <Typography variant="caption" fontWeight={700} align="left">
            Visualize color palattes
          </Typography>
          <Divider sx={{ width: "100%", paddingY: "4px" }} />
        </Box>
        {palettes.map((palette, index) => (
          <MenuItem
            sx={{ paddingY: "8px" }}
            key={`${palette.value}${index}`}
            value={palette.value}
          >
            <Flex sx={{ flexDirection: "column", gap: "4px" }}>
              <Typography component="div" variant="caption">
                {palette.label}
              </Typography>
              <Flex>
                {palette.colors.map((color) => (
                  <ColorSquare
                    key={`option-${color}`}
                    color={color}
                    disabled={false}
                  />
                ))}
              </Flex>
            </Flex>
          </MenuItem>
        ))}
      </Select>
      {component && (
        <ColorPaletteControls
          field={field}
          component={component}
          state={state}
          colorConfigPath={colorConfigPath}
        />
      )}
    </Box>
  );
};

const useColorSquareStyles = makeStyles((theme: Theme) => ({
  root: {
    display: "inline-block",
    margin: 0,
    padding: 0,
    width: 20,
    height: 20,
    borderColor: theme.palette.grey[100],
    borderWidth: "1px",
    borderStyle: "solid",
    "&:first-of-type": {
      borderTopLeftRadius: "default",
      borderBottomLeftRadius: "default",
    },
    "&:last-of-type": {
      borderTopRightRadius: "default",
      borderBottomRightRadius: "default",
    },
  },
}));

export const ColorSquare = ({
  disabled,
  color,
}: {
  disabled?: boolean;
  color: string;
}) => {
  const classes = useColorSquareStyles();
  return (
    <Box
      className={classes.root}
      sx={{
        backgroundColor: disabled ? "grey.300" : color,
      }}
    />
  );
};

export const ColorPaletteControls = ({
  field,
  colorConfigPath,
  component,
  state,
}: {
  field: string;
  colorConfigPath?: string;
  component: Component;
  state: ConfiguratorStateConfiguringChart;
}) => {
  const [, dispatch] = useConfiguratorState();
  const chartConfig = getChartConfig(state);

  const paletteId = isColorInConfig(chartConfig) ?  get(chartConfig, `fields.color.paletteId`) :  get(
    chartConfig,
    `fields["${field}"].${colorConfigPath ? `${colorConfigPath}.` : ""}paletteId`,
    DEFAULT_CATEGORICAL_PALETTE_ID
  ) as string;

  const colorMapping = isColorInConfig(chartConfig) ? get(chartConfig, `fields.color.colorMapping`) :  get(
    chartConfig,
    `fields["${field}"].${
      colorConfigPath ? `${colorConfigPath}.` : ""
    }colorMapping`
  ) as Record<string, string> | undefined;

  const resetColorPalette = useCallback(
    () =>
      dispatch({
        type: "CHART_PALETTE_RESET",
        value: {
          field,
          colorConfigPath,
          colorMapping: mapValueIrisToColor({
            paletteId,
            dimensionValues: component.values,
          }),
        },
      }),
    [colorConfigPath, component, dispatch, field, paletteId]
  );

  if (colorMapping) {
    const currentPalette = getPalette(paletteId);
    const colorMappingColors = Object.values(colorMapping);

    const nbMatchedColors = colorMappingColors.length;
    const matchedColorsInPalette = currentPalette.slice(0, nbMatchedColors);
    const same =
      matchedColorsInPalette.every((d, i) => d === colorMappingColors[i]) ||
      paletteId === "dimension";

    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
        <Button
          disabled={same}
          onClick={resetColorPalette}
          variant="inline"
          sx={{ px: 1 }}
        >
          <Trans id="controls.color.palette.reset">Reset color palette</Trans>
        </Button>
        <Typography color="secondary">•</Typography>
        <Button
          onClick={() => {
            return dispatch({
              type: "CHART_CONFIG_UPDATE_COLOR_MAPPING",
              value: {
                field,
                colorConfigPath,
                dimensionId: component.id,
                values: component.values,
                random: true,
              },
            });
          }}
          variant="inline"
          sx={{ px: 1 }}
        >
          <Trans id="controls.filters.select.refresh-colors">
            Shuffle colors
          </Trans>
        </Button>
      </Box>
    );
  } else {
    return <Box mt={2} />;
  }
};
