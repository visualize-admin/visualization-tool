import { Box } from "@mui/material";
import { makeStyles } from "@mui/styles";
import {
  Chrome,
  EditableInput,
  hexToHsva,
  HsvaColor,
  hsvaToHex,
  Hue,
  Saturation,
} from "@uiw/react-color";
import { color as d3Color } from "d3-color";
import { MouseEventHandler, useEffect, useState } from "react";

import Flex from "@/components/flex";

const useColorPickerStyles = makeStyles(() => ({
  swatches: {
    gridTemplateColumns: "repeat(auto-fill, minmax(1rem, 1fr))",
    gap: 2,
    marginBottom: 2,
    marginTop: 8,
  },
}));

type CustomColorPickerProps = {
  onChange: (color: HsvaColor) => void;
  colorSwatches?: readonly string[];
  defaultSelection?: HsvaColor;
};

const CustomColorPicker = ({
  onChange,
  colorSwatches,
  defaultSelection = { h: 0, s: 0, v: 68, a: 1 },
}: CustomColorPickerProps) => {
  const [hsva, setHsva] = useState(defaultSelection);
  const classes = useColorPickerStyles();

  useEffect(() => {
    onChange(hsva);
  }, [hsva, onChange]);

  return (
    <Flex
      sx={{
        padding: "8px",
        borderRadius: "3px",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Flex
        sx={{
          width: "162px",
          flexDirection: "column",
          gap: "4px",
        }}
      >
        <Saturation
          hsva={hsva}
          onChange={(newColor) =>
            setHsva((ps) => ({ ...ps, ...newColor, a: ps.a }))
          }
          style={{ width: "100%", height: "90px" }}
        />
        <Flex
          sx={{
            alignItems: "center",
            width: "100%",
            gap: "4px",
          }}
        >
          <Box
            sx={{
              width: "8px",
              height: "8px",
              backgroundColor: hsvaToHex(hsva),
              borderRadius: "50%",
            }}
          />
          <Hue
            hue={hsva.h}
            onChange={(newHue) => setHsva((ps) => ({ ...ps, ...newHue }))}
            style={{ width: "100%", height: "8px" }}
          />
        </Flex>

        <Box display="grid" className={classes.swatches}>
          {colorSwatches?.map((color) => {
            return (
              <Swatch
                key={color}
                color={color}
                selected={hsvaToHex(hsva) === color}
                onClick={() => setHsva(hexToHsva(color))}
              />
            );
          })}
        </Box>
        <Flex sx={{ marginTop: "8px", alignItems: "center", gap: "8px" }}>
          <EditableInput
            prefix="#"
            prefixCls="#"
            value={hsvaToHex(hsva)}
            inputStyle={{
              paddingTop: "6px",
              paddingBottom: "3px",
              paddingLeft: "8px",
              paddingRight: "8px",
              fontSize: "14px",
              lineHeight: "150%",
              border: "1px solid #ccc",
              boxShadow: "none",
              outline: "none",
              borderRadius: "4px",
            }}
            onChange={(_, value) => setHsva(hexToHsva(`#${value}`))}
          />
          <Chrome
            showAlpha={false}
            showEyeDropper
            showHue={false}
            showColorPreview={false}
            showEditableInput={false}
            color={hsva}
            onChange={(color) => setHsva(color.hsva)}
          />
        </Flex>
      </Flex>
    </Flex>
  );
};

export default CustomColorPicker;

const useStyles = makeStyles(() => ({
  swatch: {
    width: "1rem",
    height: "1rem",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "transparent",
    borderRadius: 1.5,
    padding: 0,
    cursor: "pointer",
  },
}));

export const Swatch = ({
  color,
  selected,
  onClick,
}: {
  color: string;
  selected: boolean;
  onClick: MouseEventHandler<HTMLDivElement>;
}) => {
  const classes = useStyles();
  const boxShadow = d3Color(color)?.darker().toString();

  return (
    <Box
      className={classes.swatch}
      sx={{
        boxShadow: selected ? `0 0 0.5rem 0 ${boxShadow}` : undefined,
        ":hover": { boxShadow: `0 0 0.5rem 0 ${boxShadow}` },
        backgroundColor: color,
      }}
      role="button"
      onClick={onClick}
    />
  );
};
