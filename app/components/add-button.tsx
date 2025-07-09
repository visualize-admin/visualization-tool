import { Button, ButtonProps } from "@mui/material";

import { Icon } from "@/icons";

export const AddButton = (props: Omit<ButtonProps, "startIcon">) => {
  return (
    <Button size="sm" startIcon={<Icon name="plus" size={20} />} {...props} />
  );
};
