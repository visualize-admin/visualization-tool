import { Menu, MenuButton, MenuPopover } from "@reach/menu-button";
import VisuallyHidden from "@reach/visually-hidden";
import { color as d3Color } from "d3-color";
import { useCallback, useState } from "react";
import { Box, Grid, Input } from "theme-ui";

const Swatch = ({
  color,
  selected,
  onClick,
}: {
  color: string;
  selected: boolean;
  onClick: React.MouseEventHandler<HTMLDivElement>;
}) => {
  const borderColor = d3Color(color)
    ?.darker()
    .toString();
  return (
    <Box
      style={{
        borderColor: selected ? borderColor : undefined,
        boxShadow: selected ? `0 0 0.5rem 0 ${color}` : undefined,
      }}
      sx={{
        width: "1.5rem",
        height: "1.5rem",
        bg: color,
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: "transparent",
        borderRadius: "default",
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

  return (
    <Box
      sx={{
        minWidth: 160,
        bg: "monochrome100",
        borderRadius: "default",
        boxShadow: "tooltip",
        p: 3,
      }}
    >
      <Grid
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
      </Grid>
      <Box sx={{ position: "relative" }}>
        <Input
          sx={{
            color: "monochrome700",
            borderColor: "monochrome500",
            bg: "monochrome100",
            fontSize: 3,
            ":focus": { outline: "none", borderColor: "primary" },
          }}
          maxLength={7}
          value={`#${inputColorValue.replace(/^#/, "")}`}
          onChange={(e) => {
            selectColor(e.currentTarget.value);
          }}
        />
      </Box>
    </Box>
  );
};

export const ColorPickerMenu = (props: Props) => (
  <Menu>
    <Box
      sx={{
        "> button": {
          bg: "monochrome100",
          borderRadius: "default",
          borderWidth: 1,
          borderStyle: "solid",
          borderColor: "monochrome500",
          p: 1,
        },
        "> button[aria-expanded]": {
          borderColor: "primaryActive",
        },
      }}
    >
      <MenuButton className="menu-button">
        <VisuallyHidden>SELECT</VisuallyHidden>
        <Box aria-hidden>
          <Box
            sx={{ bg: props.selectedColor, width: "2rem", height: "1.5rem" }}
          ></Box>
        </Box>
      </MenuButton>
      <MenuPopover>
        <ColorPicker {...props} />
      </MenuPopover>
    </Box>
  </Menu>
);
