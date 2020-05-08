import get from "lodash/get";
import { ChangeEvent, InputHTMLAttributes, useCallback } from "react";
import { ChartType } from "./config-types";
import { useConfiguratorState } from "./configurator-state";
import { Locales } from "../locales/locales";
import { SelectProps } from "@theme-ui/components";
import { getFieldComponentIri } from "./charts";
import { DataCubeMetadata } from "../graphql/types";

// interface FieldProps {
//   name: HTMLInputElement["name"]
//   onChange: [];
// }
export type Option = { value: string | $FixMe; label: string | $FixMe };

export type FieldProps = Pick<
  InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "id" | "name" | "value" | "checked" | "type"
>;

export const useActiveFieldField = ({
  value,
}: {
  value: string;
}): FieldProps & {
  onClick: (x: string) => void;
} => {
  const [state, dispatch] = useConfiguratorState();

  const onClick = useCallback(() => {
    dispatch({
      type: "ACTIVE_FIELD_CHANGED",
      value,
    });
  }, [dispatch, value]);

  const checked = state.activeField === value;

  return {
    value,
    checked,
    onClick,
  };
};

export const useMetaField = ({
  metaKey,
  locale,
  value,
}: {
  metaKey: string;
  locale: Locales;
  value?: string;
}): FieldProps => {
  const [, dispatch] = useConfiguratorState();

  const onChange = useCallback<(e: ChangeEvent<HTMLInputElement>) => void>(
    (e) => {
      dispatch({
        type: "CHART_DESCRIPTION_CHANGED",
        value: {
          path: `${metaKey}.${locale}`,
          value: e.currentTarget.value,
        },
      });
    },
    [dispatch, metaKey, locale]
  );

  return {
    name: `${metaKey}-${locale}`,
    value,
    onChange,
  };
};

export const useSingleFilterField = ({
  dimensionIri,
  value,
}: {
  value: string;
  dimensionIri: string;
}): FieldProps => {
  const [state, dispatch] = useConfiguratorState();

  const onChange = useCallback<(e: ChangeEvent<HTMLInputElement>) => void>(
    (e) => {
      dispatch({
        type: "CHART_CONFIG_FILTER_SET_SINGLE",
        value: {
          dimensionIri,
          value: e.currentTarget.value,
        },
      });
    },
    [dispatch, dimensionIri]
  );

  const stateValue =
    state.state === "CONFIGURING_CHART"
      ? get(state.chartConfig, ["filters", dimensionIri, "value"], "")
      : "";

  const checked = stateValue === value;

  return {
    name: dimensionIri,
    value: value ? value : stateValue,
    checked,
    onChange,
  };
};

export const FIELD_VALUE_NONE = "FIELD_VALUE_NONE";

export const useChartFieldField = ({
  componentIri,
  field,
  dataSetMetadata,
}: {
  field: string;
  componentIri?: string;
  dataSetMetadata: DataCubeMetadata;
}): SelectProps => {
  const [state, dispatch] = useConfiguratorState();

  const onChange = useCallback<(e: ChangeEvent<HTMLSelectElement>) => void>(
    (e) =>
      e.currentTarget.value !== FIELD_VALUE_NONE
        ? dispatch({
            type: "CHART_FIELD_CHANGED",
            value: {
              componentIri: e.currentTarget.value,
              field,
              dataSetMetadata,
            },
          })
        : dispatch({
            type: "CHART_FIELD_DELETED",
            value: {
              field,
              dataSetMetadata,
            },
          }),
    [dispatch, field, dataSetMetadata]
  );

  let value: string | undefined;
  if (state.state === "CONFIGURING_CHART") {
    value = getFieldComponentIri(state.chartConfig.fields, field);
  }

  return {
    name: field,
    value,
    onChange,
  };
};

//----------------------------------------
// FIXME: Can maybe be renamed useChartOptionSelectField
// to make it reusable for any select menu changing an option.
export const useChartSortingField = ({
  field,
  path,
}: {
  field: string;
  path: string;
}): SelectProps => {
  const [state, dispatch] = useConfiguratorState();

  const onChange = useCallback<(e: ChangeEvent<HTMLSelectElement>) => void>(
    (e) => {
      dispatch({
        type: "CHART_OPTION_CHANGED",
        value: {
          field,
          path,
          value: e.currentTarget.value,
        },
      });
    },
    [dispatch, field, path]
  );

  let value: string | undefined;
  if (state.state === "CONFIGURING_CHART") {
    value = get(state, `chartConfig.fields.${field}.${path}`);
  }
  return {
    name: path,
    value,
    // checked,
    onChange,
  };
};
//----------------------------------------

export const useChartOptionRadioField = ({
  field,
  path,
  label,
  value,
}: {
  field: string;
  path: string;
  label: string;
  value: string;
}): FieldProps => {
  const [state, dispatch] = useConfiguratorState();

  const onChange = useCallback<(e: ChangeEvent<HTMLInputElement>) => void>(
    (e) => {
      dispatch({
        type: "CHART_OPTION_CHANGED",
        value: {
          field,
          path,
          value,
        },
      });
    },
    [dispatch, field, path, value]
  );
  const stateValue =
    state.state === "CONFIGURING_CHART"
      ? get(state, `chartConfig.fields.${field}.${path}`, "")
      : "";
  const checked = stateValue === value;

  return {
    name: path,
    value,
    checked,
    onChange,
  };
};

export const useChartTypeSelectorField = ({
  value,
  metaData,
}: {
  value: string;
  metaData: DataCubeMetadata;
}): FieldProps & {
  onClick: (e: React.SyntheticEvent<HTMLButtonElement>) => void;
} => {
  const [state, dispatch] = useConfiguratorState();
  const onClick = useCallback<
    (e: React.SyntheticEvent<HTMLButtonElement>) => void
  >(
    (e) => {
      const chartType = e.currentTarget.value as ChartType;

      dispatch({
        type: "CHART_TYPE_CHANGED",
        value: {
          chartType,
          dataSetMetadata: metaData,
        },
      });
    },
    [dispatch, metaData]
  );

  const stateValue =
    state.state === "CONFIGURING_CHART" ||
    state.state === "SELECTING_CHART_TYPE"
      ? get(state, "chartConfig.chartType")
      : "";

  const checked = stateValue === value;

  return {
    name: "chartType",
    value, // ? value : stateValue,
    checked,
    onClick,
  };
};
