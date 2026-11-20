import { t } from "@lingui/macro";
import { Box, Button, Popover, PopoverActions, styled } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { color as d3Color } from "d3-color";
import dynamic from "next/dynamic";
import { MouseEventHandler, useCallback, useMemo, useRef } from "react";

import { useDisclosure } from "@/components/use-disclosure";
import { VisuallyHidden } from "@/components/visually-hidden";
import { Icon } from "@/icons";
import { ColorItem } from "@/palettes";
import { createColorId } from "@/utils/color-palette-utils";
import { hexToHsva, hsvaToHex } from "@/utils/color-utils";
import { focusFirst } from "@/utils/focus-first";

const CustomColorPicker = dynamic(
  () =>
    import("@/configurator/components/color-picker").then(
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
    forcedColorAdjust: "none",
  },
}));

export const Swatch = ({
  color,
  selected,
  onClick,
}: {
  color: string;
  selected: boolean;
  onClick: MouseEventHandler<HTMLButtonElement>;
}) => {
  const classes = useStyles();
  const borderColor = d3Color(color)?.darker().toString();

  return (
    <Box
      component="button"
      type="button"
      aria-label={color}
      aria-pressed={selected}
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
  label,
  selectedHexColor,
  colors,
  onChange,
  disabled,
  colorId,
  onRemove,
}: {
  label: string;
  selectedHexColor: string;
  colors?: ColorItem[] | readonly string[];
  onChange?: (color: string) => void;
  disabled?: boolean;
  colorId?: string;
  onRemove?: (colorId: string) => void;
}) => {
  const { isOpen, open, close } = useDisclosure();
  const buttonRef = useRef(null);
  const { actionRef, contentRef } = usePopoverContent();

  const colorSwatches = useMemo(() => {
    return colors?.map((color) =>
      typeof color === "string" ? { color, id: createColorId() } : color
    );
  }, [colors]);

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
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          onClick={open}
        >
          <VisuallyHidden component="span">
            {t({
              id: "controls.colorpicker.open-for",
              message: `Open color picker: ${label}`,
            })}
          </VisuallyHidden>
          <Icon name="swatch" size={16} />
        </ColorPickerButton>
        {colorId && onRemove && (
          <ColorPickerButton variant="text" onClick={() => onRemove(colorId)}>
            <VisuallyHidden component="span">
              {t({
                id: "controls.colorpicker.remove-for",
                message: `Remove color: ${label}`,
              })}
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
        action={actionRef}
        slotProps={{
          paper: {
            role: "dialog",
            "aria-label": t({
              id: "controls.colorpicker",
              message: "Color picker",
            }),
            sx: { boxShadow: 4 },
          },
        }}
      >
        <div ref={contentRef}>
          <CustomColorPicker
            defaultSelection={initialSelected}
            onChange={handleColorChange}
            colorSwatches={colorSwatches}
          />
        </div>
      </Popover>
    </div>
  );
};

const usePopoverContent = () => {
  const actionRef = useRef<PopoverActions>(null);
  const observerRef = useRef<ResizeObserver>();
  const contentRef = useCallback((node: HTMLDivElement | null) => {
    observerRef.current?.disconnect();

    if (!node) {
      return;
    }

    observerRef.current = new ResizeObserver(() => {
      actionRef.current?.updatePosition();

      if (node.parentElement === document.activeElement) {
        focusFirst(node, '[role="slider"]');
      }
    });
    observerRef.current.observe(node);
  }, []);

  return { actionRef, contentRef };
};
