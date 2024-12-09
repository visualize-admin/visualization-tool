import { Trans } from "@lingui/macro";
import { Box, Button, Theme, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import React, { ReactNode } from "react";

import Flex from "@/components/flex";
import { MaybeTooltip } from "@/components/maybe-tooltip";
import { TooltipTitle } from "@/components/tooltip-utils";
import {
  ChartConfig,
  FieldProps,
  isComboChartConfig,
  overrideChecked,
} from "@/configurator";
import { getFieldLabel } from "@/configurator/components/field-i18n";
import {
  getComponentLabel,
  getIconName,
} from "@/configurator/components/ui-helpers";
import { Component } from "@/domain/data";
import { Icon, IconName } from "@/icons";
import SvgIcEdit from "@/icons/components/IcEdit";
import SvgIcExclamation from "@/icons/components/IcExclamation";
import useEvent from "@/utils/use-event";

type ControlTabProps = {
  chartConfig: ChartConfig;
  fieldComponents?: Component[];
  value: string;
  onClick: (x: string) => void;
  labelId: string | null;
  disabled?: boolean;
  warnMessage?: string;
} & FieldProps;

export const ControlTab = (props: ControlTabProps) => {
  const {
    chartConfig,
    fieldComponents,
    value,
    onClick,
    checked,
    labelId,
    disabled,
    warnMessage,
  } = props;
  const handleClick = useEvent(() => onClick(value));

  const components = fieldComponents;
  const firstComponent = components?.[0];
  const isActive = overrideChecked(chartConfig, value)
    ? true
    : !!firstComponent;

  const labels = components?.map((x) => getComponentLabel(x));

  const { upperLabel, mainLabel } = getLabels(
    chartConfig,
    value,
    labelId,
    labels
  );

  return (
    <Box sx={{ width: "100%", borderRadius: 1.5, my: "2px" }}>
      <ControlTabButton
        disabled={disabled}
        checked={checked}
        value={value}
        onClick={handleClick}
      >
        <ControlTabButtonInner
          iconName={getIconName(value)}
          upperLabel={upperLabel}
          mainLabel={mainLabel}
          isActive={isActive}
          checked={checked}
          optional={
            overrideChecked(chartConfig, value) ? false : !firstComponent
          }
          rightIcon={
            <Flex gap={2}>
              {warnMessage && <WarnIconTooltip title={warnMessage} />}{" "}
              <FieldEditIcon isActive={isActive} />
            </Flex>
          }
        />
      </ControlTabButton>
    </Box>
  );
};

const getLabels = (
  chartConfig: ChartConfig,
  value: string,
  labelId: string | null,
  componentLabels: string[] | undefined
) => {
  switch (value) {
    case "y":
      if (isComboChartConfig(chartConfig)) {
        return {
          upperLabel: getFieldLabel("y"),
          mainLabel: componentLabels?.join(", "),
        };
      }
    default:
      return {
        upperLabel: labelId ? getFieldLabel(labelId) : null,
        mainLabel: componentLabels?.[0] ?? (
          <Trans id="controls.color.add">Add…</Trans>
        ),
      };
  }
};

const useIconStyles = makeStyles<Theme, { isActive: boolean }>((theme) => ({
  edit: {
    color: ({ isActive }) =>
      isActive ? theme.palette.primary.main : theme.palette.grey[500],
    width: 18,
    height: 18,
  },
  warn: {
    color: theme.palette.warning.main,
    width: 18,
    height: 18,
    pointerEvents: "auto",
  },
}));

type WarnIconTooltipProps = {
  title: NonNullable<React.ReactNode>;
};

const WarnIconTooltip = (props: WarnIconTooltipProps) => {
  const { title } = props;
  const iconStyles = useIconStyles({ isActive: false });

  return (
    <MaybeTooltip title={<TooltipTitle text={title} />}>
      <Typography>
        <SvgIcExclamation className={iconStyles.warn} />
      </Typography>
    </MaybeTooltip>
  );
};

type FieldEditIconProps = {
  isActive: boolean;
};

const FieldEditIcon = (props: FieldEditIconProps) => {
  const { isActive } = props;
  const classes = useIconStyles({ isActive });

  return <SvgIcEdit className={classes.edit} />;
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
  component: Component;
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
      backgroundColor: "transparent",
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
const ControlTabButton = ({
  disabled,
  checked,
  value,
  onClick,
  children,
}: {
  disabled?: boolean;
  checked?: boolean;
  value: string;
  onClick: (x: string) => void;
  children: ReactNode;
}) => {
  const classes = useStyles();

  return (
    <Button
      disabled={disabled}
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

const ControlTabButtonInner = ({
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
            color: "grey.700",
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
              sx={{
                color: isActive ? "grey.600" : "grey.500",
                lineHeight: ["1rem", "1rem", "1rem"],
              }}
            >
              {upperLabel}
            </Typography>
          )}
          <Typography
            variant="h5"
            sx={{
              color: optional && !checked ? "grey.500" : "grey.800",
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
