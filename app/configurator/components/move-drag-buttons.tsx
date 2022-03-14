import { Box, BoxProps, Button, ButtonProps } from "@mui/material";
import { Icon } from "../../icons";

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
      <Button
        className={className}
        variant="arrow"
        onClick={onClickUp}
        sx={{ mb: -1 }}
        {...moveUpButtonProps}
      >
        <Icon name="caretUp" height="16" />
      </Button>
      <Box as="span" sx={{ cursor: "move" }} {...dragButtonProps}>
        <Icon className={className} name="dragndrop" />
      </Box>
      <Button
        className={className}
        variant="arrow"
        onClick={onClickDown}
        sx={{ mt: -1 }}
        {...moveDownButtonProps}
      >
        <Icon name="caretDown" height="16" />
      </Button>
    </>
  );
};

export default MoveDragButtons;
