import { Trans } from "@lingui/macro";
import * as React from "react";
import { useEffect, useState } from "react";
import { Box, Button, Flex } from "theme-ui";
import { Select } from "../../components/form";
import { Loading } from "../../components/hint";
import {
  ChartConfig,
  FilterValueSingle,
  InteractiveFiltersDataConfig,
} from "../../configurator";
import { useDimensionValuesQuery } from "../../graphql/query-hooks";
import { Icon } from "../../icons";
import { useLocale } from "../../locales/use-locale";
import { useInteractiveFilters } from "./use-interactive-filters";

export const InteractiveDataFilters = ({
  dataSet,
  chartConfig,
  dataFiltersConfig,
}: {
  dataSet: string;
  chartConfig: ChartConfig;
  dataFiltersConfig: InteractiveFiltersDataConfig;
}) => {
  const [filtersAreHidden, toggleFilters] = useState(false);

  const [interactiveFiltersState, dispatch] = useInteractiveFilters();
  const interactiveFiltersIsActive = dataFiltersConfig.active;
  const { componentIris } = dataFiltersConfig;

  // On first render, initialize interactive filters
  // with "editor" filters values.
  useEffect(() => {
    if (
      interactiveFiltersIsActive &&
      interactiveFiltersState.dataFilters &&
      Object.keys(interactiveFiltersState.dataFilters).length === 0 &&
      interactiveFiltersState.dataFilters.constructor === Object
    ) {
      // Use the filters defined in the editor as defaults for the interactive filters
      const initialInteractiveFilters = componentIris.reduce(
        (f, dimIri) => ({
          ...f,
          [dimIri]: chartConfig.filters[dimIri],
        }),
        {} as FilterValueSingle
      );

      dispatch({
        type: "INIT_DATA_FILTER",
        value: initialInteractiveFilters,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    dispatch({ type: "UPDATE_DATA_FILTER_LIST", value: componentIris });
  }, [componentIris, dispatch]);

  return (
    <>
      {dataSet && chartConfig.chartType !== "table" && (
        <Flex sx={{ flexDirection: "column", my: 4 }}>
          <Button
            variant="inline"
            sx={{
              alignSelf: "flex-end",
              display: "flex",
              fontSize: 2,
              mb: 4,
            }}
            onClick={() => toggleFilters(!filtersAreHidden)}
          >
            {filtersAreHidden ? (
              <Trans id="interactive.data.filters.show">Show Filters</Trans>
            ) : (
              <Trans id="interactive.data.filters.hide">Hide Filters</Trans>
            )}
            <Icon name={filtersAreHidden ? "add" : "close"} size={20}></Icon>
          </Button>
          <Box
            sx={{
              display: filtersAreHidden ? "none" : "flex",
              justifyContent: "space-between",
            }}
          >
            {componentIris.map((d, i) => (
              <DataFilterDropdown
                key={i}
                dataSetIri={dataSet}
                dimensionIri={d}
              />
            ))}
          </Box>
        </Flex>
      )}
    </>
  );
};

const DataFilterDropdown = ({
  dimensionIri,
  dataSetIri,
}: {
  dimensionIri: string;
  dataSetIri: string;
}) => {
  const [state, dispatch] = useInteractiveFilters();
  const { dataFilters } = state;

  const locale = useLocale();

  const [{ data }] = useDimensionValuesQuery({
    variables: { dimensionIri, locale, dataCubeIri: dataSetIri },
  });

  const setDataFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch({
      type: "UPDATE_DATA_FILTER",
      value: { dimensionIri, dimensionValueIri: e.currentTarget.value },
    });
  };
  if (data?.dataCubeByIri?.dimensionByIri) {
    const dimension = data?.dataCubeByIri?.dimensionByIri;

    return (
      <Flex
        sx={{
          mr: 3,
          width: "100%",
          flex: "1 1 100%",
          ":last-of-type": {
            mr: 0,
          },
          " > div": { width: "100%" },
        }}
      >
        <Select
          id="interactiveDataFilter"
          label={dimension.label}
          options={dimension.values.map((v) => ({
            label: v.label,
            value: v.value,
          }))}
          value={
            dataFilters &&
            dataFilters[dimension.iri] &&
            dataFilters[dimension.iri].value
              ? dataFilters[dimension.iri].value
              : dimension.values[0].value
          }
          disabled={false}
          onChange={setDataFilter}
        />
      </Flex>
    );
  } else {
    return <Loading />;
  }
};
