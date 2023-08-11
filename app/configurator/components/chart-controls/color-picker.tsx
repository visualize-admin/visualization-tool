import { Trans } from "@lingui/macro";
import { Box, Button, Input, Popover, styled, Theme } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { color as d3Color } from "d3";
import React, { MouseEventHandler, useCallback, useRef, useState } from "react";

import useDisclosure from "@/components/use-disclosure";
import VisuallyHidden from "@/components/visually-hidden";

const useStyles = makeStyles(() => ({
  swatch: {
    width: "1.5rem",
    height: "1.5rem",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "transparent",
    borderRadius: 1.5,
    padding: 0,
    cursor: "pointer",
  },
}));

const Swatch = ({
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
    ></Box>
  );
};

type Props = {
  selectedColor: string;
  colors: readonly string[];
  onChange?: (color: string) => void;
  disabled?: boolean;
};

const useColorPickerStyles = makeStyles((theme: Theme) => ({
  root: {
    width: 160,
    backgroundColor: theme.palette.grey[100],
    borderRadius: 1.5,
    padding: theme.spacing(3),
  },
  swatches: {
    gridTemplateColumns: "repeat(auto-fill, minmax(1.5rem, 1fr))",
    gap: 2,
    marginBottom: 2,
  },
  input: {
    color: theme.palette.grey[700],
    borderColor: theme.palette.divider,
    backgroundColor: theme.palette.grey[100],
    fontSize: "0.875rem",
    "&:focus": { outline: "none", borderColor: theme.palette.primary.main },
  },
}));

export const ColorPicker = ({ selectedColor, colors, onChange }: Props) => {
  const [inputColorValue, setInputColorValue] = useState(selectedColor);

  const selectColor = useCallback(
    (_color) => {
      setInputColorValue(_color);
      // Make sure onChange is only called with valid colors
      const c = d3Color(_color);

      if (c) {
        onChange?.(_color);
      }
    },
    [onChange, setInputColorValue]
  );

  const formatInputColor = useCallback(
    (_color) => {
      // Make sure onChange is only called with valid colors
      const c = d3Color(_color);

      if (c) {
        setInputColorValue(_color);
      }
    },
    [setInputColorValue]
  );

  const classes = useColorPickerStyles();

  return (
    <Box className={classes.root}>
      <Box display="grid" className={classes.swatches}>
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
          className={classes.input}
          value={inputColorValue}
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
          />
        </Box>
      </ColorPickerButton>
      <Popover anchorEl={buttonRef.current} open={isOpen} onClose={close}>
        <ColorPicker {...props} />
      </Popover>
    </ColorPickerBox>
  );
};
