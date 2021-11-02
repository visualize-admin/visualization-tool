import { t, Trans } from "@lingui/macro";
import * as React from "react";
import { Box, Button, Flex } from "theme-ui";
import { ChartFiltersList } from "../../components/chart-filters-list";
import { Select } from "../../components/form";
import { Loading } from "../../components/hint";
import { ChartConfig, InteractiveFiltersDataConfig } from "../../configurator";
import { TimeInput } from "../../configurator/components/field";
import {
  getTimeIntervalFormattedSelectOptions,
  getTimeIntervalWithProps,
  useTimeFormatLocale,
} from "../../configurator/components/ui-helpers";
import { FIELD_VALUE_NONE } from "../../configurator/constants";
import { TimeUnit, useDimensionValuesQuery } from "../../graphql/query-hooks";
import { Icon } from "../../icons";
import { useLocale } from "../../locales/use-locale";
import { useInteractiveFilters } from "./use-interactive-filters";

export const ChartDataFilters = ({
  dataSet,
  chartConfig,
  dataFiltersConfig,
}: {
  dataSet: string;
  chartConfig: ChartConfig;
  dataFiltersConfig: InteractiveFiltersDataConfig;
}) => {
  const [filtersAreHidden, toggleFilters] = React.useState(true);
  const { componentIris } = dataFiltersConfig;

  return (
    <>
      {dataSet && (
        <Flex sx={{ flexDirection: "column", my: 4 }}>
          <Flex
            sx={{
              justifyContent: "space-between",
              alignItems: "flex-start",
              minHeight: 20,
            }}
          >
            {(dataFiltersConfig.active && filtersAreHidden) ||
            !dataFiltersConfig.active ? (
              <ChartFiltersList
                dataSetIri={dataSet}
                chartConfig={chartConfig}
              />
            ) : (
              <Box></Box>
            )}

            {dataFiltersConfig.active && (
              <Button
                variant="inline"
                sx={{
                  display: "flex",
                  fontSize: [2, 2, 2],
                  alignItems: "center",
                  minWidth: "fit-content",
                }}
                onClick={() => toggleFilters(!filtersAreHidden)}
              >
                {filtersAreHidden ? (
                  <Trans id="interactive.data.filters.show">Show Filters</Trans>
                ) : (
                  <Trans id="interactive.data.filters.hide">Hide Filters</Trans>
                )}
                <Icon
                  name={filtersAreHidden ? "add" : "close"}
                  size={15}
                ></Icon>
              </Button>
            )}
          </Flex>

          {dataFiltersConfig.active && (
            <Box
              sx={{
                display: filtersAreHidden ? "none" : "grid",
                columnGap: 3,
                rowGap: 2,
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              }}
            >
              {componentIris.map((d, i) => (
                <DataFilter
                  key={d}
                  dataSetIri={dataSet}
                  chartConfig={chartConfig}
                  dimensionIri={d}
                />
              ))}
            </Box>
          )}
        </Flex>
      )}
    </>
  );
};

const DataFilter = ({
  dimensionIri,
  dataSetIri,
  chartConfig,
}: {
  dimensionIri: string;
  dataSetIri: string;
  chartConfig: ChartConfig;
}) => {
  const [state, dispatch] = useInteractiveFilters();
  const { dataFilters } = state;

  const locale = useLocale();

  const [{ data }] = useDimensionValuesQuery({
    variables: { dimensionIri, locale, dataCubeIri: dataSetIri },
  });

  const setDataFilter = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    dispatch({
      type: "UPDATE_DATA_FILTER",
      value: { dimensionIri, dimensionValueIri: e.currentTarget.value },
    });
  };

  if (data?.dataCubeByIri?.dimensionByIri) {
    const dimension = data?.dataCubeByIri?.dimensionByIri;

    const configFilter = chartConfig.filters[dimension.iri];
    const configFilterValue =
      configFilter && configFilter.type === "single"
        ? configFilter.value
        : undefined;

    const value =
      dataFilters?.[dimension.iri]?.value ??
      configFilterValue ??
      FIELD_VALUE_NONE;

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
        {dimension.__typename !== "TemporalDimension" ? (
          <DataFilterBaseDimension
            isKeyDimension={dimension.isKeyDimension}
            label={dimension.label}
            options={dimension.values}
            value={value as string}
            onChange={setDataFilter}
          />
        ) : dimension.timeUnit === TimeUnit.Year ? (
          <DataFilterTemporalDimension
            isKeyDimension={dimension.isKeyDimension}
            label={dimension.label}
            options={dimension.values}
            value={value as string}
            timeUnit={dimension.timeUnit}
            timeFormat={dimension.timeFormat}
            onChange={setDataFilter}
          />
        ) : null}
      </Flex>
    );
  } else {
    return <Loading />;
  }
};

const DataFilterBaseDimension = ({
  isKeyDimension,
  label,
  options,
  value,
  onChange,
}: {
  isKeyDimension: boolean;
  label: string;
  options: Array<{ label: string; value: string }>;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}) => {
  const noneLabel = t({
    id: "controls.dimensionvalue.none",
    message: `No Filter`,
  });
  const allOptions = React.useMemo(() => {
    return isKeyDimension
      ? options
      : [
          {
            value: FIELD_VALUE_NONE,
            label: noneLabel,
            isNoneValue: true,
          },
          ...options,
        ];
  }, [isKeyDimension, options, noneLabel]);

  return (
    <Select
      id="dataFilterBaseDimension"
      label={label}
      options={allOptions}
      value={value}
      onChange={onChange}
    />
  );
};

const DataFilterTemporalDimension = ({
  isKeyDimension,
  label,
  options,
  timeUnit,
  timeFormat,
  value,
  onChange,
}: {
  isKeyDimension: boolean;
  label: string;
  options: Array<{ label: string; value: string }>;
  timeUnit: TimeUnit;
  timeFormat: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => void;
}) => {
  const formatLocale = useTimeFormatLocale();
  const timeIntervalWithProps = React.useMemo(
    () =>
      getTimeIntervalWithProps(
        options[0].value,
        options[1].value,
        timeUnit,
        timeFormat,
        formatLocale
      ),
    [options, timeUnit, timeFormat, formatLocale]
  );
  const timeIntervalOptions = React.useMemo(() => {
    return getTimeIntervalFormattedSelectOptions(timeIntervalWithProps);
  }, [timeIntervalWithProps]);

  if (timeIntervalWithProps.range < 100) {
    return (
      <DataFilterBaseDimension
        isKeyDimension={isKeyDimension}
        label={label}
        options={timeIntervalOptions}
        value={value}
        onChange={onChange}
      />
    );
  }

  return (
    <TimeInput
      id="dataFilterTemporalDimension"
      label={label}
      value={value}
      timeFormat={timeFormat}
      formatLocale={formatLocale}
      onChange={onChange}
    />
  );
};
