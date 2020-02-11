import { Trans } from "@lingui/macro";
import { Button, Flex, Text } from "@theme-ui/components";
import * as React from "react";
import { FieldProps } from "../../domain/config-form";
import { getFieldLabel, getIconName } from "../../domain/helpers";
import { ComponentFieldsFragment } from "../../graphql/query-hooks";
import { Icon, IconName } from "../../icons";

export const ControlTab = ({
  component,
  value,
  disabled,
  onClick,
  checked
}: {
  component?: ComponentFieldsFragment;
  disabled?: boolean;
  value: string;
  onClick: (x: string) => void;
} & FieldProps) => {
  return (
    <Button
      variant="control"
      value={value}
      onClick={() => onClick(value)}
      role="tab"
      aria-selected={checked}
      aria-controls={`control-panel-${value}`}
      id={`tab-${value}`}
      bg={checked ? "blueGreyDarker" : "monochrome100"}
    >
      <LeftPanelTabContent
        iconName={getIconName(value)}
        upperLabel={getFieldLabel(value)}
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
    </Button>
  );
};

export const FilterTab = ({
  label,
  value,
  checked,
  disabled,
  onClick,
  filterValue
}: {
  label: string;
  disabled?: boolean;
  onClick: (x: string) => void;
  filterValue: string;
  value: string;
} & FieldProps) => {
  return (
    <Button
      variant="control"
      value={value}
      role="tab"
      aria-selected={checked}
      aria-controls={`filter-panel-${value}`}
      id={`tab-${value}`}
      onClick={() => onClick(value)}
      bg={checked ? "blueGreyDarker" : "monochrome100"}
    >
      <LeftPanelTabContent
        iconName={"table"}
        upperLabel={label}
        lowerLabel={filterValue}
        checked={checked}
      />
    </Button>
  );
};
export const AnnotatorTab = ({
  value,
  checked,
  onClick
}: {
  disabled?: boolean;
  onClick: (x: string) => void;
  value: string;
} & FieldProps) => {
  return (
    <Button
      variant="control"
      value={value}
      onClick={() => onClick(value)}
      bg={checked ? "blueGreyDarker" : "monochrome100"}
    >
      <LeftPanelTabContent
        iconName={"text"}
        lowerLabel={getFieldLabel(value)}
        checked={checked}
      />
    </Button>
  );
};

const LeftPanelTabContent = ({
  iconName,
  upperLabel,
  lowerLabel,
  checked,
  optional = false
}: {
  iconName: IconName;
  upperLabel?: string | React.ReactNode;
  lowerLabel: string | React.ReactNode;
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
        alignItems: "center"
      }}
      bg={checked ? "primary" : "monochrome100"}
      color={
        optional && !checked
          ? "monochrome600"
          : checked
          ? "monochrome100"
          : "monochrome700"
      }
    >
      <Icon size={24} name={iconName} />
    </Flex>
    <Flex mx={3} sx={{ flexDirection: "column", alignItems: "flex-start" }}>
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
          textAlign: "left"
        }}
      >
        {lowerLabel}
      </Text>
    </Flex>
  </Flex>
);
