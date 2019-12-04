import * as React from "react";
import { FieldProps } from "../../domain/config-form";
import { Flex, Text } from "rebass";
import { Icon, IconName } from "../../icons";
import { Button } from "rebass";
import { ComponentWithMeta, getDimensionLabel } from "../../domain";
import { Trans } from "@lingui/macro";

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
      bg={checked ? "blueGreyDarker" : "monochrome.100"}
    >
      <Flex justifyContent="flex-start" alignItems="center">
        <Flex
          width={32}
          height={32}
          sx={{ minWidth: 32, borderRadius: "bigger" }}
          bg={checked ? "primary.base" : "monochrome.100"}
          color={checked ? "monochrome.100" : "monochrome.700"}
          justifyContent="center"
          alignItems="center"
        >
          <Icon size={24} name={value as IconName} />
        </Flex>
        <Flex flexDirection="column" alignItems="flex-start" mx={2}>
          <Text
            variant="meta"
            sx={{ color: "monochrome.600", lineHeight: [1, 1, 1] }}
          >
            {getFieldLabel(value)}
          </Text>
          <Text
            variant="paragraph1"
            sx={{
              color: "monochrome.900",
              lineHeight: [1, 1, 1],
              textAlign: "left"
            }}
          >
            {component && getDimensionLabel(component)}
          </Text>
        </Flex>
      </Flex>
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
      bg={checked ? "blueGreyDarker" : "monochrome.100"}
    >
      <Flex justifyContent="flex-start" alignItems="center">
        <Flex
          width={32}
          height={32}
          sx={{ minWidth: 32, borderRadius: "bigger" }}
          bg={checked ? "primary.base" : "monochrome.100"}
          color={checked ? "monochrome.100" : "monochrome.700"}
          justifyContent="center"
          alignItems="center"
        >
          <Icon size={24} name={"table"} />
        </Flex>
        <Flex flexDirection="column" alignItems="flex-start" mx={2}>
          <Text
            variant="meta"
            sx={{ color: "monochrome.600", lineHeight: [1, 1, 1] }}
          >
            {component && getDimensionLabel(component)}
          </Text>
          <Text
            variant="paragraph1"
            sx={{
              color: "monochrome.900",
              lineHeight: [1, 1, 1],
              textAlign: "left"
            }}
          >
            {filterValue}
          </Text>
        </Flex>
      </Flex>
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
      bg={checked ? "blueGreyDarker" : "monochrome.100"}
    >
      <Flex justifyContent="flex-start" alignItems="center">
        <Flex
          width={32}
          height={32}
          sx={{ minWidth: 32, borderRadius: "bigger" }}
          bg={checked ? "primary.base" : "monochrome.100"}
          color={checked ? "monochrome.100" : "monochrome.700"}
          justifyContent="center"
          alignItems="center"
        >
          <Icon size={24} name={"text"} />
        </Flex>
        <Flex flexDirection="column" alignItems="flex-start" mx={2}>
          <Text
            variant="meta"
            sx={{ color: "monochrome.600", lineHeight: [1, 1, 1] }}
          >
            {/* {getFieldLabel(value as string)} */}
          </Text>
          <Text
            variant="paragraph1"
            sx={{
              color: "monochrome.900",
              lineHeight: [1, 1, 1],
              textAlign: "left"
            }}
          >
            {getFieldLabel(value as string)}
          </Text>
        </Flex>
      </Flex>
    </Button>
  );
};

export const getFieldLabel = (field: string): React.ReactNode => {
  switch (field) {
    case "x":
      return <Trans>Horizontal axis</Trans>;
    case "y":
      return <Trans>Measure</Trans>;
    case "segment":
      return <Trans>Segmentation</Trans>;
    case "title":
      return <Trans>Title</Trans>;
    case "description":
      return <Trans>Description</Trans>;
    default:
      return field;
  }
};
