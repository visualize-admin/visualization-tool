import { t, Trans } from "@lingui/macro";
import { Box, Button, SelectChangeEvent } from "@mui/material";
import * as React from "react";

import { ChartFiltersList } from "@/components/chart-filters-list";
import Flex from "@/components/flex";
import { Select } from "@/components/form";
import { Loading } from "@/components/hint";
import { OpenMetadataPanelWrapper } from "@/components/metadata-panel";
import SelectTree from "@/components/select-tree";
import {
  ChartConfig,
  DataSource,
  InteractiveFiltersDataConfig,
  Option,
  OptionGroup,
} from "@/configurator";
import { TimeInput } from "@/configurator/components/field";
import {
  getTimeIntervalFormattedSelectOptions,
  getTimeIntervalWithProps,
} from "@/configurator/components/ui-helpers";
import { FIELD_VALUE_NONE } from "@/configurator/constants";
import { isTemporalDimension } from "@/domain/data";
import { useTimeFormatLocale } from "@/formatters";
import {
  Dimension,
  DimensionMetadataFragment,
  HierarchyValue,
  TemporalDimension,
  TimeUnit,
  useDimensionValuesQuery,
} from "@/graphql/query-hooks";
import { Icon } from "@/icons";
import { useLocale } from "@/locales/use-locale";
import { useInteractiveFiltersStore } from "@/stores/interactive-filters";
import { hierarchyToOptions } from "@/utils/hierarchy";

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
            {filtersVisible ? (
              <Box />
            ) : (
              <ChartFiltersList
                dataSetIri={dataSet}
                dataSource={dataSource}
                chartConfig={chartConfig}
              />
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
              data-testid="published-chart-interactive-filters"
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

type DataFilterProps = {
  dimensionIri: string;
  dataSetIri: string;
  dataSource: DataSource;
  chartConfig: ChartConfig;
};

const DataFilter = (props: DataFilterProps) => {
  const { dimensionIri, dataSetIri, dataSource, chartConfig } = props;
  const dataFilters = useInteractiveFiltersStore((d) => d.dataFilters);
  const updateDataFilter = useInteractiveFiltersStore(
    (d) => d.updateDataFilter
  );
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
  const hierarchy = data?.dataCubeByIri?.dimensionByIri?.hierarchy;

  const setDataFilter = (
    e: SelectChangeEvent<unknown> | { target: { value: string } }
  ) => {
    updateDataFilter(dimensionIri, e.target.value as string);
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
        {isTemporalDimension(dimension) ? (
          dimension.timeUnit === TimeUnit.Year ? (
            <DataFilterTemporalDimension
              value={value as string}
              dimension={dimension}
              onChange={setDataFilter}
            />
          ) : null
        ) : hierarchy ? (
          <DataFilterHierarchyDimension
            dimension={dimension}
            onChange={setDataFilter}
            hierarchy={hierarchy}
            value={value as string}
          />
        ) : (
          <DataFilterGenericDimension
            dimension={dimension}
            onChange={setDataFilter}
            value={value as string}
          />
        )}
      </Flex>
    );
  } else {
    return <Loading />;
  }
};

const DataFilterGenericDimension = ({
  dimension,
  value,
  onChange,
  options: propOptions,
}: {
  dimension: Dimension;
  value: string;
  onChange: (e: SelectChangeEvent<unknown>) => void;
  options?: Array<{ label: string; value: string }>;
  optionGroups?: [OptionGroup, Option[]][];
}) => {
  const noneLabel = t({
    id: "controls.dimensionvalue.none",
    message: `No Filter`,
  });

  const { label, isKeyDimension } = dimension;
  const options = propOptions || dimension.values;

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
      label={
        <OpenMetadataPanelWrapper dim={dimension as DimensionMetadataFragment}>
          {label}
        </OpenMetadataPanelWrapper>
      }
      options={allOptions}
      value={value}
      onChange={onChange}
    />
  );
};

const DataFilterHierarchyDimension = ({
  dimension,
  value,
  onChange,
  hierarchy,
}: {
  dimension: Dimension;
  value: string;
  onChange: (e: { target: { value: string } }) => void;
  hierarchy?: HierarchyValue[];
}) => {
  const noneLabel = t({
    id: "controls.dimensionvalue.none",
    message: `No Filter`,
  });

  const { label, isKeyDimension, values: dimensionValues } = dimension;
  const options = React.useMemo(() => {
    let opts = [] as { label: string; value: string; isNoneValue?: boolean }[];
    if (hierarchy) {
      opts = hierarchyToOptions(hierarchy);
    } else {
      // @ts-ignore
      opts = dimensionValues;
    }
    if (!isKeyDimension) {
      opts.unshift({
        value: FIELD_VALUE_NONE,
        label: noneLabel,
        isNoneValue: true,
      });
    }
    return opts;
  }, [hierarchy, isKeyDimension, dimensionValues, noneLabel]);

  return (
    <SelectTree
      value={value}
      options={options}
      onChange={onChange}
      label={
        <OpenMetadataPanelWrapper dim={dimension as DimensionMetadataFragment}>
          {label}
        </OpenMetadataPanelWrapper>
      }
    />
  );
};

const DataFilterTemporalDimension = ({
  dimension,
  value,
  onChange,
}: {
  dimension: TemporalDimension;
  value: string;
  onChange: (e: SelectChangeEvent<unknown>) => void;
}) => {
  const {
    isKeyDimension,
    label,
    values: options,
    timeUnit,
    timeFormat,
  } = dimension;

  const formatLocale = useTimeFormatLocale();
  const timeIntervalWithProps = React.useMemo(() => {
    return getTimeIntervalWithProps(
      options[0].value as string,
      options[options.length - 1].value as string,
      timeUnit,
      timeFormat,
      formatLocale
    );
  }, [options, timeUnit, timeFormat, formatLocale]);

  const timeIntervalOptions = React.useMemo(() => {
    return getTimeIntervalFormattedSelectOptions(timeIntervalWithProps);
  }, [timeIntervalWithProps]);

  if (timeIntervalWithProps.range < 100) {
    return (
      <DataFilterGenericDimension
        dimension={dimension}
        options={timeIntervalOptions}
        value={value}
        onChange={onChange}
      />
    );
  }

  return (
    <TimeInput
      id="dataFilterTemporalDimension"
      label={
        <OpenMetadataPanelWrapper dim={dimension as DimensionMetadataFragment}>
          {label}
        </OpenMetadataPanelWrapper>
      }
      value={value}
      timeFormat={timeFormat}
      formatLocale={formatLocale}
      isOptional={!isKeyDimension}
      onChange={onChange}
    />
  );
};
