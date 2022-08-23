import { Trans } from "@lingui/macro";
import { Box, Button, Typography } from "@mui/material";
import { ReactNode } from "react";

import Flex from "@/components/flex";
import { FieldProps } from "@/configurator";
import {
  getFieldLabel,
  getIconName,
} from "@/configurator/components/ui-helpers";
import { DimensionMetadataFragment } from "@/graphql/query-hooks";
import { Icon, IconName } from "@/icons";

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
        borderRadius: 1.5,
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
    role="tab"
    aria-selected={checked}
    aria-controls={`filter-panel-${value}`}
    id={`tab-${value}`}
    onClick={() => onClick(value)}
    sx={{
      backgroundColor: checked ? "action.hover" : "grey.100",
      color: "grey.700",
      borderColor: "primary",
      borderRadius: 1.5,
      width: "100%",
      minWidth: 160,
      px: 2,
      py: 3,
      fontWeight: "normal",

      fontSize: "0.875rem",
      transition: "background-color .2s",
      cursor: "pointer",
      ":hover": {
        backgroundColor: "action.hover",
      },
      ":active": {
        backgroundColor: "action.hover",
      },
      ":disabled": {
        cursor: "initial",
        backgroundColor: "muted.main",
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
  <Flex
    sx={{
      justifyContent: "space-between",
      alignItems: "center",
      flexGrow: 1,
    }}
  >
    <Flex sx={{ justifyContent: "flex-start", alignItems: "center" }}>
      <Flex
        sx={{
          width: 32,
          height: 32,
          minWidth: 32,
          borderRadius: 2,
          justifyContent: "center",
          alignItems: "center",
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
