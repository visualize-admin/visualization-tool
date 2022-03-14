import Flex from "../../../components/flex";
import { Trans } from "@lingui/macro";
import { ReactNode } from "react";
import { Box, Button, Typography } from "@mui/material";
import { FieldProps } from "../..";
import { DimensionMetaDataFragment } from "../../../graphql/query-hooks";
import { Icon, IconName } from "../../../icons";
import { getFieldLabel, getIconName } from "../ui-helpers";

export const ControlTab = ({
  component,
  value,
  onClick,
  checked,
  labelId,
}: {
  component?: DimensionMetaDataFragment;
  value: string;
  onClick: (x: string) => void;
  labelId: string;
} & FieldProps) => {
  return (
    <Box
      sx={{
        width: "100%",
        borderRadius: "default",
        my: "2px",
      }}
    >
      <ControlTabButton
        checked={checked}
        value={value}
        onClick={() => onClick(value)}
      >
        <ControlTabButtonInner
          iconName={getIconName(value)}
          upperLabel={getFieldLabel(labelId)}
          lowerLabel={
            component ? (
              component.label
            ) : (
              <Trans id="controls.color.add">Add ...</Trans>
            )
          }
          checked={checked}
          optional={!component}
        />
      </ControlTabButton>
    </Box>
  );
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
        borderRadius: "default",
        my: "2px",
      }}
    >
      <ControlTabButton checked={checked} value={value} onClick={onClick}>
        <ControlTabButtonInner
          iconName={getIconName(icon)}
          lowerLabel={label}
          checked={checked}
          isActive={active}
          showIsActive
        />
      </ControlTabButton>
    </Box>
  );
};

export const AnnotatorTab = ({
  value,
  checked,
  onClick,
  icon,
  label,
}: {
  disabled?: boolean;
  onClick: (x: string) => void;
  value: string;
  icon: IconName;
  label: ReactNode;
} & FieldProps) => {
  return (
    <Box
      sx={{
        width: "100%",
        borderRadius: "default",
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
          lowerLabel={label}
          checked={checked}
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
  component: DimensionMetaDataFragment;
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
        borderRadius: "default",
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
          lowerLabel={component.label}
          checked={checked}
          optional={disabled}
        />
      </ControlTabButton>
    </Box>
  );
};

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
}) => (
  <Button
    component="div"
    variant="reset"
    value={value}
    role="tab"
    aria-selected={checked}
    aria-controls={`filter-panel-${value}`}
    id={`tab-${value}`}
    onClick={() => onClick(value)}
    sx={{
      bg: checked ? "mutedDarker" : "monochrome100",
      color: "grey.700",
      borderColor: "primary",
      borderRadius: "default",
      width: "100%",
      minWidth: 160,
      px: 2,
      py: 3,

      fontSize: ["0.875rem", "0.875rem", "0.875rem"],
      transition: "background-color .2s",
      cursor: "pointer",
      ":hover": {
        bg: "mutedDarker",
      },
      ":active": {
        bg: "mutedDarker",
      },
      ":disabled": {
        cursor: "initial",
        bg: "muted",
      },
    }}
  >
    {children}
  </Button>
);

export const ControlTabButtonInner = ({
  iconName,
  upperLabel,
  lowerLabel,
  checked,
  optional = false,
  isActive = false,
  showIsActive = false,
}: {
  iconName: IconName;
  upperLabel?: string | ReactNode;
  lowerLabel: string | ReactNode;
  checked?: boolean;
  optional?: boolean;
  // On / Off indicator
  isActive?: boolean;
  showIsActive?: boolean;
}) => (
  <Flex sx={{ justifyContent: "space-between", alignItems: "center" }}>
    <Flex sx={{ justifyContent: "flex-start", alignItems: "center" }}>
      <Flex
        sx={{
          width: 32,
          height: 32,
          minWidth: 32,
          borderRadius: "bigger",
          justifyContent: "center",
          alignItems: "center",
          bg: checked ? "primary" : "monochrome100",
          color:
            optional && !checked
              ? "monochrome500"
              : checked
              ? "monochrome100"
              : "monochrome700",
        }}
      >
        <Icon size={24} name={iconName} />
      </Flex>

      <Flex sx={{ flexDirection: "column", alignItems: "flex-start", mx: 3 }}>
        {upperLabel && (
          <Typography
            variant="meta"
            sx={{ color: "grey.600", lineHeight: [1, 1, 1] }}
          >
            {upperLabel}
          </Typography>
        )}
        <Typography
          variant="body1"
          sx={{
            color: optional && !checked ? "monochrome600" : "monochrome800",
            lineHeight: [1, 1, 1],
            textAlign: "left",
          }}
        >
          {lowerLabel}
        </Typography>
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
  </Flex>
);
