import { Trans } from "@lingui/macro";
import {
  Box,
  Button,
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
import { getChartConfig } from "@/config-utils";
import {
  ConfiguratorStateConfiguringChart,
  isConfiguring,
  useConfiguratorState,
} from "@/configurator";
import { mapValueIrisToColor } from "@/configurator/components/ui-helpers";
import { Component, isNumericalMeasure } from "@/domain/data";
import {
  categoricalPalettes,
  DEFAULT_CATEGORICAL_PALETTE_NAME,
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

  const currentPaletteName = get(
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

    dispatch({
      type: "CHART_PALETTE_CHANGED",
      value: {
        field,
        colorConfigPath,
        palette: palette.value,
        colorMapping: mapValueIrisToColor({
          palette: palette.value,
          dimensionValues: component.values,
        }),
      },
    });
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
        {palettes.map((palette, index) => (
          <MenuItem key={`${palette.value}${index}`} value={palette.value}>
            <div>
              <Typography component="div" variant="caption">
                {palette.label}
              </Typography>
              <div>
                {palette.colors.map((color) => (
                  <ColorSquare
                    key={`option-${color}`}
                    color={color}
                    disabled={false}
                  />
                ))}
              </div>
            </div>
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

const ColorSquare = ({
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

const ColorPaletteControls = ({
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

  const palette = get(
    chartConfig,
    `fields["${field}"].${colorConfigPath ? `${colorConfigPath}.` : ""}palette`,
    DEFAULT_CATEGORICAL_PALETTE_NAME
  ) as string;

  const colorMapping = get(
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
            palette,
            dimensionValues: component.values,
          }),
        },
      }),
    [colorConfigPath, component, dispatch, field, palette]
  );

  if (colorMapping) {
    // Compare palette colors & colorMapping colors
    const currentPalette = getPalette(palette);
    const colorMappingColors = Object.values(colorMapping);

    const nbMatchedColors = colorMappingColors.length;
    const matchedColorsInPalette = currentPalette.slice(0, nbMatchedColors);
    const same =
      matchedColorsInPalette.every((d, i) => d === colorMappingColors[i]) ||
      palette === "dimension";

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
