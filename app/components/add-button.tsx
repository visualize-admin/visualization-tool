import { Button, ButtonProps } from "@mui/material";

import { Icon } from "@/icons";

export const AddButton = (props: ButtonProps) => {
  const { sx, ...rest } = props;

  return (
    <Button
      color="primary"
      variant="contained"
      startIcon={<Icon name="add" />}
      sx={{
        width: "fit-content",
        ml: "0.5rem",
        px: 3,
        ...sx,
      }}
      {...rest}
    />
  );
};
