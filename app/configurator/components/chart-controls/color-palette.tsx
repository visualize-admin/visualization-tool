import { Trans } from "@lingui/macro";
import {
  Box,
  Button,
  Divider,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import get from "lodash/get";
import { MouseEventHandler, useMemo, useState } from "react";

import { EncodingFieldType } from "@/charts/chart-config-ui-options";
import { hasDimensionColors } from "@/charts/shared/colors";
import { Flex } from "@/components/flex";
import { selectMenuProps } from "@/components/form";
import { Label } from "@/components/form";
import { getChartConfig } from "@/config-utils";
import {
  ConfiguratorStateConfiguringChart,
  CustomPaletteType,
  isColorInConfig,
  isConfiguring,
  useConfiguratorState,
} from "@/configurator";
import { ColorPaletteDrawerContent } from "@/configurator/components/chart-controls/drawer-color-palette-content";
import { ConfiguratorDrawer } from "@/configurator/components/drawers";
import { mapValueIrisToColor } from "@/configurator/components/ui-helpers";
import { Component, isNumericalMeasure } from "@/domain/data";
import { Icon } from "@/icons";
import { useUser } from "@/login/utils";
import {
  categoricalPalettes,
  DEFAULT_CATEGORICAL_PALETTE_ID,
  divergingSteppedPalettes,
  getDefaultCategoricalPalette,
  getPalette,
} from "@/palettes";
import { useEvent } from "@/utils/use-event";
import { useUserPalettes } from "@/utils/use-user-palettes";

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

  const handleChangePalette = useEvent((paletteId: string) => {
    handleChartConfigUpdate(paletteId);
  });

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
  const handleOpenCreateColorPalette: MouseEventHandler<HTMLElement> = useEvent(
    (e) => {
      setAnchorEl(e.currentTarget);
    }
  );

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

  const value = (() => {
    const valueToUse = currentPalette
      ? currentPalette.value
      : currentPaletteName;

    if (!isValidValue(valueToUse)) {
      return "";
    }

    return valueToUse;
  })();

  return (
    <Flex
      sx={{
        pointerEvents: disabled ? "none" : "auto",
        flexDirection: "column",
        gap: 1,
      }}
    >
      <div>
        <Label htmlFor="color-palette-toggle">
          <Trans id="controls.color.palette">Color palette</Trans>
        </Label>
        <Select
          size="sm"
          MenuProps={selectMenuProps}
          renderValue={(selected) => {
            if (!selected || !isValidValue(selected)) {
              return (
                <Trans id="controls.color.palette.select">
                  Select a color palette
                </Trans>
              );
            }

            return (
              // Key to reset the color squares when the palette changes,
              // otherwise the squares are duplicated
              <Flex key={currentPalette?.value} gap={0.5} flexWrap="wrap">
                {currentPalette
                  ? currentPalette.colors.map((color) => (
                      <ColorSquare
                        key={color}
                        color={color}
                        disabled={disabled}
                      />
                    ))
                  : customColorPalettes
                      ?.find(
                        (palette) => palette.paletteId === currentPaletteName
                      )
                      ?.colors.map((color) => (
                        <ColorSquare
                          key={color}
                          color={color}
                          disabled={disabled}
                        />
                      ))}
              </Flex>
            );
          }}
          value={value}
          displayEmpty
        >
          {user && (
            <MenuItem onClick={handleOpenCreateColorPalette}>
              <Button
                variant="text"
                size="sm"
                color="primary"
                sx={{
                  "&:hover": {
                    color: "primary.main",
                  },
                }}
              >
                <Trans id="login.profile.my-color-palettes.add">
                  Add color palette
                </Trans>
              </Button>
            </MenuItem>
          )}
          {customColorPalettes && customColorPalettes.length > 0 && (
            <Flex sx={{ flexDirection: "column", gap: 2, pt: 3 }}>
              <Typography
                variant="caption"
                sx={{ px: 4, color: "text.secondary", fontWeight: 700 }}
              >
                <Trans id="controls.custom-color-palettes">
                  Custom color palettes
                </Trans>
              </Typography>
              <Divider sx={{ width: "100%", height: 2 }} />
            </Flex>
          )}
          {customColorPalettes &&
            customColorPalettes?.length > 0 &&
            customColorPalettes
              .filter((palette) => palette.type === "categorical")
              .map((palette) => (
                <ColorPaletteMenuItem
                  key={palette.paletteId}
                  value={palette.paletteId}
                  label={palette.name}
                  colors={palette.colors}
                  selected={palette.paletteId === value}
                  onClick={() => handleChangePalette(palette.paletteId)}
                />
              ))}
          <Flex sx={{ flexDirection: "column", gap: 2, pt: 3 }}>
            <Typography
              variant="caption"
              sx={{ px: 4, color: "text.secondary", fontWeight: 700 }}
            >
              <Trans id="controls.visualize-color-palette">
                Visualize color palettes
              </Trans>
            </Typography>
            <Divider sx={{ width: "100%", height: 2 }} />
          </Flex>
          {palettes.map((palette) => (
            <ColorPaletteMenuItem
              key={palette.value}
              value={palette.value}
              label={palette.label}
              colors={palette.colors}
              selected={palette.value === value}
              onClick={() => handleChangePalette(palette.value)}
            />
          ))}
        </Select>
      </div>
      {component && (
        <ColorPaletteControls
          field={field}
          component={component}
          state={state}
          colorConfigPath={colorConfigPath}
          customColorPalettes={customColorPalettes}
        />
      )}
      <ConfiguratorDrawer open={!!anchorEl} hideBackdrop>
        <ColorPaletteDrawerContent
          onClose={(palette) => handleCloseCreateColorPalette(palette)}
          type="categorical"
          customColorPalettes={customColorPalettes}
        />
      </ConfiguratorDrawer>
    </Flex>
  );
};

