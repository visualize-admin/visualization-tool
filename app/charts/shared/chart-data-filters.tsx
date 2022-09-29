import { t, Trans } from "@lingui/macro";
import { Box, Button, SelectChangeEvent } from "@mui/material";
import * as React from "react";

import { useInteractiveFilters } from "@/charts/shared/use-interactive-filters";
import { ChartFiltersList } from "@/components/chart-filters-list";
import Flex from "@/components/flex";
import { Select } from "@/components/form";
import { Loading } from "@/components/hint";
import {
  ChartConfig,
  DataSource,
  InteractiveFiltersDataConfig,
} from "@/configurator";
import { TimeInput } from "@/configurator/components/field";
import {
  getTimeIntervalFormattedSelectOptions,
  getTimeIntervalWithProps,
  useTimeFormatLocale,
} from "@/configurator/components/ui-helpers";
import { FIELD_VALUE_NONE } from "@/configurator/constants";
import { TimeUnit, useDimensionValuesQuery } from "@/graphql/query-hooks";
import { Icon } from "@/icons";
import { useLocale } from "@/locales/use-locale";

export const ChartDataFilters = ({
  dataSet,
  dataSource,
  chartConfig,
  dataFiltersConfig,
}: {
  dataSet: string;
  dataSource: DataSource;
  chartConfig: ChartConfig;
  dataFiltersConfig: InteractiveFiltersDataConfig;
}) => {
  const [filtersVisible, setFiltersVisible] = React.useState(false);
  const { componentIris } = dataFiltersConfig;

  React.useEffect(() => {
    if (componentIris.length === 0) {
      setFiltersVisible(false);
    }
  }, [componentIris.length]);

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
            {!filtersVisible ? (
              <ChartFiltersList
                dataSetIri={dataSet}
                dataSource={dataSource}
                chartConfig={chartConfig}
              />
            ) : (
              <Box></Box>
            )}

            {componentIris.length > 0 && (
              <Button
                variant="text"
                endIcon={
                  <Icon name={filtersVisible ? "close" : "add"} size={15} />
                }
                sx={{
                  display: "flex",
                  fontSize: ["0.75rem", "0.75rem", "0.75rem"],
                  alignItems: "center",
                  minWidth: "fit-content",
                }}
                onClick={() => setFiltersVisible(!filtersVisible)}
              >
                {filtersVisible ? (
                  <Trans id="interactive.data.filters.hide">Hide Filters</Trans>
                ) : (
                  <Trans id="interactive.data.filters.show">Show Filters</Trans>
                )}
              </Button>
            )}
          </Flex>

          {componentIris.length > 0 && (
            <Box
              sx={{
                display: filtersVisible ? "grid" : "none",
                columnGap: 3,
                rowGap: 2,
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              }}
            >
              {componentIris.map((d) => (
                <DataFilter
                  key={d}
                  dataSetIri={dataSet}
                  dataSource={dataSource}
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
  dataSource,
  chartConfig,
}: {
  dimensionIri: string;
  dataSetIri: string;
  dataSource: DataSource;
  chartConfig: ChartConfig;
}) => {
  const [state, dispatch] = useInteractiveFilters();
  const { dataFilters } = state;

  const locale = useLocale();

  const [{ data }] = useDimensionValuesQuery({
    variables: {
      dimensionIri,
      sourceType: dataSource.type,
      sourceUrl: dataSource.url,
      locale,
      dataCubeIri: dataSetIri,
    },
  });

  const setDataFilter = (e: SelectChangeEvent<unknown>) => {
    dispatch({
      type: "UPDATE_DATA_FILTER",
      value: { dimensionIri, dimensionValueIri: e.target.value as string },
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
            tooltipText={dimension.description || undefined}
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
  tooltipText,
  onChange,
}: {
  isKeyDimension: boolean;
  label: string;
  options: Array<{ label: string; value: string }>;
  value: string;
  tooltipText?: string;
  onChange: (e: SelectChangeEvent<unknown>) => void;
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
      tooltipText={tooltipText}
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
  tooltipText,
  onChange,
}: {
  isKeyDimension: boolean;
  label: string;
  options: Array<{ label: string; value: string }>;
  timeUnit: TimeUnit;
  timeFormat: string;
  value: string;
  tooltipText?: string;
  onChange: (e: SelectChangeEvent<unknown>) => void;
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
        tooltipText={tooltipText}
        onChange={onChange}
      />
    );
  }

  return (
    <TimeInput
      id="dataFilterTemporalDimension"
      label={label}
      value={value}
      tooltipText={tooltipText}
      timeFormat={timeFormat}
      formatLocale={formatLocale}
      isOptional={!isKeyDimension}
      onChange={onChange}
    />
  );
};
