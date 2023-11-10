import { Box, BoxProps, ButtonProps, styled } from "@mui/material";

import { Icon } from "@/icons";

const ArrowButton = styled("button", { label: "ArrowButton" })({
  margin: 0,
  padding: 0,
  border: 0,
  display: "flex",
  backgroundColor: "transparent",
});

const MoveDragButtons = ({
  onClickUp,
  onClickDown,
  className,
  moveUpButtonProps,
  moveDownButtonProps,
  dragButtonProps,
}: {
  onClickUp: () => void;
  onClickDown: () => void;
  className?: string;
  moveUpButtonProps?: ButtonProps;
  moveDownButtonProps?: ButtonProps;
  dragButtonProps?: BoxProps;
}) => {
  return (
    <>
      <ArrowButton
        variant="text"
        className={className}
        onClick={onClickUp}
        sx={{ mb: -1 }}
        {...moveUpButtonProps}
      >
        <Icon name="caretUp" height="16" />
      </ArrowButton>
      <Box
        display="flex"
        component="span"
        sx={{ cursor: "move" }}
        {...dragButtonProps}
      >
        <Icon className={className} name="dragndrop" />
      </Box>
      <ArrowButton
        variant="text"
        className={className}
        onClick={onClickDown}
        sx={{ mt: -1 }}
        {...moveDownButtonProps}
      >
        <Icon name="caretDown" height="16" />
      </ArrowButton>
    </>
  );
};

export default MoveDragButtons;
