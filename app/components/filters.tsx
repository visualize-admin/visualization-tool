import { DataCube } from "@zazuko/query-rdf-data-cube";
import React, { useCallback } from "react";
import {
  getComponentIri,
  getDimensionLabel,
  isTimeDimension,
  DimensionWithMeta
} from "../domain/data";
import { MultiFilterField } from "./field";
import { ControlSection, ControlList } from "./chart-controls";
import {
  useConfiguratorState,
  getFilterValue
} from "../domain/configurator-state";
import { Literal, NamedNode } from "rdf-js";
import { Text } from "rebass";
import { Trans } from "@lingui/macro";
import { FilterValueMultiValues } from "../domain";

export const Filters = ({
  chartId,
  dataSet,
  dimensions
}: {
  chartId: string;
  dataSet: DataCube;
  dimensions: DimensionWithMeta[];
}) => {
  return (
    <>
      {dimensions.map(dimension => {
        return (
          <ControlSection
            key={getComponentIri(dimension)}
            title={getDimensionLabel(dimension)}
          >
            <ControlList>
              <DimensionValues
                chartId={chartId}
                dataSet={dataSet}
                dimension={dimension}
              />
            </ControlList>
          </ControlSection>
        );
      })}
    </>
  );
};

const DimensionValues = ({
  chartId,
  dataSet,
  dimension
}: {
  chartId: string;
  dataSet: DataCube;
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
        {allSelected ? (
          <Trans>Reset</Trans>
        ) : (
          <Trans>Select all</Trans>
        )}
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
