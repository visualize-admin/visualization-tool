import { t, Trans } from "@lingui/macro";
import {
  Box,
  Button,
  Divider,
  IconButton,
  MenuItem,
  Select,
  SelectProps,
  Theme,
  Typography,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import get from "lodash/get";
import dynamic from "next/dynamic";
import { forwardRef, MouseEventHandler, useCallback, useState } from "react";

import { EncodingFieldType } from "@/charts/chart-config-ui-options";
import { hasDimensionColors } from "@/charts/shared/colors";
import { LegendItem, LegendSymbol } from "@/charts/shared/legend-color";
import Flex from "@/components/flex";
import { Input, Label } from "@/components/form";
import { getChartConfig } from "@/config-utils";
import {
  ConfiguratorStateConfiguringChart,
  isColorInConfig,
  isConfiguring,
  useConfiguratorState,
} from "@/configurator";
import { mapValueIrisToColor } from "@/configurator/components/ui-helpers";
import { Component, isNumericalMeasure } from "@/domain/data";
import { Icon } from "@/icons";
import SvgIcClose from "@/icons/components/IcClose";
import { useUser } from "@/login/utils";
import {
  categoricalPalettes,
  DEFAULT_CATEGORICAL_PALETTE_ID,
  divergingSteppedPalettes,
  getDefaultCategoricalPalette,
  getPalette,
} from "@/palettes";
import { theme } from "@/themes/federal";
import { createCustomColorPalette } from "@/utils/chart-config/api";
import useEvent from "@/utils/use-event";
import { useMutate } from "@/utils/use-fetch-data";

import { ConfiguratorDrawer, DRAWER_WIDTH } from "../drawer";

//have to import dynamically to avoid @uiw/react-color dependency issues with the server
const ColorPickerMenu = dynamic(
  () =>
    import("../chart-controls/color-picker").then((mod) => mod.ColorPickerMenu),
  { ssr: false }
);

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
  autocompleteMenuContent: {
    "--mx": "1rem",
    "--colorBoxSize": "1.25rem",
    "--columnGap": "0.75rem",
    width: DRAWER_WIDTH,
  },
  autocompleteHeader: {
    margin: "1rem var(--mx)",
  },
  autocompleteApplyButtonContainer: {
    padding: "1rem var(--mx)",
    background: "rgba(255,255,255,0.75)",
  },
  textInput: {
    margin: `${theme.spacing(4)} 0px`,
    padding: "30px",
    width: "100%",
    height: 40,
    minHeight: 40,
  },
  autocompleteApplyButton: {
    justifyContent: "center",
  },
});

type Props = {
  field: EncodingFieldType;
  disabled?: boolean;
  colorConfigPath?: string;
  component?: Component;
  values?: { id: string; symbol: LegendSymbol }[];
};

