import { Trans } from "@lingui/macro";
import { Box, Button, Flex, Text } from "@theme-ui/components";
import { useSelect } from "downshift";
import * as React from "react";
import { useConfiguratorState } from "../../domain";
import { getPalette } from "../../domain/helpers";
import { Icon } from "../../icons";
import { Label } from "../form";
import { scaleOrdinal } from "d3-scale";
import {
  DimensionFieldsWithValuesFragment,
  ComponentFieldsFragment,
} from "../../graphql/query-hooks";

const vegaPalettes: Array<{
  label: string;
  value: string;
  colors: ReadonlyArray<string>;
}> = [
  {
    label: "category10",
    value: "category10",
    colors: getPalette("category10"),
  },
  { label: "accent", value: "accent", colors: getPalette("accent") },
  // { label: "category20", value: "category20", colors: getPalette("category20") },
  // { label: "category20b", value: "category20b", colors: getPalette("category20b") },
  // { label: "category20c", value: "category20c", colors: getPalette("category20c") },
  { label: "dark2", value: "dark2", colors: getPalette("dark2") },
  { label: "paired", value: "paired", colors: getPalette("paired") },
  { label: "pastel1", value: "pastel1", colors: getPalette("pastel1") },
  { label: "pastel2", value: "pastel2", colors: getPalette("pastel2") },
  { label: "set1", value: "set1", colors: getPalette("set1") },
  { label: "set2", value: "set2", colors: getPalette("set2") },
  { label: "set3", value: "set3", colors: getPalette("set3") },
  // { label: "tableau10", value: "tableau10", colors: scheme("tableau10") }
  // { label: "tableau20", value: "tableau20", colors: scheme("tableau20") }
];

export const ColorPalette = ({
  field,
  disabled,
  component,
}: {
  field: string;
  disabled?: boolean;
  component: DimensionFieldsWithValuesFragment | undefined;
  //  { iri: string; label: string; values: { value: string }[] };
}) => {
  const [state, dispatch] = useConfiguratorState();

  const {
    isOpen,
    getToggleButtonProps,
    getLabelProps,
    getMenuProps,
    highlightedIndex,
    getItemProps,
  } = useSelect({
    items: vegaPalettes,
    defaultSelectedItem: vegaPalettes[0], // Probably should use `selectedItem` here …
    onSelectedItemChange: ({ selectedItem }) => {
      if (selectedItem && component) {
        const colorScale = scaleOrdinal()
          .domain(component?.values.map((dv) => dv.value))
          .range(getPalette(selectedItem.value));
        const colorMapping = {} as $FixMe;

        component?.values.forEach((dv) => {
          colorMapping[`${dv.value}`] = colorScale(dv.value);
        });
        console.log(colorMapping);

        dispatch({
          type: "CHART_PALETTE_CHANGED",
          value: {
            field,
            path: "palette",
            value: selectedItem.value,
            colorMapping,
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
          width: ["100%"],
          color: "monochrome700",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          bg: "monochrome100",
          p: 1,
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
            {getPalette(
              state.chartConfig.fields.segment?.palette || "category10"
            ).map((color: string) => (
              <ColorSquare key={color} color={color} disabled={disabled} />
            ))}
          </Flex>
        )}
        <Icon name="unfold" />
      </Button>
      <Box {...getMenuProps()} sx={{ bg: "monochrome100" }}>
        {isOpen &&
          vegaPalettes.map((palette, index) => (
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
      height: 24,
      borderColor: "monochrome100",
      borderWidth: "1px",
      borderStyle: "solid",
      "&:first-of-type": {
        borderTopLeftRadius: "bigger",
        borderBottomLeftRadius: "bigger",
      },
      "&:last-of-type": {
        borderTopRightRadius: "bigger",
        borderBottomRightRadius: "bigger",
      },
    }}
  />
);
