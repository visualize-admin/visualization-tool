import { Button, ButtonProps } from "@mui/material";
import { ComponentProps } from "react";

import { Icon } from "@/icons";

export const AddButton = (props: Omit<ButtonProps, "startIcon">) => {
  return (
    <Button size="sm" startIcon={<Icon name="plus" size={20} />} {...props} />
  );
};

export const ConfiguratorAddButton = (
  props: ComponentProps<typeof AddButton>
) => {
  return (
    <AddButton
      size="sm"
      variant="outlined"
      sx={{ width: "fit-content", mt: 4 }}
      {...props}
    />
  );
};
