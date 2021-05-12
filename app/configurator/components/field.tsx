import { t } from "@lingui/macro";
import get from "lodash/get";
import { ChangeEvent, ReactNode, useCallback, useMemo } from "react";
import { Box, Flex } from "theme-ui";
import {
  Option,
  useActiveFieldField,
  useChartFieldField,
  useChartOptionRadioField,
  useConfiguratorState,
  useMetaField,
  useSingleFilterField,
} from "..";
import { Checkbox, Input, Label, Radio, Select } from "../../components/form";
import { DimensionFieldsFragment } from "../../graphql/query-hooks";
import { DataCubeMetadata } from "../../graphql/types";
import { IconName } from "../../icons";
import {
  useChartOptionBooleanField,
  useChartOptionSelectField,
  useSingleFilterSelect,
} from "../config-form";
import { FIELD_VALUE_NONE } from "../constants";
import { ColorPickerMenu } from "./chart-controls/color-picker";
import { AnnotatorTab, ControlTab } from "./chart-controls/control-tab";
import { getPalette } from "./ui-helpers";

export const ControlTabField = ({
  component,
  value,
  disabled,
  labelId,
}: {
  component?: DimensionFieldsFragment;
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

export const DataFilterSelect = ({
  dimensionIri,
  label,
  options,
  id,
  disabled,
  isOptional,
}: {
  dimensionIri: string;
  label: string;
  options: Option[];
  id: string;
  disabled?: boolean;
  isOptional?: boolean;
}) => {
  const fieldProps = useSingleFilterSelect({ dimensionIri });

  const noneLabel = t({
    id: "controls.dimensionvalue.none",
    message: `No Filter`,
  });

  const optionalLabel = t({
    id: "controls.select.optional",
    message: `optional`,
  });

  const allOptions = useMemo(() => {
    return isOptional
      ? [
          {
            value: FIELD_VALUE_NONE,
            label: noneLabel,
            isNoneValue: true,
          },
          ...options,
        ]
      : options;
  }, [isOptional, options, noneLabel]);

  return (
    <Select
      id={id}
      label={isOptional ? `${label} (${optionalLabel})` : label}
      disabled={disabled}
      options={allOptions}
      {...fieldProps}
    ></Select>
  );
};

export const AnnotatorTabField = ({
  value,
  ...tabProps
}: {
  value: string;
  disabled?: boolean;
  icon: IconName;
  label: ReactNode;
}) => {
  const fieldProps = useActiveFieldField({
    value,
  });

  return (
    <AnnotatorTab
      {...tabProps}
      value={`${fieldProps.value}`}
      checked={fieldProps.checked}
      onClick={fieldProps.onClick}
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
  locale: string;
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
  colorConfigPath,
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
  colorConfigPath?: string;
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
    (color: string) => {
      if (state.activeField) {
        dispatch({
          type: "CHART_COLOR_CHANGED",
          value: {
            field: state.activeField,
            colorConfigPath,
            color,
            value,
          },
        });
      }
    },
    [colorConfigPath, dispatch, state.activeField, value]
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
            get(
              state,
              `chartConfig.fields["${state.activeField}"].${
                colorConfigPath ?? ""
              }.palette`
            )
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

export const ColorPickerField = ({
  field,
  path,
  label,
}: {
  field: string;
  path: string;
  label: ReactNode;
}) => {
  const [state, dispatch] = useConfiguratorState();

  const updateColor = useCallback(
    (value: string) =>
      dispatch({
        type: "CHART_OPTION_CHANGED",
        value: {
          field,
          path,
          value,
        },
      }),
    [dispatch, field, path]
  );

  if (state.state !== "CONFIGURING_CHART") {
    return null;
  }

  const color = get(state, `chartConfig.fields["${field}"].${path}`);

  return (
    <Flex
      sx={{
        justifyContent: "space-between",
        alignItems: "center",
        mb: 2,
        height: "2rem",
        width: "100%",
      }}
    >
      <Label htmlFor="xyz">{label}</Label>
      <ColorPickerMenu
        colors={getPalette()}
        selectedColor={color}
        onChange={(c) => updateColor(c)}
      />
    </Flex>
  );
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
  label: string;
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

  const noneLabel = t({
    id: "controls.dimension.none",
    message: `No dimension selected`,
  });

  const optionalLabel = t({
    id: "controls.select.optional",
    message: `optional`,
  });

  return (
    <Select
      key={`select-${field}-dimension`}
      id={field}
      label={optional ? `${label} (${optionalLabel})` : label}
      disabled={disabled}
      options={
        optional
          ? [
              {
                value: FIELD_VALUE_NONE,
                label: noneLabel,
                isNoneValue: true,
              },
              ...options,
            ]
          : options
      }
      {...fieldProps}
    ></Select>
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

export const ChartOptionCheckboxField = ({
  label,
  field,
  path,
  defaultChecked,
  disabled = false,
}: {
  label: string | ReactNode;
  field: string | null;
  path: string;
  defaultChecked?: boolean;
  disabled?: boolean;
}) => {
  const fieldProps = useChartOptionBooleanField({
    field,
    path,
  });

  return (
    <Checkbox
      disabled={disabled}
      label={label}
      {...fieldProps}
      checked={fieldProps.checked ?? defaultChecked}
    ></Checkbox>
  );
};

export const ChartOptionSelectField = <ValueType extends {} = string>({
  id,
  label,
  field,
  path,
  disabled = false,
  options,
  getValue,
  getKey,
}: {
  id: string;
  label: string | ReactNode;
  field: string;
  path: string;
  disabled?: boolean;
  options: Option[];
  getValue?: (x: string) => ValueType | undefined;
  getKey?: (x: ValueType) => string;
}) => {
  const fieldProps = useChartOptionSelectField({
    field,
    path,
    getValue,
    getKey,
  });

  return (
    <Select
      id={id}
      disabled={disabled}
      label={label}
      options={options}
      {...fieldProps}
    ></Select>
  );
};
