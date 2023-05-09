import { Trans } from "@lingui/macro";
import { Box, Button, Theme, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import React, { ReactNode } from "react";

import Flex from "@/components/flex";
import { FieldProps } from "@/configurator";
import { getFieldLabel } from "@/configurator/components/field-i18n";
import { getIconName } from "@/configurator/components/ui-helpers";
import { DimensionMetadataFragment } from "@/graphql/query-hooks";
import { Icon, IconName } from "@/icons";
import SvgIcEdit from "@/icons/components/IcEdit";
import useEvent from "@/utils/use-event";

export const ControlTab = ({
  component,
  value,
  onClick,
  checked,
  labelId,
}: {
  component?: DimensionMetadataFragment;
  value: string;
  onClick: (x: string) => void;
  labelId: string;
} & FieldProps) => {
  const handleClick = useEvent(() => onClick(value));

  return (
    <Box sx={{ width: "100%", borderRadius: 1.5, my: "2px" }}>
      <ControlTabButton checked={checked} value={value} onClick={handleClick}>
        <ControlTabButtonInner
          iconName={getIconName(value)}
          upperLabel={getFieldLabel(labelId)}
          mainLabel={
            component?.label ?? <Trans id="controls.color.add">Add…</Trans>
          }
          checked={checked}
          optional={!component}
          rightIcon={<FieldEditIcon />}
        />
      </ControlTabButton>
    </Box>
  );
};

const useFieldIconStyles = makeStyles<Theme>((theme) => ({
  root: {
    color: theme.palette.primary.main,
    width: 18,
    height: 18,
  },
}));

const FieldEditIcon = () => {
  const classes = useFieldIconStyles();
  return <SvgIcEdit className={classes.root} />;
};

export const OnOffControlTab = ({
  value,
  label,
  icon,
  checked,
  active,
  onClick,
}: {
  value: string;
  label: ReactNode;
  icon: string;
  checked?: boolean;
  active?: boolean;
  onClick: (x: string) => void;
}) => {
  return (
    <Box
      sx={{
        width: "100%",
        borderRadius: 1.5,
        my: "2px",
      }}
    >
      <ControlTabButton checked={checked} value={value} onClick={onClick}>
        <ControlTabButtonInner
          iconName={getIconName(icon)}
          mainLabel={label}
          checked={checked}
          isActive={active}
          showIsActive
        />
      </ControlTabButton>
    </Box>
  );
};

export type AnnotatorTabProps = {
  disabled?: boolean;
  onClick: (x: string) => void;
  value: string;
  icon: IconName;
  mainLabel: ReactNode;
  upperLabel?: ReactNode;
  lowerLabel?: ReactNode;
  rightIcon?: ReactNode;
} & FieldProps;

export const AnnotatorTab = ({
  value,
  checked,
  onClick,
  icon,
  upperLabel,
  mainLabel,
  lowerLabel,
  rightIcon,
}: AnnotatorTabProps) => {
  return (
    <Box
      sx={{
        width: "100%",
        borderRadius: 1.5,
        my: "2px",
      }}
    >
      <ControlTabButton
        checked={checked}
        value={value}
        onClick={() => onClick(value)}
      >
        <ControlTabButtonInner
          iconName={icon}
          mainLabel={mainLabel}
          upperLabel={upperLabel}
          lowerLabel={lowerLabel}
          checked={checked}
          rightIcon={rightIcon}
        />
      </ControlTabButton>
    </Box>
  );
};

export const DraggableTab = ({
  component,
  value,
  checked,
  onClick,
  isDragging,
  upperLabel,
  disabled,
  iconName,
}: {
  component: DimensionMetadataFragment;
  disabled?: boolean;
  onClick: (x: string) => void;
  value: string;
  isDragging: boolean;
  upperLabel: ReactNode;
  iconName?: IconName;
} & FieldProps) => {
  return (
    <Box
      sx={{
        boxShadow: isDragging ? "tooltip" : undefined,
        width: "100%",
        borderRadius: 1.5,
        my: "2px",
      }}
    >
      <ControlTabButton
        checked={checked}
        value={value}
        onClick={() => onClick(value)}
      >
        <ControlTabButtonInner
          iconName={iconName ?? getIconName(value)}
          upperLabel={upperLabel}
          mainLabel={component.label}
          checked={checked}
          optional={disabled}
        />
      </ControlTabButton>
    </Box>
  );
};

const useStyles = makeStyles((theme: Theme) => ({
  controlTabButton: {
    color: theme.palette.grey[700],
    borderColor: theme.palette.primary.main,
    borderRadius: 1.5,
    width: "100%",
    minWidth: 160,
    padding: `${theme.spacing(3)} ${theme.spacing(2)}`,
    fontWeight: "normal",

    fontSize: "0.875rem",
    transition: "background-color .2s",
    cursor: "pointer",
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
    },
    "&:active": {
      backgroundColor: theme.palette.action.hover,
    },
    "&.Mui-disabled": {
      cursor: "initial",
      backgroundColor: theme.palette.muted.main,
    },
  },
  controlTabButtonInnerIcon: {
    width: 32,
    height: 32,
    minWidth: 32,
    borderRadius: 2,
    justifyContent: "center",
    alignItems: "center",
  },
}));

