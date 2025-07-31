import { Trans } from "@lingui/macro";
import { Box, Button, Popover, styled } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { hexToHsva, hsvaToHex } from "@uiw/react-color";
import { color as d3Color } from "d3-color";
import dynamic from "next/dynamic";
import { MouseEventHandler, useCallback, useMemo, useRef } from "react";

import { useDisclosure } from "@/components/use-disclosure";
import { VisuallyHidden } from "@/components/visually-hidden";
import { Icon } from "@/icons";
import { ColorItem } from "@/palettes";
import { createColorId } from "@/utils/color-palette-utils";

//have to import dynamically to avoid @uiw/react-color dependency issues with the server
const CustomColorPicker = dynamic(
  () =>
    import("../../components/color-picker").then(
      (mod) => mod.CustomColorPicker
    ),
  { ssr: false }
);

const useStyles = makeStyles(() => ({
  swatch: {
    width: "1rem",
    height: "1rem",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "transparent",
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
  const borderColor = d3Color(color)?.darker().toString();

  return (
    <Box
      className={classes.swatch}
      data-testid="color-picker-swatch"
      sx={{
        borderColor: selected ? borderColor : undefined,
        boxShadow: selected ? `0 0 0.5rem 0 ${color}` : undefined,
        backgroundColor: color,

        "&:hover": {
          borderColor,
        },
      }}
      role="button"
      onClick={onClick}
    />
  );
};

const ColorPickerButton = styled(Button)({
  padding: 0,
  minWidth: 16,
  minHeight: 16,
  backgroundColor: "transparent !important",
});

const ColorPickerBox = styled(Box)(({ theme }) => ({
  lineHeight: "16px",

  "& > button": {
    backgroundColor: theme.palette.grey[100],
    borderRadius: 4,
    overflow: "hidden",
    borderWidth: 1,
    padding: 0,
  },

  "& > button:hover": {
    backgroundColor: "transparent",
    cursor: "pointer",
    opacity: 0.8,
  },

  "& > button[disabled]": {
    backgroundColor: "transparent",
  },
}));

export const ColorPickerMenu = ({
  selectedHexColor,
  colors,
  onChange,
  disabled,
  colorId,
  onRemove,
}: {
  selectedHexColor: string;
  colors: ColorItem[] | readonly string[];
  onChange?: (color: string) => void;
  disabled?: boolean;
  colorId?: string;
  onRemove?: (colorId: string) => void;
}) => {
  const { isOpen, open, close } = useDisclosure();
  const buttonRef = useRef(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const initialSelected = useMemo(() => {
    return { ...hexToHsva(selectedHexColor), id: colorId ?? createColorId() };
  }, [selectedHexColor, colorId]);

  const handleColorChange = useCallback(
    (color) => {
      const newHex = hsvaToHex(color);
      if (newHex !== selectedHexColor) {
        onChange?.(newHex);
      }
    },
    [onChange, selectedHexColor]
  );

  return (
    <div
      style={{
        opacity: disabled ? 0.5 : 1,
        pointerEvents: disabled ? "none" : "auto",
      }}
    >
      <ColorPickerBox sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <ColorPickerButton
          ref={buttonRef}
          variant="text"
          disabled={disabled}
          onClick={open}
        >
          <VisuallyHidden>
            <Trans id="controls.colorpicker.open">Open Color Picker</Trans>
          </VisuallyHidden>
          <Icon name="swatch" size={16} />
        </ColorPickerButton>
        {colorId && onRemove && (
          <ColorPickerButton variant="text" onClick={() => onRemove(colorId)}>
            <VisuallyHidden>
              <Trans id="controls.colorpicker.remove">Remove Color</Trans>
            </VisuallyHidden>
            <Icon name="close" size={16} />
          </ColorPickerButton>
        )}
      </ColorPickerBox>
      <Popover
        anchorEl={buttonRef.current}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        open={isOpen}
        onClose={close}
        slotProps={{ paper: { sx: { boxShadow: 4 } } }}
      >
        <div ref={popoverRef}>
          <CustomColorPicker
            defaultSelection={initialSelected}
            onChange={handleColorChange}
            colorSwatches={
              (typeof colors[0] === "string"
                ? colors.map((color) => ({ color: color, id: createColorId() }))
                : colors) as ColorItem[]
            }
          />
        </div>
      </Popover>
    </div>
  );
};
