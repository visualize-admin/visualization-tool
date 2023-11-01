import { Trans } from "@lingui/macro";
import { Box, Button, Popover, styled, Theme, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { color as d3Color } from "d3";
import { MouseEventHandler, useCallback, useRef } from "react";

import useDisclosure from "@/components/use-disclosure";
import VisuallyHidden from "@/components/visually-hidden";
import { Icon } from "@/icons";

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
    />
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
}));

export const ColorPicker = ({ selectedColor, colors, onChange }: Props) => {
  const classes = useColorPickerStyles();
  const selectColor = useCallback(
    (_color) => {
      // Make sure onChange is only called with valid colors
      const c = d3Color(_color);

      if (c) {
        onChange?.(_color);
      }
    },
    [onChange]
  );

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
    </Box>
  );
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
  const { disabled } = props;
  const { isOpen, open, close } = useDisclosure();
  const buttonRef = useRef(null);

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
      <Popover anchorEl={buttonRef.current} open={isOpen} onClose={close}>
        <ColorPicker {...props} />
      </Popover>
    </ColorPickerBox>
  );
};
