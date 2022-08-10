import { Trans } from "@lingui/macro";
import { Box, Button, Input, Popover, styled } from "@mui/material";
import { color as d3Color } from "d3";
import React, { MouseEventHandler, useCallback, useRef, useState } from "react";

import VisuallyHidden from "@/components/visually-hidden";
import useDisclosure from "@/configurator/components/use-disclosure";

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
          inputProps={{
            maxLength: 7,
          }}
          value={`#${inputColorValue.replace(/^#/, "")}`}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
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

const ColorPickerButton = styled(Button)({
  padding: 0,
  minWidth: "auto",
  minHeight: "auto",
  lineHeight: "16px",
});

const ColorPickerBox = styled(Box)(({ theme }) => ({
  lineHeight: "16px",
  "& > button": {
    backgroundColor: "grey.100",
    borderRadius: 4,
    overflow: "hidden",
    borderWidth: 1,
    border: `1px solid ${theme.palette.divider}`,
    p: 0,
  },
  "& > button:hover": {
    cursor: "pointer",
  },
  "& > button[aria-expanded]": {
    borderColor: "primary.active",
  },
}));

export const ColorPickerMenu = (props: Props) => {
  const { selectedColor } = props;
  const borderColor = d3Color(selectedColor)?.darker().toString();
  const { isOpen, open, close } = useDisclosure();
  const buttonRef = useRef(null);
  return (
    <ColorPickerBox
      sx={{
        "> button:hover": {
          borderColor,
          cursor: "pointer",
        },
        opacity: props.disabled ? 0.5 : 1,
        pointerEvents: props.disabled ? "none" : "auto",
      }}
    >
      <ColorPickerButton
        ref={buttonRef}
        disabled={props.disabled}
        onClick={open}
      >
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
      </ColorPickerButton>
      <Popover anchorEl={buttonRef.current} open={isOpen} onClose={close}>
        <ColorPicker {...props} />
      </Popover>
    </ColorPickerBox>
  );
};
