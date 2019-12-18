import React, { useCallback, useState } from "react";
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
import { Text, Button } from "rebass";
import { Trans } from "@lingui/macro";
import { FilterValueMultiValues } from "../domain";
import { Checkbox } from "./form";
import { filter } from "fp-ts/lib/Option";

export const DimensionValuesMultiFilter = ({
  dimension
}: {
  dimension: DimensionWithMeta;
}) => {
  const dimensionIri = getComponentIri(dimension);
  const [state, dispatch] = useConfiguratorState();

  const filterValues = getFilterValue(state, dimension.component.iri.value);

  const initialAllSelected =
    !filterValues ||
    filterValues.type !== "multi" ||
    Object.keys(filterValues.values).length === 0;

  const [allSelected, setAllSelected] = useState<boolean>(initialAllSelected);

  const toggle = useCallback(
    (
      dimensionIri: string,
      dimVal: {
        label: Literal;
        value: NamedNode | Literal;
      }[]
    ) => {
      if (allSelected) {
        setAllSelected(false);
      } else {
        setAllSelected(true);
        dispatch({
          type: "CHART_CONFIG_FILTER_RESET_MULTI",
          value: {
            dimensionIri
          }
        });
      }
    },
    [dispatch, allSelected]
  );

  return (
    <>
      <Checkbox
        label={<Trans id="controls.filter.select.all">Select all</Trans>}
        onChange={() => toggle(dimensionIri, dimension.values)}
        checked={allSelected}
      />

      {dimension.values.map(dv => {
        return (
          <MultiFilterField
            key={dv.value.value}
            dimensionIri={dimensionIri}
            label={isTimeDimension(dimension) ? dv.value.value : dv.label.value}
            value={dv.value.value}
            allSelected={allSelected}
            disabled={allSelected}
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
