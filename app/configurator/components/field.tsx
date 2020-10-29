import { t } from "@lingui/macro";
import { I18n } from "@lingui/react";
import { Box, Flex } from "@theme-ui/components";
import { ChangeEvent, ReactNode, useCallback } from "react";
import {
  FIELD_VALUE_NONE,
  FilterValueSingle,
  Option,
  useActiveFieldField,
  useChartFieldField,
  useChartOptionRadioField,
  useConfiguratorState,
  useMetaField,
  useSingleFilterField,
} from "..";
import { Checkbox, Input, Radio, Select } from "../../components/form";
import { getPalette } from "../../domain/helpers";
import {
  ComponentFieldsFragment,
  DimensionFieldsWithValuesFragment,
} from "../../graphql/query-hooks";
import { DataCubeMetadata } from "../../graphql/types";
import { Locales } from "../../locales/locales";
import { SegmentField } from "../config-types";
import { ColorPickerMenu } from "./chart-controls/color-picker";
import {
  AnnotatorTab,
  ControlTab,
  FilterTab,
} from "./chart-controls/control-tab";

export const ControlTabField = ({
  component,
  value,
  disabled,
  labelId,
}: {
  component?: ComponentFieldsFragment;
  value: string;
  disabled?: boolean;
  labelId: string;
}) => {
  const field = useActiveFieldField({
    value,
  });

  return (
    <ControlTab
      component={component}
      value={`${field.value}`}
      labelId={labelId}
      checked={field.checked}
      onClick={field.onClick}
    ></ControlTab>
  );
};

export const FilterTabField = ({
  component,
  value,
  disabled,
}: {
  component: DimensionFieldsWithValuesFragment;
  value: string;
  disabled?: boolean;
}) => {
  const field = useActiveFieldField({
    value,
  });
  const [state] = useConfiguratorState();

  const filterValueIri =
    state.state === "CONFIGURING_CHART" &&
    state.chartConfig.filters[value].type === "single"
      ? (state.chartConfig.filters[value] as FilterValueSingle).value
      : "";
  const filterValue = component.values.find((v) => v.value === filterValueIri)!
    .label;
  return (
    <FilterTab
      label={component.label}
      value={`${field.value}`}
      checked={field.checked}
      disabled={disabled}
      onClick={field.onClick}
      filterValue={filterValue}
    ></FilterTab>
  );
};

export const AnnotatorTabField = ({
  value,
  disabled,
}: {
  value: string;
  disabled?: boolean;
}) => {
  const field = useActiveFieldField({
    value,
  });

  return (
    <AnnotatorTab
      value={`${field.value}`}
      checked={field.checked}
      disabled={disabled}
      onClick={field.onClick}
    ></AnnotatorTab>
  );
};

export const MetaInputField = ({
  label,
  metaKey,
  locale,
  value,
  disabled,
  ...props
}: {
  label: string | ReactNode;
  metaKey: string;
  locale: Locales;
  value?: string;
  disabled?: boolean;
}) => {
  const field = useMetaField({
    metaKey,
    locale,
    value,
  });

  return <Input label={label} {...field} disabled={disabled} />;
};

export const MultiFilterField = ({
  dimensionIri,
  label,
  value,
  disabled,
  allValues,
  checked,
  onChange,
  checkAction,
  color,
}: {
  dimensionIri: string;
  label: string;
  value: string;
  allValues: string[];
  disabled?: boolean;
  checked?: boolean;
  onChange?: () => void;
  checkAction: "ADD" | "SET";
  color?: string;
}) => {
  const [state, dispatch] = useConfiguratorState();

  const onFieldChange = useCallback<(e: ChangeEvent<HTMLInputElement>) => void>(
    (e) => {
      if (e.currentTarget.checked) {
        dispatch({
          type:
            checkAction === "ADD"
              ? "CHART_CONFIG_FILTER_ADD_MULTI"
              : "CHART_CONFIG_FILTER_SET_MULTI",
          value: {
            dimensionIri,
            value,
            allValues,
          },
        });
      } else {
        dispatch({
          type: "CHART_CONFIG_FILTER_REMOVE_MULTI",
          value: {
            dimensionIri,
            value,
            allValues,
          },
        });
      }
      // Call onChange prop
      onChange?.();
    },
    [dispatch, dimensionIri, allValues, value, onChange, checkAction]
  );

  const updateColor = useCallback(
    (color: string) =>
      dispatch({
        type: "CHART_COLOR_CHANGED",
        value: {
          field: "segment",
          value,
          color,
        },
      }),
    [dispatch, value]
  );

  if (state.state !== "CONFIGURING_CHART") {
    return null;
  }

  const filter = state.chartConfig.filters[dimensionIri];
  const fieldChecked =
    filter?.type === "multi" ? filter.values?.[value] ?? false : false;

  return (
    <Flex
      sx={{
        justifyContent: "space-between",
        alignItems: "center",
        mb: 2,
        height: "2rem",
      }}
    >
      <Box sx={{ maxWidth: "82%" }}>
        <Checkbox
          name={dimensionIri}
          value={value}
          label={label}
          disabled={disabled}
          onChange={onFieldChange}
          checked={checked ?? fieldChecked}
        />
      </Box>
      {color && (checked ?? fieldChecked) && (
        <ColorPickerMenu
          colors={getPalette(
            (state.chartConfig.fields.segment as SegmentField)?.palette
          )}
          selectedColor={color}
          onChange={(c) => updateColor(c)}
        />
      )}
    </Flex>
  );
};
export const SingleFilterField = ({
  dimensionIri,
  label,
  value,
  disabled,
}: {
  dimensionIri: string;
  label: string;
  value: string;
  disabled?: boolean;
}) => {
  const field = useSingleFilterField({
    dimensionIri,
    value,
  });

  return <Radio label={label} disabled={disabled} {...field}></Radio>;
};

export const ChartFieldField = ({
  componentIri,
  label,
  field,
  options,
  optional,
  disabled,
  dataSetMetadata,
}: {
  componentIri?: string;
  label: string | ReactNode;
  field: string;
  options: Option[];
  optional?: boolean;
  disabled?: boolean;
  dataSetMetadata: DataCubeMetadata;
}) => {
  const fieldProps = useChartFieldField({
    field,
    dataSetMetadata,
  });

  return (
    <I18n>
      {({ i18n }) => {
        const noneLabel = i18n._(t("controls.dimension.none")`None`);
        return (
          <Select
            key={`select-${field}-dimension`}
            id={field}
            label={label}
            disabled={disabled}
            options={
              optional
                ? [
                    {
                      value: FIELD_VALUE_NONE,
                      label: noneLabel,
                    },
                    ...options,
                  ]
                : options
            }
            {...fieldProps}
          ></Select>
        );
      }}
    </I18n>
  );
};

export const ChartOptionRadioField = ({
  label,
  field,
  path,
  value,
  defaultChecked,
  disabled = false,
}: {
  label: string | ReactNode;
  field: string;
  path: string;
  value: string;
  defaultChecked?: boolean;
  disabled?: boolean;
}) => {
  const fieldProps = useChartOptionRadioField({
    path,
    field,
    value,
  });

  return (
    <Radio
      disabled={disabled}
      label={label}
      {...fieldProps}
      checked={fieldProps.checked ?? defaultChecked}
    ></Radio>
  );
};
