import { Trans } from "@lingui/macro";
import {
  Box,
  Button,
  Divider,
  Grid,
  MenuItem,
  Select,
  SelectProps,
  Theme,
  Typography,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import get from "lodash/get";
import { MouseEventHandler, useCallback, useState } from "react";

import { EncodingFieldType } from "@/charts/chart-config-ui-options";
import { hasDimensionColors } from "@/charts/shared/colors";
import Flex from "@/components/flex";
import { Label } from "@/components/form";
import { getChartConfig } from "@/config-utils";
import {
  ConfiguratorStateConfiguringChart,
  CustomPaletteType,
  isColorInConfig,
  isConfiguring,
  useConfiguratorState,
} from "@/configurator";
import { mapValueIrisToColor } from "@/configurator/components/ui-helpers";
import { Component, isNumericalMeasure } from "@/domain/data";
import { useUser } from "@/login/utils";
import {
  categoricalPalettes,
  DEFAULT_CATEGORICAL_PALETTE_ID,
  divergingSteppedPalettes,
  getDefaultCategoricalPalette,
  getPalette,
} from "@/palettes";
import useEvent from "@/utils/use-event";
import { useUserPalettes } from "@/utils/use-user-palettes";

import { ConfiguratorDrawer } from "../drawer";

import { ColorPaletteDrawerContent } from "./drawer-color-palette-content";

const useStyles = makeStyles({
  root: {
    width: "100%",
    padding: "8px 0px",
  },
  select: {
    "&.MuiSelect-select": {
      padding: "0 0.75rem",
      height: "auto",
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-start",
    },
  },
});

type Props = {
  field: EncodingFieldType;
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
  const user = useUser();

  const { data: customColorPalettes, invalidate } = useUserPalettes();

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
        }paletteId`
      );

  const currentPalette = palettes.find((p) => p.value === currentPaletteName);

  const handleChangePalette: SelectProps["onChange"] = useEvent((ev) =>
    handleChartConfigUpdate(ev.target.value as string)
  );

  const handleChartConfigUpdate = (
    value?: string,
    selectedPalette?: CustomPaletteType
  ) => {
    if (!component) {
      return;
    }

    const regularPalette = palettes.find((p) => p.value === value);
    const customPalette =
      customColorPalettes?.find((p) => p.paletteId === value) ||
      selectedPalette;

    if (customPalette) {
      const colorMapping = mapValueIrisToColor({
        paletteId: customPalette.paletteId,
        dimensionValues: component.values,
        customPalette,
      });

      if (isColorInConfig(chartConfig)) {
        dispatch({
          type: "COLOR_FIELD_SET",
          value:
            chartConfig.fields.color.type === "single"
              ? {
                  type: chartConfig.fields.color.type,
                  paletteId: customPalette.paletteId,
                  color: customPalette.colors[0],
                }
              : {
                  type: chartConfig.fields.color.type,
                  paletteId: customPalette.paletteId,
                  colorMapping,
                },
        });
      } else {
        dispatch({
          type: "CHART_PALETTE_CHANGED",
          value: {
            field,
            colorConfigPath,
            paletteId: customPalette.paletteId,
            colorMapping,
          },
        });
      }
      return;
    }

    if (!regularPalette) {
      return;
    }

    if (isColorInConfig(chartConfig)) {
      dispatch({
        type: "COLOR_FIELD_SET",
        value:
          chartConfig.fields.color.type === "single"
            ? {
                type: chartConfig.fields.color.type,
                paletteId: regularPalette.value,
                color: regularPalette.colors[0],
              }
            : {
                type: chartConfig.fields.color.type,
                paletteId: regularPalette.value,
                colorMapping: mapValueIrisToColor({
                  paletteId: regularPalette.value,
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
          paletteId: regularPalette.value,
          colorMapping: mapValueIrisToColor({
            paletteId: regularPalette.value,
            dimensionValues: component.values,
          }),
        },
      });
    }
  };

  const [anchorEl, setAnchorEl] = useState<HTMLElement>();
  const handleOpenCreateColorPalette: MouseEventHandler<HTMLButtonElement> =
    useEvent((ev) => {
      setAnchorEl(ev.currentTarget);
    });

  const handleCloseCreateColorPalette = useEvent(
    (palette?: CustomPaletteType) => {
      invalidate();
      setAnchorEl(undefined);

      handleChartConfigUpdate(palette?.paletteId, palette);

      anchorEl?.focus();
    }
  );

  const isValidValue = (value: string) => {
    const isPaletteValue = palettes.some((p) => p.value === value);
    const isCustomPaletteValue = customColorPalettes?.some(
      (p) => p.paletteId === value
    );
    return isPaletteValue || isCustomPaletteValue;
  };

  return (
    <Box mt={2} sx={{ pointerEvents: disabled ? "none" : "auto" }}>
      <Label smaller htmlFor="color-palette-toggle" sx={{ mb: 1 }}>
        <Trans id="controls.color.palette">Color palette</Trans>
      </Label>
      <Select
        className={classes.root}
        classes={classes}
        renderValue={(selected) => {
          if (!selected || !isValidValue(selected)) {
            return (
              <Typography color={"secondary.active"} variant="body2">
                <Trans id="controls.color.palette.select">
                  Select a color palette
                </Trans>
              </Typography>
            );
          }
          return (
            <Grid
              container
              spacing={1}
              sx={{
                alignItems: "center",
                "& .MuiGrid-item": {
                  display: "flex",
                  alignItems: "center",
                },
              }}
            >
              {currentPalette
                ? currentPalette.colors.map((color: string) => (
                    <Grid item key={color}>
                      <ColorSquare color={color} disabled={disabled} />
                    </Grid>
                  ))
                : customColorPalettes
                    ?.find(
                      (palette) => palette.paletteId === currentPaletteName
                    )
                    ?.colors.map((color, i) => (
                      <Grid item key={`color-palette-tile-${i}`}>
                        <ColorSquare
                          color={color as string}
                          disabled={disabled}
                        />
                      </Grid>
                    ))}
            </Grid>
          );
        }}
        value={(() => {
          const valueToUse = currentPalette
            ? currentPalette.value
            : currentPaletteName;

          if (!isValidValue(valueToUse)) {
            return "";
          }

          return valueToUse;
        })()}
        displayEmpty
        onChange={handleChangePalette}
      >
        {user && (
          <Button
            onClick={handleOpenCreateColorPalette}
            variant="text"
            sx={{
              width: "100%",
              paddingY: 3,
              paddingX: 4,
            }}
          >
            <Trans id="login.profile.my-color-palettes.add">
              Add color palette
            </Trans>
          </Button>
        )}
        {customColorPalettes && customColorPalettes.length > 0 && (
          <Box
            sx={{
              paddingTop: 3,
              paddingX: 4,
              display: "flex",
              gap: 2,
              flexDirection: "column",
            }}
          >
            <Typography variant="caption" fontWeight={700} align="left">
              <Trans id="controls.custom-color-palettes">
                Custom color palettes
              </Trans>
            </Typography>
            <Divider sx={{ width: "100%", paddingY: 1 }} />
          </Box>
        )}
        {customColorPalettes &&
          customColorPalettes?.length > 0 &&
          customColorPalettes
            .filter((palette) => palette.type === "categorical")
            .map((palette, index) => (
              <MenuItem
                sx={{ paddingY: 2 }}
                key={`${palette.paletteId}${index}`}
                value={palette.paletteId}
              >
                <Flex sx={{ flexDirection: "column", gap: "4px" }}>
                  <Typography component="div" variant="caption">
                    {palette.name}
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

        <Box
          sx={{
            paddingTop: 3,
            paddingX: 4,
            display: "flex",
            gap: 2,
            flexDirection: "column",
          }}
        >
          <Typography variant="caption" fontWeight={700} align="left">
            <Trans id="controls.visualize-color-palette">
              Visualize color palettes
            </Trans>
          </Typography>
          <Divider sx={{ width: "100%", paddingY: 1 }} />
        </Box>
        {palettes.map((palette, index) => (
          <MenuItem
            sx={{ paddingY: 2 }}
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
      <ConfiguratorDrawer open={!!anchorEl} hideBackdrop>
        <ColorPaletteDrawerContent
          onClose={(palette) => handleCloseCreateColorPalette(palette)}
          type="categorical"
          customColorPalettes={customColorPalettes}
        />
      </ConfiguratorDrawer>
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
      data-testid="select-color-square"
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

  const paletteId = isColorInConfig(chartConfig)
    ? get(chartConfig, `fields.color.paletteId`)
    : (get(
        chartConfig,
        `fields["${field}"].${colorConfigPath ? `${colorConfigPath}.` : ""}paletteId`,
        DEFAULT_CATEGORICAL_PALETTE_ID
      ) as string);

  const colorMapping = isColorInConfig(chartConfig)
    ? get(chartConfig, `fields.color.colorMapping`)
    : (get(
        chartConfig,
        `fields["${field}"].${
          colorConfigPath ? `${colorConfigPath}.` : ""
        }colorMapping`
      ) as Record<string, string> | undefined);

  const resetColorPalette = useCallback(
    () =>
      dispatch({
        type: "CHART_PALETTE_RESET",
        value: {
          field: isColorInConfig(chartConfig) ? "color" : field,
          colorConfigPath,
          colorMapping: mapValueIrisToColor({
            paletteId,
            dimensionValues: component.values,
          }),
        },
      }),
    [colorConfigPath, component, dispatch, field, paletteId, chartConfig]
  );

  if (colorMapping) {
    const currentPalette = getPalette({ paletteId });
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
                field: isColorInConfig(chartConfig) ? "color" : field,
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
