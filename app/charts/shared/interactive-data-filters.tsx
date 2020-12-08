import * as React from "react";
import { useEffect } from "react";
import { Flex } from "theme-ui";
import { Select } from "../../components/form";
import { Loading } from "../../components/hint";
import {
  ConfiguratorStateConfiguringChart,
  ConfiguratorStateDescribingChart,
  ConfiguratorStatePublishing,
  ConfiguratorStateSelectingChartType,
  FilterValueSingle,
  InteractiveFiltersDataConfig,
} from "../../configurator";
import { useDimensionValuesQuery } from "../../graphql/query-hooks";
import { useLocale } from "../../locales/use-locale";
import { useInteractiveFilters } from "./use-interactive-filters";

export const InteractiveDataFilters = ({
  state,
  dataFiltersConfig,
}: {
  state:
    | ConfiguratorStateConfiguringChart
    | ConfiguratorStateDescribingChart
    | ConfiguratorStatePublishing
    | ConfiguratorStateSelectingChartType;
  dataFiltersConfig: InteractiveFiltersDataConfig;
}) => {
  const [interactiveFiltersState, dispatch] = useInteractiveFilters();
  const interactiveFiltersIsActive =
    state.chartConfig.chartType !== "table" &&
    state.chartConfig.interactiveFiltersConfig.dataFilters.active;

  useEffect(() => {
    if (
      (state.state === "CONFIGURING_CHART" ||
        state.state === "DESCRIBING_CHART") &&
      state.chartConfig.chartType !== "table" &&
      interactiveFiltersIsActive &&
      interactiveFiltersState.dataFilters &&
      Object.keys(interactiveFiltersState.dataFilters).length === 0 &&
      interactiveFiltersState.dataFilters.constructor === Object
    ) {
      // Use the filters defined in the editor as defaults for the interactive filters
      const initialInteractiveFilters = state.chartConfig.interactiveFiltersConfig.dataFilters.componentIris.reduce(
        (f, dimIri) => ({
          ...f,
          [dimIri]: state.chartConfig.filters[dimIri],
        }),
        {} as FilterValueSingle
      );

      dispatch({
        type: "INIT_DATA_FILTER",
        value: (initialInteractiveFilters as unknown) as FilterValueSingle,
      });
    }
  }, []);

  return (
    <Flex sx={{ justifyContent: "space-between" }}>
      {state.dataSet &&
        dataFiltersConfig.componentIris.map((d, i) => (
          <DataFilterDropdown
            key={i}
            dataSetIri={state.dataSet}
            dimensionIri={d}
          />
        ))}
    </Flex>
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
  if (
    data?.dataCubeByIri?.dimensionByIri &&
    Object.keys(state.dataFilters).length !== 0
  ) {
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
          value={state.dataFilters[dimension.iri].value}
          disabled={false}
          onChange={setDataFilter}
        />
      </Flex>
    );
  } else {
    return <Loading />;
  }
};
