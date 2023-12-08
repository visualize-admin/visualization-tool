import { ButtonBase, Theme, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import clsx from "clsx";

import { getFieldLabel } from "@/configurator/components/field-i18n";
import { getIconName } from "@/configurator/components/ui-helpers";
import { FieldProps } from "@/configurator/config-form";
import { Icon } from "@/icons";

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    width: 91,
    height: 64,
    borderRadius: 8,
    transition: theme.transitions.create(["background-color", "color"], {
      duration: theme.transitions.duration.shorter,
    }),
    cursor: "pointer",

    "&:hover": {
      backgroundColor: theme.palette.action.hover,
    },
    "& svg": {
      color: theme.palette.primary.main,
    },
  },
  checked: {
    backgroundColor: theme.palette.primary.main,
    color: "white",

    "&:hover": {
      backgroundColor: theme.palette.primary.main,
    },
    "& svg": {
      color: "white",
    },
  },
  disabled: {
    cursor: "initial",

    "& svg": {
      color: theme.palette.grey[500],
    },
  },
}));

type IconButtonProps = {
  label: string;
  disabled?: boolean;
  onClick: (e: React.SyntheticEvent<HTMLButtonElement>) => void;
} & FieldProps;

export const IconButton = (props: IconButtonProps) => {
  const { label, value, checked, disabled, onClick } = props;
  const classes = useStyles();

  return (
    <ButtonBase
      tabIndex={0}
      value={value}
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        classes.root,
        disabled ? classes.disabled : null,
        checked ? classes.checked : null
      )}
    >
      <Icon size={24} name={getIconName(label)} />
      <Typography
        variant="caption"
        sx={{ color: disabled ? "text.primary" : "inherit", mt: 1 }}
      >
        {getFieldLabel(label)}
      </Typography>
    </ButtonBase>
  );
};
