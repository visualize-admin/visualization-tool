import { Input } from "@mui/material";
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

import { Flex } from "@/components/flex";
import { Swatch } from "@/configurator/components/chart-controls/color-picker";
import { ColorItem } from "@/palettes";
import { createColorId } from "@/utils/color-palette-utils";

const ChromePicker = dynamic(
  () => import("@uiw/react-color").then((mod) => ({ default: mod.Chrome })),
  { ssr: false }
);

const useColorPickerStyles = makeStyles({
  swatches: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(1rem, 1fr))",
    gap: 2,
    marginBottom: 2,
    marginTop: 8,
  },
});

type CustomColorPickerProps = {
  onChange: (color: HsvaColor) => void;
  colorSwatches?: ColorItem[];
  defaultSelection?: HsvaColor & Pick<ColorItem, "id">;
};

export const CustomColorPicker = ({
  onChange,
  colorSwatches,
  defaultSelection = { h: 0, s: 0, v: 68, a: 1, id: createColorId() },
}: CustomColorPickerProps) => {
  const [{ hsva, hex }, setColor] = useState(() => {
    return {
      hsva: defaultSelection,
      hex: hsvaToHex(defaultSelection),
    };
  });

  const classes = useColorPickerStyles();

  useEffect(() => {
    onChange(hsva);
  }, [hsva, onChange]);

  const updateColorInput = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (value.length <= 7) {
      setColor((p) => ({
        ...p,
        hex: value,
      }));

      if (value.length >= 3) {
        setColor((p) => ({
          ...p,
          hsva: {
            ...p.hsva,
            ...hexToHsva(value),
          },
        }));
      }
    }
  }, []);

  return (
    <Flex
      sx={{
        flexDirection: "column",
        alignItems: "center",
        p: 2,
        borderRadius: 4,
      }}
    >
      <Flex sx={{ flexDirection: "column", width: "162px", gap: 1 }}>
        <Saturation
          data-testid="color-picker-saturation"
          hsva={hsva}
          onChange={(color) => {
            const newHsva = { ...hsva, ...color, a: hsva.a };
            setColor({ hsva: newHsva, hex: hsvaToHex(newHsva) });
          }}
          style={{ width: "100%", height: "90px" }}
        />
        <Flex
          sx={{
            alignItems: "center",
            width: "100%",
            gap: "4px",
          }}
        >
          <div
            data-testid="color-square"
            style={{
              width: 8,
              height: 8,
              backgroundColor: hsvaToHex(hsva),
              borderRadius: "50%",
            }}
          />
          <Hue
            data-testid="color-picker-hue"
            hue={hsva.h}
            onChange={(newHue) => {
              const newHsva = { ...hsva, ...newHue };
              setColor({ hsva: newHsva, hex: hsvaToHex(newHsva) });
            }}
            style={{ width: "100%", height: "8px" }}
          />
        </Flex>
        {colorSwatches ? (
          <div className={classes.swatches}>
            {colorSwatches.map((item, i) => (
              <Swatch
                key={`color-picker-swatch-${item.color}-${i}`}
                color={item.color}
                selected={item.color === hex && item.id === hsva.id}
                onClick={() => {
                  const newHsva = hexToHsva(item.color);
                  setColor({
                    hsva: { ...newHsva, id: item.id },
                    hex: item.color,
                  });
                }}
              />
            ))}
          </div>
        ) : null}
        <Flex sx={{ alignItems: "center", gap: 2, mt: 2 }}>
          <Input
            name="color-picker-input"
            value={hex}
            onChange={updateColorInput}
          />
          <ChromePicker
            data-testid="color-picker-chrome"
            showAlpha={false}
            showHue={false}
            showColorPreview={false}
            showEditableInput={false}
            color={hsva}
            onChange={(color) => {
              setColor({ hsva: { ...hsva, ...color.hsva }, hex: color.hex });
            }}
          />
        </Flex>
      </Flex>
    </Flex>
  );
};
