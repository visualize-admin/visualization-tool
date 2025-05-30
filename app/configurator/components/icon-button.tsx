import { ButtonBase, Theme, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import clsx from "clsx";
import { SyntheticEvent } from "react";

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
    borderRadius: 2,
    transition: theme.transitions.create(["background-color", "color"], {
      duration: theme.transitions.duration.shorter,
    }),
    cursor: "pointer",

    "&:hover": {
      backgroundColor: theme.palette.monochrome[100],
    },

    "& svg": {
      color: theme.palette.monochrome[800],
    },
  },
  checked: {
    backgroundColor: theme.palette.monochrome[800],
    color: "white",

    "&:hover": {
      backgroundColor: theme.palette.monochrome[800],
    },

    "& svg": {
      color: "white",
    },
  },
  disabled: {
    cursor: "initial",
    color: theme.palette.monochrome[500],

    "& svg": {
      color: theme.palette.monochrome[500],
    },
  },
}));

export const IconButton = ({
  label,
  value,
  checked,
  disabled,
  onClick,
  iconSize = 24,
}: {
  label: string;
  disabled?: boolean;
  onClick: (e: SyntheticEvent<HTMLButtonElement>) => void;
  iconSize?: number;
} & FieldProps) => {
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
      <Icon name={getIconName(label)} size={iconSize} />
      <Typography variant="caption" sx={{ mt: 2 }}>
        {getFieldLabel(label)}
      </Typography>
    </ButtonBase>
  );
};
