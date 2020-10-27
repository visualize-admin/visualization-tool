import { Trans } from "@lingui/macro";
import { Button, Flex, Text } from "@theme-ui/components";

import { FieldProps } from "../..";
import { getFieldLabel, getIconName } from "../ui-helpers";
import { ComponentFieldsFragment } from "../../../graphql/query-hooks";
import { Icon, IconName } from "../../../icons";
import { ReactNode } from "react";

export const ControlTab = ({
  component,
  value,
  disabled,
  onClick,
  checked,
  labelId,
}: {
  component?: ComponentFieldsFragment;
  disabled?: boolean;
  value: string;
  onClick: (x: string) => void;
  labelId: string;
} & FieldProps) => {
  return (
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
            <Trans id="controls.partition.add">Add ...</Trans>
          )
        }
        checked={checked}
        optional={!component}
      />
    </ControlTabButton>
  );
};

export const FilterTab = ({
  label,
  value,
  checked,
  disabled,
  onClick,
  filterValue,
}: {
  label: string;
  disabled?: boolean;
  onClick: (x: string) => void;
  filterValue: string;
  value: string;
} & FieldProps) => {
  return (
    <ControlTabButton
      checked={checked}
      value={value}
      onClick={() => onClick(value)}
    >
      <ControlTabButtonInner
        iconName={"table"}
        upperLabel={label}
        lowerLabel={filterValue}
        checked={checked}
      />
    </ControlTabButton>
  );
};
export const AnnotatorTab = ({
  value,
  checked,
  onClick,
}: {
  disabled?: boolean;
  onClick: (x: string) => void;
  value: string;
} & FieldProps) => {
  return (
    <ControlTabButton
      checked={checked}
      value={value}
      onClick={() => onClick(value)}
    >
      <ControlTabButtonInner
        iconName={value as IconName}
        lowerLabel={getFieldLabel(value)}
        checked={checked}
      />
    </ControlTabButton>
  );
};

// Generic component
const ControlTabButton = ({
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
    variant="reset"
    value={value}
    role="tab"
    aria-selected={checked}
    aria-controls={`filter-panel-${value}`}
    id={`tab-${value}`}
    onClick={() => onClick(value)}
    sx={{
      bg: checked ? "mutedDarker" : "monochrome100",
      color: "monochrome700",
      borderColor: "primary",
      borderRadius: "default",
      width: "100%",
      minWidth: 160,
      maxWidth: 300,
      my: "2px",
      px: 2,
      py: 3,
      fontFamily: "body",
      fontSize: [3, 3, 3],
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

const ControlTabButtonInner = ({
  iconName,
  upperLabel,
  lowerLabel,
  checked,
  optional = false,
}: {
  iconName: IconName;
  upperLabel?: string | ReactNode;
  lowerLabel: string | ReactNode;
  checked?: boolean;
  optional?: boolean;
}) => (
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
            ? "monochrome600"
            : checked
            ? "monochrome100"
            : "monochrome700",
      }}
    >
      <Icon size={24} name={iconName} />
    </Flex>
    <Flex sx={{ flexDirection: "column", alignItems: "flex-start", mx: 3 }}>
      {upperLabel && (
        <Text
          variant="meta"
          sx={{ color: "monochrome600", lineHeight: [1, 1, 1] }}
        >
          {upperLabel}
        </Text>
      )}
      <Text
        variant="paragraph1"
        sx={{
          color: optional && !checked ? "monochrome600" : "monochrome800",
          lineHeight: [1, 1, 1],
          textAlign: "left",
        }}
      >
        {lowerLabel}
      </Text>
    </Flex>
  </Flex>
);
