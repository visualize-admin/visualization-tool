import { Trans } from "@lingui/macro";
import { Box, Button, Theme, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { ReactNode } from "react";

import Flex from "@/components/flex";
import { MaybeTooltip } from "@/components/maybe-tooltip";
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
import SvgIcPen from "@/icons/components/IcPen";
import SvgIcWarningCircle from "@/icons/components/IcWarningCircle";
import useEvent from "@/utils/use-event";

export const ControlTabFieldInner = ({
  chartConfig,
  fieldComponents,
  value,
  onClick,
  checked,
  labelId,
  disabled,
  warnMessage,
}: {
  chartConfig: ChartConfig;
  fieldComponents?: Component[];
  value: string;
  onClick: (x: string) => void;
  labelId: string | null;
  disabled?: boolean;
  warnMessage?: string;
} & FieldProps) => {
  const handleClick = useEvent(() => onClick(value));

  const components = fieldComponents;
  const firstComponent = components?.[0];
  const isActive = overrideChecked(chartConfig, value) || !!firstComponent;

  const labels = components?.map((c) => getComponentLabel(c));

  const { upperLabel, mainLabel } = getLabels(
    chartConfig,
    value,
    labelId,
    labels
  );

  return (
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
        optional={overrideChecked(chartConfig, value) ? false : !firstComponent}
        rightIcon={
          <Flex gap={2}>
            {warnMessage && <WarnIconTooltip title={warnMessage} />}{" "}
            <FieldEditIcon isActive={isActive} />
          </Flex>
        }
      />
    </ControlTabButton>
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
      isActive ? theme.palette.monochrome[800] : theme.palette.monochrome[300],
    width: 18,
    height: 18,
  },
  warn: {
    color: theme.palette.orange.main,
    width: 18,
    height: 18,
    pointerEvents: "auto",
  },
}));

type WarnIconTooltipProps = {
  title: NonNullable<ReactNode>;
};

const WarnIconTooltip = (props: WarnIconTooltipProps) => {
  const { title } = props;
  const iconStyles = useIconStyles({ isActive: false });

  return (
    <MaybeTooltip title={title}>
      <Typography>
        <SvgIcWarningCircle className={iconStyles.warn} />
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

  return <SvgIcPen className={classes.edit} />;
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

export type ControlTabProps = {
  disabled?: boolean;
  onClick: (x: string) => void;
  value: string;
  icon: IconName;
  mainLabel: ReactNode;
  upperLabel?: ReactNode;
  lowerLabel?: ReactNode;
  rightIcon?: ReactNode;
} & FieldProps;

export const ControlTab = ({
  value,
  checked,
  onClick,
  icon,
  upperLabel,
  mainLabel,
  lowerLabel,
  rightIcon,
}: ControlTabProps) => {
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
    width: "100%",
    minWidth: 160,
    padding: `${theme.spacing(2)} ${theme.spacing(4)}`,
    borderColor: theme.palette.primary.main,
    borderRadius: 1.5,
    fontWeight: "normal",
    fontSize: "0.875rem",
    transition: "background-color 0.2s ease",
    backgroundColor: "white",
    cursor: "pointer",
    boxShadow: "none",

    "&:hover": {
      backgroundColor: theme.palette.cobalt[50],
      boxShadow: "none",
    },

    "&.Mui-disabled": {
      cursor: "initial",
      backgroundColor: "transparent",
    },
  },
  controlTabButtonInnerIcon: {
    justifyContent: "center",
    alignItems: "center",
    width: 32,
    minWidth: 32,
    height: 32,
    borderRadius: 2,
    transition: "color 0.2s ease",
  },
}));

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
  onClick: (value: string) => void;
  children: ReactNode;
}) => {
  const classes = useStyles();

  return (
    <Button
      id={`tab-${value}`}
      className={classes.controlTabButton}
      role="tab"
      disabled={disabled}
      aria-selected={checked}
      onClick={() => onClick(value)}
      sx={{
        backgroundColor: checked
          ? (t) => `${t.palette.cobalt[50]} !important`
          : "transparent",
      }}
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
  rightIcon?: ReactNode;
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
            backgroundColor: checked ? "monochrome.800" : "white",

            "& svg": {
              color: checked
                ? "white"
                : optional
                  ? "monochrome.300"
                  : "monochrome.800",
            },
          }}
        >
          <Icon size={24} name={iconName} />
        </Flex>
        <Flex
          sx={{
            flexDirection: "column",
            alignItems: "flex-start",
            mx: 1,
            flexGrow: 1,
          }}
        >
          {upperLabel && (
            <Typography
              variant="caption"
              sx={{
                color:
                  optional && !checked ? "monochrome.300" : "monochrome.500",
              }}
            >
              {upperLabel}
            </Typography>
          )}
          <Typography
            variant="h6"
            component="p"
            textAlign="left"
            fontWeight={700}
            sx={{
              // --- Puts ellipsis on the second line.
              display: "-webkit-box",
              overflow: "hidden",
              textOverflow: "ellipsis",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: "2",
              // ---
              color: optional && !checked ? "monochrome.300" : "monochrome.800",
            }}
          >
            {mainLabel}
          </Typography>
          {lowerLabel && (
            <Typography variant="caption" sx={{ color: "grey.600" }}>
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
