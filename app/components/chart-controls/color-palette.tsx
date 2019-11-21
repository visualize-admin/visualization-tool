import { useSelect } from "downshift";
import * as React from "react";
import { useEffect } from "react";
import { Box, Button, Flex } from "rebass";
import { ColorScheme, scheme } from "vega";
import { useConfiguratorState } from "../../domain";
import { Icon } from "../../icons";
import { Label } from "../form";
import { Trans } from "@lingui/macro";

const vegaPalettes: Array<{
  label: string;
  value: ColorScheme;
  colors: Array<string>;
}> = [
  { label: "accent", value: "accent", colors: scheme("accent") },
  { label: "category10", value: "category10", colors: scheme("category10") },
  // { label: "category20", value: "category20", colors: scheme("category20") },
  // { label: "category20b", value: "category20b", colors: scheme("category20b") },
  // { label: "category20c", value: "category20c", colors: scheme("category20c") },
  { label: "dark2", value: "dark2", colors: scheme("dark2") },
  { label: "paired", value: "paired", colors: scheme("paired") },
  { label: "pastel1", value: "pastel1", colors: scheme("pastel1") },
  { label: "pastel2", value: "pastel2", colors: scheme("pastel2") },
  { label: "set1", value: "set1", colors: scheme("set1") },
  { label: "set2", value: "set2", colors: scheme("set2") },
  { label: "set3", value: "set3", colors: scheme("set3") },
  { label: "tableau10", value: "tableau10", colors: scheme("tableau10") }
  // { label: "tableau20", value: "tableau20", colors: scheme("tableau20") }
];

export const ColorPalette = () => {
  const [state, dispatch] = useConfiguratorState();
  const {
    isOpen,
    selectedItem,
    getToggleButtonProps,
    getLabelProps,
    getMenuProps,
    highlightedIndex,
    getItemProps
  } = useSelect({ items: vegaPalettes });

  useEffect(() => {
    dispatch({
      type: "CHART_CONFIG_CHANGED",
      value: {
        path: "palette",
        value: (selectedItem && selectedItem.value) || "accent"
      }
    });
  }, [dispatch, selectedItem]);

  return (
    <div>
      <Label smaller {...getLabelProps()}>
        <Trans>Farbpalette:</Trans>
      </Label>
      <Button variant="palette" {...getToggleButtonProps()}>
        {state.state === "CONFIGURING_CHART" && (
          <Flex>
            {/* {scheme(state.chartConfig.palette).map((color: string) => (
              <Box key={color} variant="palette.color" sx={{ bg: color }}></Box>
            ))} */}
          </Flex>
        )}
        <Icon name="unfold" />
      </Button>
      <Box {...getMenuProps()} variant="palette.menu">
        {isOpen &&
          vegaPalettes.map((palette, index) => (
            <Box
              key={`${palette.value}${index}`}
              variant="palette.row"
              sx={
                highlightedIndex === index
                  ? { backgroundColor: "monochrome.200" }
                  : {}
              }
              {...getItemProps({ item: palette, index })}
            >
              {palette.colors.map(color => (
                <Box
                  key={`option-${color}`}
                  variant="palette.color"
                  sx={{ bg: color }}
                ></Box>
              ))}
            </Box>
          ))}
      </Box>
      {/* if you Tab from menu, focus goes on button, and it shouldn't. only happens here. */}
      <div tabIndex={0} />
    </div>
  );
};

// export const ColorPalette = ({
//   chartId,
//   label,
//   path,
//   type,
//   value,
//   disabled,
//   ...props
// }: {
//   chartId: string;
//   label: string;
//   path: string;
//   type?: "text" | "checkbox" | "radio" | "input" | "select";
//   value?: string;
//   disabled?: boolean;
// }) => {
//   return (
//     <Field
//       type="select"
//       chartId={chartId}
//       path={path}
//       label={label}
//       options={vegaPalettes}
//     />
//   );
// };
