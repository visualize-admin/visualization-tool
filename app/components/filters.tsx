import { Trans } from "@lingui/macro";
import { Button, Box } from "@theme-ui/components";
import React, { useCallback, useMemo } from "react";
import {
  getFilterValue,
  useConfiguratorState
} from "../domain/configurator-state";
import {
  DimensionWithMeta,
  getComponentIri,
  isTimeDimension
} from "../domain/data";
import { MultiFilterField, SingleFilterField } from "./field";

type SelectionState = "SOME_SELECTED" | "NONE_SELECTED" | "ALL_SELECTED";

export const DimensionValuesMultiFilter = ({
  dimension
}: {
  dimension: DimensionWithMeta;
}) => {
  const dimensionIri = getComponentIri(dimension);
  const [state, dispatch] = useConfiguratorState();

  const selectAll = useCallback(() => {
    dispatch({
      type: "CHART_CONFIG_FILTER_RESET_MULTI",
      value: {
        dimensionIri
      }
    });
  }, [dispatch, dimensionIri]);

  const selectNone = useCallback(() => {
    dispatch({
      type: "CHART_CONFIG_FILTER_SET_NONE_MULTI",
      value: { dimensionIri }
    });
  }, [dispatch, dimensionIri]);

  const isTime = isTimeDimension(dimension);

  const allValuesAndLabels = useMemo(
    () =>
      dimension.values
        .map(dv => ({
          value: dv.value.value,
          label: isTime ? dv.value.value : dv.label.value
        }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [dimension.values, isTime]
  );

  const allValues = useMemo(() => allValuesAndLabels.map(dv => dv.value), [
    allValuesAndLabels
  ]);

  const activeFilter = getFilterValue(state, dimension.component.iri.value);

  const selectionState: SelectionState = !activeFilter
    ? "ALL_SELECTED"
    : activeFilter.type === "multi" &&
      Object.keys(activeFilter.values).length === 0
    ? "NONE_SELECTED"
    : "SOME_SELECTED";

  return (
    <>
      <Box color="monochrome500">
        <Button
          onClick={selectAll}
          variant="linkButton"
          sx={{ mr: 2 }}
          disabled={selectionState === "ALL_SELECTED"}
        >
          <Trans id="controls.filter.select.all">Select all</Trans>
        </Button>
        ·
        <Button
          onClick={selectNone}
          variant="linkButton"
          sx={{ ml: 2 }}
          disabled={selectionState === "NONE_SELECTED"}
        >
          <Trans id="controls.filter.select.none">Select none</Trans>
        </Button>
      </Box>

      {allValuesAndLabels.map(dv => {
        return (
          <MultiFilterField
            key={dv.value}
            dimensionIri={dimensionIri}
            label={dv.label}
            value={dv.value}
            allValues={allValues}
            checked={selectionState === "ALL_SELECTED" ? true : undefined}
            checkAction={selectionState === "NONE_SELECTED" ? "SET" : "ADD"}
          />
        );
      })}
    </>
  );
};

export const DimensionValuesSingleFilter = ({
  dimension
}: {
  dimension: DimensionWithMeta;
}) => {
  const dimensionIri = getComponentIri(dimension);

  return (
    <>
      {dimension.values.map(dv => {
        return (
          <SingleFilterField
            key={dv.value.value}
            dimensionIri={dimensionIri}
            label={isTimeDimension(dimension) ? dv.value.value : dv.label.value}
            value={dv.value.value}
          />
        );
      })}
    </>
  );
};
