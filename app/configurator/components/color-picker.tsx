import { t } from "@lingui/macro";
import { Input } from "@mui/material";
import { makeStyles } from "@mui/styles";
import clamp from "lodash/clamp";
import dynamic from "next/dynamic";
import {
  ChangeEvent,
  KeyboardEvent,
  useCallback,
  useEffect,
  useState,
} from "react";

import { Flex } from "@/components/flex";
import { Swatch } from "@/configurator/components/chart-controls/color-picker";
import { ColorItem } from "@/palettes";
import { createColorId } from "@/utils/color-palette-utils";
import { hexToHsva, HsvaColor, hsvaToHex } from "@/utils/color-utils";

const ChromePicker = dynamic(
  () => import("@uiw/react-color").then((mod) => ({ default: mod.Chrome })),
  { ssr: false }
);

const Hue = dynamic(
  () => import("@uiw/react-color").then((mod) => ({ default: mod.Hue })),
  { ssr: false }
);

const Saturation = dynamic(
  () => import("@uiw/react-color").then((mod) => ({ default: mod.Saturation })),
  { ssr: false }
);

const useColorPickerStyles = makeStyles({
  forcedColors: {
    forcedColorAdjust: "none",
  },
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
  const saturation = Math.round(hsva.s);
  const brightness = Math.round(hsva.v);
  const setHsva = (newHsva: HsvaColor & Pick<ColorItem, "id">) => {
    setColor({ hsva: newHsva, hex: hsvaToHex(newHsva) });
  };

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
          className={classes.forcedColors}
          role="slider"
          aria-label={t({
            id: "controls.colorpicker.saturation",
            message: "Saturation and brightness",
          })}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={saturation}
          aria-valuetext={t({
            id: "controls.colorpicker.saturation.value",
            message: `Saturation ${saturation}%, brightness ${brightness}%`,
          })}
          onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => {
            const step = getKeyboardStep(e);

            if (step) {
              e.preventDefault();
              setHsva({
                ...hsva,
                s: clamp(hsva.s + step.x, 0, 100),
                v: clamp(hsva.v + step.y, 0, 100),
              });
            }
          }}
          hsva={hsva}
          onChange={(color) => {
            setHsva({ ...hsva, ...color, a: hsva.a });
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
            className={classes.forcedColors}
            style={{
              width: 8,
              height: 8,
              backgroundColor: hsvaToHex(hsva),
              borderRadius: "50%",
            }}
          />
          <Hue
            data-testid="color-picker-hue"
            className={classes.forcedColors}
            innerProps={{
              role: "slider",
              "aria-label": t({
                id: "controls.colorpicker.hue",
                message: "Hue",
              }),
              "aria-valuemin": 0,
              "aria-valuemax": 360,
              "aria-valuenow": Math.round(hsva.h),
              onKeyDown: (e: KeyboardEvent<HTMLDivElement>) => {
                const step = getKeyboardStep(e);

                if (step) {
                  e.preventDefault();
                  setHsva({
                    ...hsva,
                    h: clamp(hsva.h + step.x + step.y, 0, 360),
                  });
                }
              },
            }}
            hue={hsva.h}
            onChange={(newHue) => {
              setHsva({ ...hsva, ...newHue });
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
                  setColor({
                    hsva: { ...hexToHsva(item.color), id: item.id },
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
            inputProps={{
              "aria-label": t({
                id: "controls.colorpicker.hex",
                message: "Hex color",
              }),
            }}
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

const KEYBOARD_STEPS: Record<string, { x: number; y: number }> = {
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  ArrowDown: { x: 0, y: -1 },
  ArrowUp: { x: 0, y: 1 },
  Home: { x: -Infinity, y: 0 },
  End: { x: Infinity, y: 0 },
};

const getKeyboardStep = (e: KeyboardEvent<HTMLElement>) => {
  const step = KEYBOARD_STEPS[e.key];

  if (!step) {
    return;
  }

  const multiplier = e.shiftKey ? 10 : 1;

  return { x: step.x * multiplier, y: step.y * multiplier };
};
