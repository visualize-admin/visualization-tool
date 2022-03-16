import { Trans } from "@lingui/macro";
import { Menu, MenuButton, MenuPopover } from "@reach/menu-button";
import VisuallyHidden from "@reach/visually-hidden";
import { color as d3Color } from "d3";
import { MouseEventHandler, useCallback, useState } from "react";
import { Box, Grid, Input } from "@mui/material";

const Swatch = ({
  color,
  selected,
  onClick,
}: {
  color: string;
  selected: boolean;
  onClick: MouseEventHandler<HTMLDivElement>;
}) => {
  const borderColor = d3Color(color)?.darker().toString();
  return (
    <Box
      style={{
        borderColor: selected ? borderColor : undefined,
        boxShadow: selected ? `0 0 0.5rem 0 ${color}` : undefined,
      }}
      sx={{
        width: "1.5rem",
        height: "1.5rem",
        backgroundColor: color,
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: "transparent",
        borderRadius: 1.5,
        p: 0,
        cursor: "pointer",
        ":hover": { borderColor },
      }}
      role="button"
      onClick={onClick}
    ></Box>
  );
};

type Props = {
  selectedColor: string;
  colors: readonly string[];
  onChange?: (color: string) => void;
  disabled?: boolean;
};

export const ColorPicker = ({ selectedColor, colors, onChange }: Props) => {
  const [inputColorValue, setInputColorValue] = useState(selectedColor);

  const selectColor = useCallback(
    (_color) => {
      setInputColorValue(_color);
      // Make sure onChange is only called with valid colors
      const c = d3Color(_color);
      if (c) {
        // Type defs of d3-color are not up-to-date
        onChange?.((c as $Unexpressable).formatHex());
      }
    },
    [onChange, setInputColorValue]
  );

  const formatInputColor = useCallback(
    (_color) => {
      // Make sure onChange is only called with valid colors
      const c = d3Color(_color);
      if (c) {
        // Type defs of d3-color are not up-to-date
        setInputColorValue((c as $Unexpressable).formatHex());
      }
    },
    [setInputColorValue]
  );

  return (
    <Box
      sx={{
        width: 160,
        backgroundColor: "grey.100",
        borderRadius: 1.5,
        boxShadow: "tooltip",
        p: 3,
      }}
    >
      <Box
        display="grid"
        sx={{
          // width: 120,
          gridTemplateColumns: "repeat(auto-fill, minmax(1.5rem, 1fr))",
          gap: 2,
          mb: 2,
        }}
      >
        {colors.map((color) => (
          <Swatch
            key={color}
            color={color}
            selected={color === selectedColor}
            onClick={() => {
              selectColor(color);
            }}
          />
        ))}
      </Box>
      <Box sx={{ position: "relative" }}>
        <Input
          sx={{
            color: "grey.700",
            borderColor: "grey.500",
            backgroundColor: "grey.100",
            fontSize: "0.875rem",
            ":focus": { outline: "none", borderColor: "primary" },
          }}
          maxLength={7}
          value={`#${inputColorValue.replace(/^#/, "")}`}
          onChange={(e) => {
            selectColor(e.currentTarget.value);
          }}
          onBlur={(e) => {
            formatInputColor(e.currentTarget.value);
          }}
        />
      </Box>
    </Box>
  );
};

export const ColorPickerMenu = (props: Props) => {
  const { selectedColor } = props;
  const borderColor = d3Color(selectedColor)?.darker().toString();

  return (
    <Menu>
      <Box
        sx={{
          "> button": {
            backgroundColor: "grey.100",
            borderRadius: 2,
            overflow: "hidden",
            borderWidth: 1,
            border: 0,
            p: 0,
          },
          "> button:hover": {
            borderColor,
            cursor: "pointer",
          },
          "> button[aria-expanded]": {
            borderColor: "primary.active",
          },
          opacity: props.disabled ? 0.5 : 1,
          pointerEvents: props.disabled ? "none" : "auto",
        }}
      >
        <MenuButton className="menu-button" disabled={props.disabled}>
          <VisuallyHidden>
            <Trans id="controls.colorpicker.open">Open Color Picker</Trans>
          </VisuallyHidden>
          <Box aria-hidden>
            <Box
              sx={{
                backgroundColor: selectedColor,
                width: "1rem",
                height: "1rem",
              }}
            ></Box>
          </Box>
        </MenuButton>
        <MenuPopover>
          <ColorPicker {...props} />
        </MenuPopover>
      </Box>
    </Menu>
  );
};
