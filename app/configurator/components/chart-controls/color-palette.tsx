import { Trans } from "@lingui/macro";
import {
  Box,
  Button,
  Typography,
  Select,
  MenuItem,
  SelectProps,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import get from "lodash/get";
import { useCallback } from "react";

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
import useEvent from "@/utils/use-event";

type Props = {
  field: string;
  disabled?: boolean;
  colorConfigPath?: string;
  component: DimensionMetaDataFragment | undefined;
};

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

export const ColorPalette = ({
  field,
  disabled,
  colorConfigPath,
  component,
}: Props) => {
  const [state, dispatch] = useConfiguratorState();
  const classes = useStyles();

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
        <Trans id="controls.color.palette">Color Palette</Trans>
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
      width: 20,
      height: 20,
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

    return (
      <Button
        disabled={same}
        onClick={resetColorPalette}
        variant="inline"
        sx={{ mt: 1, px: 1 }}
      >
        <Trans id="controls.color.palette.reset">Reset color palette</Trans>
      </Button>
    );
  } else {
    return <Box mt={2} />;
  }
};