// Generic component
export const ControlTabButton = ({
  checked,
  value,
  onClick,
  children,
}: {
  checked?: boolean;
  value: string;
  onClick: (x: string) => void;
  children: ReactNode;
}) => {
  const classes = useStyles();
  return (
    <Button
      role="tab"
      aria-selected={checked}
      aria-controls={`filter-panel-${value}`}
      id={`tab-${value}`}
      onClick={() => onClick(value)}
      className={classes.controlTabButton}
      sx={{ backgroundColor: checked ? "action.hover" : "grey.100" }}
    >
      {children}
    </Button>
  );
};

export const ControlTabButtonInner = ({
  iconName,
  upperLabel,
  mainLabel,
  lowerLabel,
  checked,
  rightIcon,
  optional = false,
  isActive = false,
  showIsActive = false,
}: {
  iconName: IconName;
  upperLabel?: string | ReactNode;
  mainLabel: string | ReactNode;
  lowerLabel?: string | ReactNode;
  checked?: boolean;
  optional?: boolean;
  // On / Off indicator
  isActive?: boolean;
  showIsActive?: boolean;
  rightIcon?: React.ReactNode;
}) => {
  const classes = useStyles();
  return (
    <Flex
      sx={{
        justifyContent: "space-between",
        alignItems: "center",
        flexGrow: 1,
      }}
    >
      <Flex sx={{ justifyContent: "flex-start", alignItems: "center" }}>
        <Flex
          className={classes.controlTabButtonInnerIcon}
          sx={{
            backgroundColor: checked ? "primary.main" : "grey.100",
            color:
              optional && !checked
                ? "grey.500"
                : checked
                ? "grey.100"
                : "grey.700",
          }}
        >
          <Icon size={24} name={iconName} />
        </Flex>

        <Flex
          sx={{
            flexDirection: "column",
            alignItems: "flex-start",
            mx: 3,
            flexGrow: 1,
          }}
        >
          {upperLabel && (
            <Typography
              variant="caption"
              sx={{ color: "grey.600", lineHeight: ["1rem", "1rem", "1rem"] }}
            >
              {upperLabel}
            </Typography>
          )}
          <Typography
            variant="h5"
            sx={{
              color: optional && !checked ? "grey.600" : "grey.800",
              textAlign: "left",
            }}
          >
            {mainLabel}
          </Typography>
          {lowerLabel && (
            <Typography
              variant="caption"
              sx={{ color: "grey.600", lineHeight: ["1rem", "1rem", "1rem"] }}
            >
              {lowerLabel}
            </Typography>
          )}
        </Flex>
      </Flex>
      {showIsActive && isActive === false ? (
        <Box sx={{ mr: 3 }}>
          <Trans id="controls.option.isNotActive">Off</Trans>
        </Box>
      ) : showIsActive && isActive ? (
        <Box sx={{ mr: 3, color: "primary" }}>
          <Trans id="controls.option.isActive">On</Trans>
        </Box>
      ) : null}
      {rightIcon}
    </Flex>
  );
};
