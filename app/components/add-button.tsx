import { Button, ButtonProps } from "@mui/material";

import { Icon } from "@/icons";

export const AddButton = (props: ButtonProps) => {
  const { sx, ...rest } = props;

  return (
    <Button
      color="blue"
      variant="contained"
      startIcon={<Icon name="plus" />}
      sx={{
        width: "fit-content",
        minWidth: "auto",
        ml: "0.5rem",
        px: 3,
        whiteSpace: "nowrap",
        ...sx,
      }}
      {...rest}
    />
  );
};
