import * as React from "react";
import { Button, Flex, Text } from "@theme-ui/components";
import { ComponentWithMeta, getDimensionLabel } from "../../domain";
import { FieldProps } from "../../domain/config-form";
import { Icon, IconName } from "../../icons";
import { getFieldLabel, getIconName } from "../../domain/helpers";

export const ControlTab = ({
  component,
  value,
  disabled,
  onClick,
  checked
}: {
  component?: ComponentWithMeta;
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
        lowerLabel={component && getDimensionLabel(component)}
        checked={checked}
      />
    </Button>
  );
};
export const FilterTab = ({
  component,
  value,
  checked,
  disabled,
  onClick,
  filterValue
}: {
  component?: ComponentWithMeta;
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
        upperLabel={component && getDimensionLabel(component)}
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
  checked
}: {
  iconName: IconName;
  upperLabel?: string | React.ReactNode;
  lowerLabel: string | React.ReactNode;
  checked?: boolean;
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
      color={checked ? "monochrome100" : "monochrome700"}
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
          color: "monochrome800",
          lineHeight: [1, 1, 1],
          textAlign: "left"
        }}
      >
        {lowerLabel}
      </Text>
    </Flex>
  </Flex>
);
