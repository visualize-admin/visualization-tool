import { Trans } from "@lingui/macro";
import { Box, Button, Typography, Menu } from "@mui/material";
import get from "lodash/get";
import { useCallback, useState } from "react";

import Flex from "@/components/flex";
import { Label } from "@/components/form";
import {
  ConfiguratorStateConfiguringChart,
  useConfiguratorState,
  DEFAULT_PALETTE,
} from "@/configurator";
import {
  categoricalPalettes,
  divergingSteppedPalettes,
  getPalette,
  mapValueIrisToColor,
} from "@/configurator/components/ui-helpers";
import { DimensionMetaDataFragment } from "@/graphql/query-hooks";
import { Icon } from "@/icons";
import useEvent from "@/lib/use-event";

type Props = {
  field: string;
  disabled?: boolean;
  colorConfigPath?: string;
  component: DimensionMetaDataFragment | undefined;
};

export const ColorPalette = ({
  field,
  disabled,
  colorConfigPath,
  component,
}: Props) => {
  const [state, dispatch] = useConfiguratorState();

  const palettes =
    component?.__typename === "Measure"
      ? divergingSteppedPalettes
      : categoricalPalettes;

  const currentPaletteName = get(
    state,
    `chartConfig.fields["${state.activeField}"].${
      colorConfigPath ? `${colorConfigPath}.` : ""
    }palette`
  );

  const currentPalette =
    palettes.find((p) => p.value === currentPaletteName) ?? palettes[0];

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement>();
  const handleClickToggle: React.MouseEventHandler<HTMLButtonElement> =
    useEvent((ev) => {
      setAnchorEl(ev.currentTarget);
    });

  const handleCloseMenu = useEvent(() => {
    setAnchorEl(undefined);
  });

  const handleSelectPalette = useEvent((palette: typeof palettes[number]) => {
    if (!component) {
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

  const paletteOpen = !!anchorEl;

  return (
    <Box mt={2} sx={{ pointerEvents: disabled ? "none" : "auto" }}>
      <Label smaller htmlFor="color-palette-toggle" sx={{ mb: 1 }}>
        <Trans id="controls.color.palette">Color Palette</Trans>
      </Label>
      <Button
        id="color-palette-toggle"
        variant="selectColorPicker"
        onClick={handleClickToggle}
        sx={{
          cursor: "pointer",
          width: "100%",
          pr: 1,
          "& svg": { color: "grey.600" },
        }}
      >
        {state.state === "CONFIGURING_CHART" && (
          <Flex>
            {currentPalette.colors.map((color: string) => (
              <ColorSquare key={color} color={color} disabled={disabled} />
            ))}
          </Flex>
        )}
        <Icon name="unfold" />
      </Button>
      <Menu open={paletteOpen} anchorEl={anchorEl} onClose={handleCloseMenu}>
        {paletteOpen &&
          palettes.map((palette, index) => (
            <Box
              key={`${palette.value}${index}`}
              sx={{
                px: 2,
                py: 1,
                cursor: "pointer",
                backgroundColor: "grey.100",
                "&:hover": {
                  backgroundColor: "grey.200",
                },
              }}
            >
              <Typography component="div" variant="caption">
                {palette.label}
              </Typography>
              <Box onClick={() => handleSelectPalette(palette)}>
                {palette.colors.map((color) => (
                  <ColorSquare
                    key={`option-${color}`}
                    color={color}
                    disabled={false}
                  />
                ))}
              </Box>
            </Box>
          ))}
      </Menu>
      {component && state.state === "CONFIGURING_CHART" && (
        <ColorPaletteReset
          field={field}
          component={component}
          state={state}
          colorConfigPath={colorConfigPath}
        />
      )}
    </Box>
  );
};

const ColorSquare = ({
  disabled,
  color,
}: {
  disabled?: boolean;
  color: string;
}) => (
  <Box
    sx={{
      backgroundColor: disabled ? "grey.300" : color,
      display: "inline-block",
      margin: 0,
      padding: 0,
      width: 16,
      height: 28,
      borderColor: "grey.100",
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
    }}
  />
);

const ColorPaletteReset = ({
  field,
  colorConfigPath,
  component,
  state,
}: {
  field: string;
  colorConfigPath?: string;
  component: DimensionMetaDataFragment;
  state: ConfiguratorStateConfiguringChart;
}) => {
  const [, dispatch] = useConfiguratorState();

  const palette = get(
    state,
    `chartConfig.fields["${field}"].${
      colorConfigPath ? `${colorConfigPath}.` : ""
    }palette`,
    DEFAULT_PALETTE
  ) as string;

  const colorMapping = get(
    state,
    `chartConfig.fields["${field}"].${
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
    const same = matchedColorsInPalette.every(
      (pc, i) => pc === colorMappingColors[i]
    );

    return same ? (
      <Box mt={2} />
    ) : (
      <Button
        disabled={same}
        onClick={resetColorPalette}
        variant="text"
        sx={{ mt: 2, px: 1 }}
      >
        <Trans id="controls.color.palette.reset">Reset color palette</Trans>
      </Button>
    );
  } else {
    return <Box mt={2} />;
  }
};
