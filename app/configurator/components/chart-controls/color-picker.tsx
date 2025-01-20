import { Trans } from "@lingui/macro";
import { Box, Button, Popover, styled, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { hexToHsva, hsvaToHex } from "@uiw/react-color";
import { color as d3Color } from "d3-color";
import dynamic from "next/dynamic";
import { MouseEventHandler, useCallback, useMemo, useRef } from "react";

import useDisclosure from "@/components/use-disclosure";
import VisuallyHidden from "@/components/visually-hidden";
import { Icon } from "@/icons";

//have to import dynamically to avoid @uiw/react-color dependency issues with the server
const CustomColorPicker = dynamic(
  () => import("../../components/color-picker"),
  { ssr: false }
);

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
  const borderColor = d3Color(color)?.darker().toString();

  return (
    <Box
      className={classes.swatch}
      sx={{
        borderColor: selected ? borderColor : undefined,
        boxShadow: selected ? `0 0 0.5rem 0 ${color}` : undefined,
        ":hover": { borderColor },
        backgroundColor: color,
      }}
      role="button"
      onClick={onClick}
    />
  );
};

type Props = {
  selectedColor: string;
  colors: readonly string[];
  onChange?: (color: string) => void;
  disabled?: boolean;
};

const ColorPickerButton = styled(Button)({
  padding: 0,
  minWidth: "auto",
  minHeight: "auto",
  lineHeight: "16px",
  backgroundColor: "transparent",
});

const ColorPickerBox = styled(Box)({
  lineHeight: "16px",
  "& > button": {
    backgroundColor: "grey.100",
    borderRadius: 4,
    overflow: "hidden",
    borderWidth: 1,
    p: 0,
  },
  "& > button:hover": {
    backgroundColor: "transparent",
    cursor: "pointer",
    opacity: 0.8,
  },
  "& > button[aria-expanded]": {
    borderColor: "primary.active",
  },
});

export const ColorPickerMenu = (props: Props) => {
  const { disabled, onChange, selectedColor } = props;
  const { isOpen, open, close } = useDisclosure();
  const buttonRef = useRef(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const initialSelected = useMemo(
    () => hexToHsva(selectedColor),
    [selectedColor]
  );

  const handleColorChange = useCallback(
    (color) => {
      const newHex = hsvaToHex(color);
      if (newHex !== selectedColor) {
        onChange?.(newHex);
      }
    },
    [onChange, selectedColor]
  );

  return (
    <ColorPickerBox
      sx={{
        opacity: disabled ? 0.5 : 1,
        pointerEvents: disabled ? "none" : "auto",
      }}
    >
      <ColorPickerButton ref={buttonRef} disabled={disabled} onClick={open}>
        <VisuallyHidden>
          <Trans id="controls.colorpicker.open">Open Color Picker</Trans>
        </VisuallyHidden>
        <Typography
          aria-hidden
          color="primary"
          sx={{ backgroundColor: "transparent" }}
        >
          <Icon name="color" size={16} />
        </Typography>
      </ColorPickerButton>
      <Popover
        anchorEl={buttonRef.current}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        open={isOpen}
        onClose={close}
      >
        <Box ref={popoverRef}>
          <CustomColorPicker
            defaultSelection={initialSelected}
            onChange={handleColorChange}
            colorSwatches={props.colors}
          />
        </Box>
      </Popover>
    </ColorPickerBox>
  );
};
