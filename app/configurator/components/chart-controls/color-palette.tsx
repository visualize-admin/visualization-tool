import { Trans } from "@lingui/macro";
import { Box, Button, Flex, Text } from "theme-ui";
import { useSelect } from "downshift";
import get from "lodash/get";
import { useCallback } from "react";
import { ConfiguratorStateConfiguringChart, useConfiguratorState } from "../..";
import { Label } from "../../../components/form";
import {
  categoricalPalettes,
  getPalette,
  mapColorsToComponentValuesIris,
  sequentialPalettes,
} from "../ui-helpers";
import {
  DimensionFieldsFragment,
  DimensionFieldsWithValuesFragment,
} from "../../../graphql/query-hooks";
import { Icon } from "../../../icons";

type Props = {
  field: string;
  disabled?: boolean;
  colorConfigPath?: string;
  component:
    | DimensionFieldsWithValuesFragment
    | DimensionFieldsFragment
    | undefined;
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
      ? sequentialPalettes
      : categoricalPalettes;

  const currentPaletteName = get(
    state,
    `chartConfig.fields["${state.activeField}"].${
      colorConfigPath ? `${colorConfigPath}.` : ""
    }palette`
  );

  const currentPalette =
    palettes.find((p) => p.value === currentPaletteName) ?? palettes[0];

  const {
    isOpen,
    getToggleButtonProps,
    getLabelProps,
    getMenuProps,
    highlightedIndex,
    getItemProps,
  } = useSelect({
    items: palettes,
    defaultSelectedItem: palettes[0], // Probably should use `selectedItem` here …
    onSelectedItemChange: ({ selectedItem }) => {
      if (selectedItem && component) {
        dispatch({
          type: "CHART_PALETTE_CHANGED",
          value: {
            field,
            colorConfigPath,
            palette: selectedItem.value,
            colorMapping: mapColorsToComponentValuesIris({
              palette: selectedItem.value,
              component,
            }),
          },
        });
      }
    },
  });

  return (
    <Box mt={2} sx={{ pointerEvents: disabled ? "none" : "unset" }}>
      <Label disabled={disabled} smaller {...getLabelProps()}>
        <Trans id="controls.color.palette">Color Palette</Trans>
      </Label>
      <Button
        {...getToggleButtonProps()}
        sx={{
          color: "monochrome700",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          bg: "monochrome100",
          p: 1,
          height: "40px",
          borderWidth: "1px",
          borderStyle: "solid",
          borderColor: "monochrome500",
          ":hover": {
            bg: "monochrome100",
          },
          ":active": {
            bg: "monochrome100",
          },
          ":disabled": {
            cursor: "initial",
            bg: "muted",
          },
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
      <Box {...getMenuProps()} sx={{ bg: "monochrome100" }}>
        {isOpen &&
          palettes.map((palette, index) => (
            <Box
              key={`${palette.value}${index}`}
              sx={{
                p: 1,
                cursor: "pointer",
                backgroundColor:
                  highlightedIndex === index
                    ? "monochrome200"
                    : "monochrome100",
              }}
            >
              <Text variant="meta">{palette.label}</Text>
              <Box
                sx={{
                  backgroundColor:
                    highlightedIndex === index
                      ? "monochrome200"
                      : "monochrome100",
                }}
                {...getItemProps({ item: palette, index })}
              >
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
      </Box>
      {component && state.state === "CONFIGURING_CHART" && (
        <ColorPaletteReset
          field={field}
          component={component}
          state={state}
          colorConfigPath={colorConfigPath}
        />
      )}
      {/* if you Tab from menu, focus goes on button, and it shouldn't. only happens here. */}
      <div tabIndex={0} />
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
      bg: disabled ? "monochrome300" : color,
      display: "inline-block",
      margin: 0,
      padding: 0,
      width: 16,
      height: 28,
      borderColor: "monochrome100",
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
  component: DimensionFieldsWithValuesFragment | DimensionFieldsFragment;
  state: ConfiguratorStateConfiguringChart;
}) => {
  const [, dispatch] = useConfiguratorState();

  const palette = get(
    state,
    `chartConfig.fields["${field}"].${
      colorConfigPath ? `${colorConfigPath}.` : ""
    }palette`,
    "category10"
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
          colorMapping: mapColorsToComponentValuesIris({
            palette,
            component,
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
        sx={{ mt: 2, mb: 3 }}
      >
        <Trans id="controls.color.palette.reset">Reset color palette</Trans>
      </Button>
    );
  } else {
    return (
      <Button disabled={true} variant="inline" sx={{ mt: 2, mb: 3 }}>
        <Trans id="controls.color.palette.reset">Reset color palette</Trans>
      </Button>
    );
  }
};
