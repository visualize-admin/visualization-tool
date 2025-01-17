import { Box } from "@mui/material";
import { makeStyles } from "@mui/styles";
import {
  hexToHsva,
  HsvaColor,
  hsvaToHex,
  Hue,
  Saturation,
} from "@uiw/react-color";
import dynamic from "next/dynamic";
import { ChangeEvent, useCallback, useEffect, useState } from "react";

import Flex from "@/components/flex";
import { Input } from "@/components/form";

import { Swatch } from "./chart-controls/color-picker";

const ChromePicker = dynamic(
  () => import("@uiw/react-color").then((mod) => ({ default: mod.Chrome })),
  { ssr: false }
);

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
  const [hexInput, setHexInput] = useState(hsvaToHex(defaultSelection));
  const classes = useColorPickerStyles();

  useEffect(() => {
    onChange(hsva);
  }, [hsva, onChange]);

  const updateColorInput = useCallback<
    (e: ChangeEvent<HTMLInputElement>) => void
  >((e) => {
    const value = e.target.value;
    if (String(value).length <= 7) {
      setHexInput(value);
      if (String(value).length >= 3) {
        setHsva(hexToHsva(`${value}`));
      }
    }
  }, []);

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
          {colorSwatches?.map((color) => (
            <Swatch
              key={color}
              color={color}
              selected={hsvaToHex(hsva) === color}
              onClick={() => setHsva(hexToHsva(color))}
            />
          ))}
        </Box>
        <Flex sx={{ marginTop: "8px", alignItems: "center", gap: "8px" }}>
          <Input
            name="color-picker-input"
            value={hexInput}
            onChange={updateColorInput}
          />
          <ChromePicker
            showAlpha={false}
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
