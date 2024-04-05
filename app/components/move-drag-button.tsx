import { Box, BoxProps } from "@mui/material";

import { Icon } from "@/icons";

type MoveDragButtonProps = {
  className?: string;
  dragButtonProps?: BoxProps;
};

export const MoveDragButton = (props: MoveDragButtonProps) => {
  const { className, dragButtonProps } = props;

  return (
    <Box
      display="flex"
      component="span"
      sx={{ cursor: "move" }}
      {...dragButtonProps}
    >
      <Icon className={className} name="dragndrop" />
    </Box>
  );
};
