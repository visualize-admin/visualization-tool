import { IconButton, IconButtonProps } from "@mui/material";

export const ToolbarIconButton = ({ style, ...rest }: IconButtonProps) => {
  return (
    <IconButton
      style={{ ...style, padding: "2px", borderRadius: 4 }}
      {...rest}
    />
  );
};
