import { Button, ButtonProps } from "@mui/material";

import { Icon } from "@/icons";

export const AddButton = (props: ButtonProps) => {
  const { sx, ...rest } = props;

  return (
    <Button size="sm" startIcon={<Icon name="plus" size={20} />} {...rest} />
  );
};