export const ColorPalette = ({
  field,
  disabled,
  colorConfigPath,
  component,
  values,
}: Props) => {
  const [state, dispatch] = useConfiguratorState(isConfiguring);
  const chartConfig = getChartConfig(state);
  const classes = useStyles();
  const user = useUser();

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

  const currentPalette = palettes.find((p) => p.value === currentPaletteName);

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

  const withColorField = isColorInConfig(chartConfig);

  const [anchorEl, setAnchorEl] = useState<HTMLElement>();
  const handleOpenAutocomplete: MouseEventHandler<HTMLButtonElement> = useEvent(
    (ev) => {
      setAnchorEl(ev.currentTarget);
    }
  );
  const handleCloseAutocomplete = useEvent(() => {
    setAnchorEl(undefined);

    anchorEl?.focus();
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
              {currentPalette
                ? currentPalette.colors.map((color: string) => (
                    <ColorSquare
                      key={color}
                      color={color}
                      disabled={disabled}
                    />
                  ))
                : withColorField &&
                  (chartConfig.fields.color.type === "single" ? (
                    <ColorSquare
                      key={chartConfig.fields.color.color}
                      color={chartConfig.fields.color.color as string}
                      disabled={disabled}
                    />
                  ) : (
                    Object.entries(chartConfig.fields.color.colorMapping).map(
                      ([id, color]) => (
                        <ColorSquare
                          key={id}
                          color={color as string}
                          disabled={disabled}
                        />
                      )
                    )
                  ))}
            </Flex>
          );
        }}
        value={
          currentPalette
            ? currentPalette.value
            : withColorField && chartConfig.fields.color.paletteId
        }
        onChange={handleChangePalette}
      >
        {user && (
          <Button
            onClick={handleOpenAutocomplete}
            variant="text"
            sx={{
              width: "100%",
              paddingY: 3,
              paddingX: 4,
            }}
          >
            Add color palette
          </Button>
        )}
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
            Visualize color palettes
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
      {values && (
        <ConfiguratorDrawer open={!!anchorEl} hideBackdrop>
          <DrawerContent onClose={handleCloseAutocomplete} values={values} />
        </ConfiguratorDrawer>
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

const DrawerContent = forwardRef<
  HTMLDivElement,
  {
    onClose: () => void;
    values: { id: string; symbol: LegendSymbol }[];
  }
>((props, ref) => {
  const { onClose, values } = props;
  const classes = useStyles();

  const [colorValues, setColorValues] = useState<
    { color: string; id: string }[]
  >([]);
  const [titleInput, setTitleInput] = useState<string>("");

  const [state, dispatch] = useConfiguratorState(isConfiguring);
  const chartConfig = getChartConfig(state);

  const createColorPalette = useMutate(createCustomColorPalette);

  const updateColor = useCallback((color, id) => {
    setColorValues((prevColors) => {
      return prevColors.map((oldColor) =>
        oldColor.id === id ? { ...oldColor, color } : oldColor
      );
    });
  }, []);

  const saveColorPalette = useEvent(async () => {
    const colorMapping = Object.fromEntries(
      values.map((value, index) => [
        value.id,
        colorValues[index % colorValues.length].color,
      ])
    );

    if (isColorInConfig(chartConfig)) {
      dispatch({
        type: "COLOR_FIELD_SET",
        value:
          chartConfig.fields.color.type === "single"
            ? {
                type: chartConfig.fields.color.type,
                paletteId: titleInput,
                color: colorValues[0].color,
              }
            : {
                type: chartConfig.fields.color.type,
                paletteId: titleInput,
                colorMapping: colorMapping,
              },
      });
    }

    await createColorPalette.mutate({
      name: titleInput,
      colors: colorValues.map((c) => c.color),
      type: "categorical",
    });

    onClose();
  });

  return (
    <div
      className={classes.autocompleteMenuContent}
      ref={ref}
      data-testid="colors-filters-drawer"
    >
      <Box className={classes.autocompleteHeader}>
        <Flex alignItems="center" justifyContent="space-between">
          <Typography
            variant="h4"
            sx={{
              py: 4,
            }}
          >
            <Trans id="controls.custom-color-palettes">
              Custom color palettes
            </Trans>
          </Typography>
          <IconButton sx={{ mt: "-0.5rem" }} size="small" onClick={onClose}>
            <SvgIcClose fontSize="inherit" />
          </IconButton>
        </Flex>
        <Typography variant="body2" color="textSecondary">
          <Trans id="controls.custom-color-palettes.caption">
            Use distinct, high-contrast colors. Avoid using too many colors,
            maximum 5–7. Apply sequential palettes for ordered data and
            diverging palettes for extremes.
          </Trans>
        </Typography>
      </Box>
      <Flex
        sx={{
          mt: 4,
          paddingX: "1rem",
        }}
        flexDirection={"column"}
      >
        <Input
          label={t({ id: "controls.custom-color-palettes.title" })}
          name="custom-color-palette-title"
          value={titleInput}
          onChange={(e) => setTitleInput(e.target.value)}
        />
        {
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 5 }}>
            {colorValues.map((item) => {
              return (
                <Box
                  key={item.id}
                  sx={{
                    paddingY: 1,
                  }}
                >
                  <Flex
                    sx={{
                      justifyContent: "space-between",
                      alignItems: "center",
                      width: "100%",
                    }}
                  >
                    <LegendItem
                      item={item.color}
                      color={item.color}
                      symbol={"square"}
                      usage="colorPicker"
                    />
                    <ColorPickerMenu
                      key={`color-picker-${item.id}`}
                      colors={colorValues.map((c) => c.color)}
                      selectedColor={item.color}
                      onChange={(newColor) => {
                        updateColor(newColor, item.id);
                      }}
                    />
                  </Flex>
                </Box>
              );
            })}
          </Box>
        }
        <Button
          variant="text"
          fullWidth
          disabled={values.length <= colorValues.length}
          onClick={() =>
            setColorValues((ps) => [
              ...ps,
              { color: "#000000", id: values[colorValues.length].id },
            ])
          }
          startIcon={<Icon name="add" />}
          sx={{ minWidth: "fit-content", mt: 2, paddingLeft: 0 }}
        >
          <Trans id="controls.custom-color-palettes.add-color">Add color</Trans>
        </Button>
      </Flex>
      <Box className={classes.autocompleteApplyButtonContainer}>
        <Button
          disabled={colorValues.length === 0 || titleInput === ""}
          className={classes.autocompleteApplyButton}
          onClick={saveColorPalette}
        >
          <Trans id="controls.custom-color-palettes.set-values-apply">
            Save color palette
          </Trans>
        </Button>
      </Box>
    </div>
  );
});
