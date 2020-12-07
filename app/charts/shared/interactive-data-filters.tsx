import * as React from "react";
import { Box, Flex } from "theme-ui";
import { Select } from "../../components/form";
import { Loading } from "../../components/hint";
import {
  InteractiveFiltersDataConfig,
  useConfiguratorState,
} from "../../configurator";
import { useDimensionValuesQuery } from "../../graphql/query-hooks";
import { useLocale } from "../../locales/use-locale";
import { useInteractiveFilters } from "./use-interactive-filters";

export const InteractiveDataFilters = ({
  dataFiltersConfig,
}: {
  dataFiltersConfig: InteractiveFiltersDataConfig;
}) => {
  const [{ dataSet }] = useConfiguratorState();

  return (
    <Box sx={{ my: 4 }}>
      {dataSet &&
        dataFiltersConfig.componentIris.map((d, i) => (
          <DataFilterDropdown key={i} dataSetIri={dataSet} dimensionIri={d} />
        ))}
    </Box>
  );
};

const DataFilterDropdown = ({
  dimensionIri,
  dataSetIri,
}: {
  dimensionIri: string;
  dataSetIri: string;
}) => {
  const [, dispatch] = useInteractiveFilters();
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
          position: "relative",
          justifyContent: "flex-start",
          alignItems: "flex-start",
          flexWrap: "wrap",
          minHeight: "20px",
        }}
      >
        <Select
          id="interactiveDataFilter"
          label={dimension.label}
          options={dimension.values.map((v) => ({
            label: v.label,
            value: v.label,
          }))}
          disabled={false}
          onChange={setDataFilter}
        />
      </Flex>
    );
  } else {
    return <Loading />;
  }
};
