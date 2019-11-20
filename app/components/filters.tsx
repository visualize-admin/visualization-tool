import React, { useCallback } from "react";
import {
  getComponentIri,
  isTimeDimension,
  DimensionWithMeta
} from "../domain/data";
import { MultiFilterField, SingleFilterField } from "./field";
import {
  useConfiguratorState,
  getFilterValue
} from "../domain/configurator-state";
import { Literal, NamedNode } from "rdf-js";
import { Text } from "rebass";
import { Trans } from "@lingui/macro";
import { FilterValueMultiValues } from "../domain";

export const DimensionValuesMultiFilter = ({
  dimension
}: {
  dimension: DimensionWithMeta;
}) => {
  const dimensionIri = getComponentIri(dimension);
  const [, dispatch] = useConfiguratorState();

  const [state] = useConfiguratorState();

  const filterValues = getFilterValue(state, dimension.component.iri.value);

  const allSelected =
    filterValues &&
    filterValues.type === "multi" &&
    dimension.values.every(dv => filterValues.values[dv.value.value] === true);

  const toggle = useCallback(
    (
      dimensionIri: string,
      dimVal: {
        label: Literal;
        value: NamedNode | Literal;
      }[]
    ) => {
      dispatch({
        type: "CHART_CONFIG_FILTER_SET_MULTI",
        value: {
          dimensionIri,
          values: Object.values(dimVal).reduce<FilterValueMultiValues>(
            (obj, cur, i) => ({
              ...obj,
              [cur.value.value]: !allSelected || i === 0 ? true : undefined
            }),
            {}
          )
        }
      });
    },
    [dispatch, allSelected]
  );

  return (
    <>
      <Text
        variant="paragraph2"
        mb={4}
        onClick={() => toggle(dimensionIri, dimension.values)}
        sx={{ textDecoration: "underline", cursor: "pointer" }}
      >
        {allSelected ? <Trans>Reset</Trans> : <Trans>Select all</Trans>}
      </Text>

      {dimension.values.map(dv => {
        return (
          <MultiFilterField
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