const ColorPaletteMenuItem = ({
  value,
  label,
  colors,
  selected,
  onClick,
}: {
  value: string;
  label: string;
  colors: ReadonlyArray<string>;
  selected: boolean;
  onClick: () => void;
}) => {
  return (
    <MenuItem
      value={value}
      onClick={onClick}
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 1,
      }}
    >
      <Flex sx={{ flexDirection: "column", gap: 1, width: "100%" }}>
        <Typography component="div" variant="caption" color="text.primary">
          {label}
        </Typography>
        <Flex
          sx={{
            justifyContent: "space-between",
            alignItems: "center",
            gap: 1,
            width: "100%",
          }}
        >
          <Flex sx={{ gap: 0.5, flexWrap: "wrap" }}>
            {colors.map((c) => (
              <ColorSquare key={c} color={c} />
            ))}
          </Flex>
          <div
            style={{
              minWidth: 24,
              minHeight: 20,
            }}
          >
            {selected ? <Icon name="checkmark" size={20} /> : null}
          </div>
        </Flex>
      </Flex>
    </MenuItem>
  );
};

const useColorSquareStyles = makeStyles({
  root: {
    display: "inline-block",
    margin: 0,
    padding: 0,
    width: 20,
    height: 20,

    "&:first-of-type": {
      borderTopLeftRadius: "default",
      borderBottomLeftRadius: "default",
    },

    "&:last-of-type": {
      borderTopRightRadius: "default",
      borderBottomRightRadius: "default",
    },
  },
});

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
  customColorPalettes,
}: {
  field: string;
  colorConfigPath?: string;
  component: Component;
  state: ConfiguratorStateConfiguringChart;
  customColorPalettes: CustomPaletteType[] | undefined;
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
  const customPalette = useMemo(() => {
    return customColorPalettes?.find((p) => p.paletteId === paletteId);
  }, [customColorPalettes, paletteId]);

  const colorMapping = isColorInConfig(chartConfig)
    ? get(chartConfig, `fields.color.colorMapping`)
    : (get(
        chartConfig,
        `fields["${field}"].${
          colorConfigPath ? `${colorConfigPath}.` : ""
        }colorMapping`
      ) as Record<string, string> | undefined);

  const resetColorPalette = useEvent(() => {
    dispatch({
      type: "CHART_PALETTE_RESET",
      value: {
        field: isColorInConfig(chartConfig) ? "color" : field,
        colorConfigPath,
        colorMapping: mapValueIrisToColor({
          paletteId,
          dimensionValues: component.values,
          customPalette,
        }),
      },
    });
  });
  const shuffleColors = useEvent(() => {
    dispatch({
      type: "CHART_CONFIG_UPDATE_COLOR_MAPPING",
      value: {
        field: isColorInConfig(chartConfig) ? "color" : field,
        colorConfigPath,
        dimensionId: component.id,
        values: component.values,
        random: true,
        customPalette,
      },
    });
  });

  if (colorMapping) {
    const currentPalette = getPalette({
      paletteId,
      fallbackPalette: customPalette?.colors,
    });
    const colorMappingColors = Object.values(colorMapping);
    const nbMatchedColors = colorMappingColors.length;
    const matchedColorsInPalette = currentPalette.slice(0, nbMatchedColors);
    const same =
      matchedColorsInPalette.every((d, i) => d === colorMappingColors[i]) ||
      paletteId === "dimension";

    return (
      <Flex
        sx={{
          alignItems: "center",
          columnGap: 2,
          flexWrap: "wrap",
          color: "primary.main",
        }}
      >
        <Button
          variant="text"
          color="primary"
          size="xs"
          disabled={same}
          onClick={resetColorPalette}
        >
          <Trans id="controls.color.palette.reset">Reset color palette</Trans>
        </Button>
        •
        <Button
          variant="text"
          color="primary"
          size="xs"
          onClick={shuffleColors}
        >
          <Trans id="controls.filters.select.refresh-colors">
            Shuffle colors
          </Trans>
        </Button>
      </Flex>
    );
  } else {
    return null;
  }
};
