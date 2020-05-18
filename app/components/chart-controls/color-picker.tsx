import { Box, Grid, Input, Button } from "theme-ui";
import { color as d3Color } from "d3-color";
import { useState, useEffect } from "react";

const Swatch = ({
  color,
  selected,
  onClick,
}: {
  color: string;
  selected: boolean;
  onClick: React.MouseEventHandler<HTMLDivElement>;
}) => {
  const borderColor = d3Color(color)?.darker().toString();
  return (
    <Box
      style={{
        borderColor: selected ? borderColor : undefined,
      }}
      sx={{
        boxShadow: selected ? "tooltip" : undefined,
        width: 24,
        height: 24,
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
  const [color, setColor] = useState(selectedColor);
  useEffect(() => {
    // Make sure onChange is only called with valid colors
    const c = d3Color(color);
    if (c) {
      // Type defs of d3-color are not up-to-date
      onChange?.((c as $Unexpressable).formatHex());
    }
  }, [color, onChange]);
  return (
    <Box
      sx={{
        bg: "monochrome100",
        borderRadius: "default",
        boxShadow: "tooltip",
        p: 3,
      }}
    >
      <Grid
        sx={{
          // width: 120,
          gridTemplateColumns: "repeat(4, 24px)",
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
              setColor(color);
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
          value={`#${color.replace(/^#/, "")}`}
          onChange={(e) => {
            setColor(e.currentTarget.value);
          }}
        />
      </Box>
    </Box>
  );
};
