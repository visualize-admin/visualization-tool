import { Trans } from "@lingui/macro";
import { Box, Button } from "@theme-ui/components";
import React, { useCallback } from "react";
import {
  getFilterValue,
  useConfiguratorState
} from "../domain/configurator-state";
import { useDimensionValuesQuery } from "../graphql/query-hooks";
import { useLocale } from "../lib/use-locale";
import { MultiFilterField, SingleFilterField } from "./field";
import { Loading } from "./hint";

type SelectionState = "SOME_SELECTED" | "NONE_SELECTED" | "ALL_SELECTED";

export const DimensionValuesMultiFilter = ({
  dataSetIri,
  dimensionIri
}: {
  dataSetIri: string;
  dimensionIri: string;
}) => {
  const locale = useLocale();
  const [state, dispatch] = useConfiguratorState();
  const [{ data }] = useDimensionValuesQuery({
    variables: { dimensionIri, locale, dataCubeIri: dataSetIri }
  });

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

  if (data?.dataCubeByIri?.dimensionByIri) {
    const dimension = data?.dataCubeByIri?.dimensionByIri;

    const activeFilter = getFilterValue(state, dimension.iri);

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
            variant="inline"
            sx={{ mr: 2 }}
            disabled={selectionState === "ALL_SELECTED"}
          >
            <Trans id="controls.filter.select.all">Select all</Trans>
          </Button>
          ·
          <Button
            onClick={selectNone}
            variant="inline"
            sx={{ ml: 2 }}
            disabled={selectionState === "NONE_SELECTED"}
          >
            <Trans id="controls.filter.select.none">Select none</Trans>
          </Button>
        </Box>

        {dimension.values.map(dv => {
          return (
            <MultiFilterField
              key={dv.value}
              dimensionIri={dimensionIri}
              label={dv.label}
              value={dv.value}
              allValues={dimension.values.map(d => d.value)}
              checked={selectionState === "ALL_SELECTED" ? true : undefined}
              checkAction={selectionState === "NONE_SELECTED" ? "SET" : "ADD"}
            />
          );
        })}
      </>
    );
  } else {
    return <Loading />;
  }
};

export const DimensionValuesSingleFilter = ({
  dataSetIri,
  dimensionIri
}: {
  dataSetIri: string;
  dimensionIri: string;
}) => {
  const locale = useLocale();
  const [{ data }] = useDimensionValuesQuery({
    variables: { dimensionIri, locale, dataCubeIri: dataSetIri }
  });

  if (data?.dataCubeByIri?.dimensionByIri) {
    const dimension = data?.dataCubeByIri?.dimensionByIri;

    return (
      <>
        {dimension.values.map(dv => {
          return (
            <SingleFilterField
              key={dv.value}
              dimensionIri={dimensionIri}
              label={dv.label}
              value={dv.value}
            />
          );
        })}
      </>
    );
  } else {
    return <Loading />;
  }
};
