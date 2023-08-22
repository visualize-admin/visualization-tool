import { t, Trans } from "@lingui/macro";
import { Box, Button, SelectChangeEvent, Typography } from "@mui/material";
import isEmpty from "lodash/isEmpty";
import isEqual from "lodash/isEqual";
import * as React from "react";
import { useClient } from "urql";

import { useQueryFilters } from "@/charts/shared/chart-helpers";
import { ChartFiltersList } from "@/components/chart-filters-list";
import Flex from "@/components/flex";
import { Select } from "@/components/form";
import { Loading } from "@/components/hint";
import { OpenMetadataPanelWrapper } from "@/components/metadata-panel";
import SelectTree from "@/components/select-tree";
import {
  ChartConfig,
  DataSource,
  Filters,
  getFiltersByMappingStatus,
  QueryFilters,
  useConfiguratorState,
} from "@/configurator";
import { orderedIsEqual } from "@/configurator/components/chart-configurator";
import { FieldLabel, LoadingIndicator } from "@/configurator/components/field";
import {
  canRenderDatePickerField,
  DatePickerField,
} from "@/configurator/components/field-date-picker";
import { FIELD_VALUE_NONE } from "@/configurator/constants";
import { isTemporalDimension } from "@/domain/data";
import { useTimeFormatLocale } from "@/formatters";
import {
  Dimension,
  DimensionMetadataFragment,
  HierarchyValue,
  PossibleFiltersDocument,
  PossibleFiltersQuery,
  PossibleFiltersQueryVariables,
  TemporalDimension,
  useDimensionValuesQuery,
} from "@/graphql/query-hooks";
import { Icon } from "@/icons";
import { useLocale } from "@/locales/use-locale";
import {
  DataFilters,
  useInteractiveFiltersStore,
} from "@/stores/interactive-filters";
import { hierarchyToOptions } from "@/utils/hierarchy";

type ChartDataFiltersProps = {
  dataSet: string;
  dataSource: DataSource;
  chartConfig: ChartConfig;
};

export const ChartDataFilters = (props: ChartDataFiltersProps) => {
  const { dataSet, dataSource, chartConfig } = props;
  const dataFilters = useInteractiveFiltersStore((d) => d.dataFilters);
  const queryFilters = useQueryFilters({ chartConfig });
  const componentIris = chartConfig.interactiveFiltersConfig?.dataFilters
    .componentIris as string[];
  const [filtersVisible, setFiltersVisible] = React.useState(false);

  React.useEffect(() => {
    if (componentIris.length === 0) {
      setFiltersVisible(false);
    }
  }, [componentIris.length]);

  const { interactiveFilters, mappedFilters } = React.useMemo(() => {
    const filtersByMappingStatus = getFiltersByMappingStatus(chartConfig);
    const { mappedFilters, unmappedFilters } = filtersByMappingStatus;
    const unmappedKeys = Object.keys(unmappedFilters);

    return {
      interactiveFilters: Object.fromEntries(
        Object.entries(queryFilters).filter(([k]) => unmappedKeys.includes(k))
      ),
      mappedFilters,
      unmappedFilters,
    };
  }, [chartConfig, queryFilters]);

  const { fetching, error } = useEnsurePossibleInteractiveFilters({
    dataSet,
    dataSource,
    chartConfig,
    dataFilters,
    interactiveFilters,
    mappedFilters,
  });

  return error ? (
    <Typography variant="body2" color="error">
      <Trans id="controls.section.data.filters.possible-filters-error">
        An error happened while fetching possible filters, please retry later or
        reload the page.
      </Trans>
    </Typography>
  ) : dataSet ? (
    <Flex sx={{ flexDirection: "column", my: 4 }}>
      <Flex
        sx={{
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 3,
          minHeight: 20,
        }}
      >
        <ChartFiltersList
          dataSetIri={dataSet}
          dataSource={dataSource}
          chartConfig={chartConfig}
        />

        {componentIris.length > 0 && (
          <Button
            variant="text"
            endIcon={<Icon name={filtersVisible ? "close" : "add"} size={15} />}
            sx={{
              display: "flex",
              fontSize: ["0.75rem", "0.75rem", "0.75rem"],
              alignItems: "center",
              gap: 2,
              minWidth: "fit-content",
            }}
            onClick={() => setFiltersVisible(!filtersVisible)}
          >
            {fetching && (
              <span style={{ marginTop: "0.1rem" }}>
                <LoadingIndicator />
              </span>
            )}
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
          {/* We want to persist the ordering of editor filters. */}
          {Object.keys(interactiveFilters)
            .filter((d) => componentIris.includes(d))
            .map((iri) => (
              <DataFilter
                key={iri}
                dimensionIri={iri}
                dataSetIri={dataSet}
                dataSource={dataSource}
                chartConfig={chartConfig}
                dataFilters={dataFilters}
                interactiveFilters={interactiveFilters}
                disabled={fetching}
              />
            ))}
        </Box>
      )}
    </Flex>
  ) : null;
};

type DataFilterProps = {
  dimensionIri: string;
  dataSetIri: string;
  dataSource: DataSource;
  chartConfig: ChartConfig;
  dataFilters: DataFilters;
  interactiveFilters: QueryFilters;
  disabled: boolean;
};

const DataFilter = (props: DataFilterProps) => {
  const {
    dimensionIri,
    dataSetIri,
    dataSource,
    chartConfig,
    dataFilters,
    interactiveFilters,
    disabled,
  } = props;
  const locale = useLocale();
  const updateDataFilter = useInteractiveFiltersStore(
    (d) => d.updateDataFilter
  );
  const keys = Object.keys(interactiveFilters);
  const [{ data }] = useDimensionValuesQuery({
    variables: {
      dimensionIri,
      dataCubeIri: dataSetIri,
      sourceType: dataSource.type,
      sourceUrl: dataSource.url,
      locale,
      ...(keys.length > 0
        ? {
            filters: interactiveFilters,
            // This is important for urql not to think that filters
            // are the same  while the order of the keys has changed.
            // If this is not present, we'll have outdated dimension
            // values after we change the filter order
            filterKeys: Object.keys(keys).join(", "),
          }
        : {}),
    },
  });

  const dimension = data?.dataCubeByIri?.dimensionByIri;
  const hierarchy = data?.dataCubeByIri?.dimensionByIri?.hierarchy;

  const setDataFilter = (
    e: SelectChangeEvent<unknown> | { target: { value: string } }
  ) => {
    updateDataFilter(dimensionIri, e.target.value as string);
  };

  const configFilter = dimension
    ? chartConfig.filters[dimension.iri]
    : undefined;
  const configFilterValue =
    configFilter && configFilter.type === "single"
      ? configFilter.value
      : undefined;
  const value =
    (dimension && dataFilters?.[dimension.iri]?.value) ??
    configFilterValue ??
    FIELD_VALUE_NONE;

  React.useEffect(() => {
    if (dimension?.values) {
      updateDataFilter(dimension.iri, value);
    }
  }, [dimension?.iri, dimension?.values, updateDataFilter, value]);

  return dimension ? (
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
        <DataFilterTemporalDimension
          value={value as string}
          dimension={dimension}
          onChange={setDataFilter}
          disabled={disabled}
        />
      ) : hierarchy ? (
        <DataFilterHierarchyDimension
          dimension={dimension}
          onChange={setDataFilter}
          hierarchy={hierarchy}
          value={value as string}
          disabled={disabled}
        />
      ) : (
        <DataFilterGenericDimension
          dimension={dimension}
          onChange={setDataFilter}
          value={value as string}
          disabled={disabled}
        />
      )}
    </Flex>
  ) : (
    <Loading />
  );
};

type DataFilterGenericDimensionProps = {
  dimension: Dimension;
  value: string;
  onChange: (e: SelectChangeEvent<unknown>) => void;
  options?: Array<{ label: string; value: string }>;
  disabled: boolean;
};

const DataFilterGenericDimension = (props: DataFilterGenericDimensionProps) => {
  const { dimension, value, onChange, options: propOptions, disabled } = props;
  const { label, isKeyDimension } = dimension;
  const noneLabel = t({
    id: "controls.dimensionvalue.none",
    message: "No Filter",
  });
  const options = propOptions ?? dimension.values;
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
        <FieldLabel
          label={
            <OpenMetadataPanelWrapper
              dim={dimension as DimensionMetadataFragment}
            >
              {label}
            </OpenMetadataPanelWrapper>
          }
        />
      }
      options={allOptions}
      value={value}
      onChange={onChange}
      disabled={disabled}
    />
  );
};

type DataFilterHierarchyDimensionProps = {
  dimension: Dimension;
  value: string;
  onChange: (e: { target: { value: string } }) => void;
  hierarchy?: HierarchyValue[];
  disabled: boolean;
};

const DataFilterHierarchyDimension = (
  props: DataFilterHierarchyDimensionProps
) => {
  const { dimension, value, onChange, hierarchy, disabled } = props;
  const { label, isKeyDimension, values: dimensionValues } = dimension;
  const noneLabel = t({
    id: "controls.dimensionvalue.none",
    message: `No Filter`,
  });
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
        <FieldLabel
          label={
            <OpenMetadataPanelWrapper
              dim={dimension as DimensionMetadataFragment}
            >
              {label}
            </OpenMetadataPanelWrapper>
          }
        />
      }
      disabled={disabled}
    />
  );
};

const DataFilterTemporalDimension = ({
  dimension,
  value,
  onChange,
  disabled,
}: {
  dimension: TemporalDimension;
  value: string;
  onChange: (
    e: SelectChangeEvent<unknown> | React.ChangeEvent<HTMLSelectElement>
  ) => void;
  disabled: boolean;
}) => {
  const { isKeyDimension, label, values, timeUnit, timeFormat } = dimension;
  const formatLocale = useTimeFormatLocale();
  const formatDate = formatLocale.format(timeFormat);
  const parseDate = formatLocale.parse(timeFormat);

  const noneLabel = t({
    id: "controls.dimensionvalue.none",
    message: "No Filter",
  });
  const { minDate, maxDate, options, optionValues } = React.useMemo(() => {
    if (values.length) {
      const options = values.map((d) => {
        return {
          label: `${d.value}`,
          value: `${d.value}`,
        };
      });

      return {
        minDate: parseDate(values[0].value as string) as Date,
        maxDate: parseDate(values[values.length - 1].value as string) as Date,
        options: isKeyDimension
          ? options
          : [
              {
                value: FIELD_VALUE_NONE,
                label: noneLabel,
                isNoneValue: true,
              },
              ...options,
            ],
        optionValues: options.map((d) => d.value),
      };
    } else {
      return {
        minDate: new Date(),
        maxDate: new Date(),
        options: [],
        optionValues: [],
      };
    }
  }, [isKeyDimension, noneLabel, values, parseDate]);

  return canRenderDatePickerField(timeUnit) ? (
    <DatePickerField
      name={`interactive-date-picker-${dimension.iri}`}
      label={
        <FieldLabel
          label={
            <OpenMetadataPanelWrapper
              dim={dimension as DimensionMetadataFragment}
            >
              {label}
            </OpenMetadataPanelWrapper>
          }
        />
      }
      value={parseDate(value) as Date}
      onChange={onChange}
      isDateDisabled={(d) => !optionValues.includes(formatDate(d))}
      timeUnit={timeUnit}
      dateFormat={formatDate}
      minDate={minDate}
      maxDate={maxDate}
      disabled={disabled}
    />
  ) : (
    <DataFilterGenericDimension
      dimension={dimension}
      options={options}
      value={value}
      onChange={onChange}
      disabled={disabled}
    />
  );
};

type EnsurePossibleInteractiveFiltersProps = {
  dataSet: string;
  dataSource: DataSource;
  chartConfig: ChartConfig;
  dataFilters: DataFilters;
  interactiveFilters: Filters;
  mappedFilters: Filters;
};

/**
 * This runs every time the state changes and it ensures that the selected interactive
 * filters return at least 1 observation. Otherwise they are reloaded.
 */
const useEnsurePossibleInteractiveFilters = (
  props: EnsurePossibleInteractiveFiltersProps
) => {
  const {
    dataSet,
    dataSource,
    chartConfig,
    dataFilters,
    interactiveFilters,
    mappedFilters,
  } = props;
  const [, dispatch] = useConfiguratorState();
  const [fetching, setFetching] = React.useState(false);
  const [error, setError] = React.useState<Error>();
  const lastFilters = React.useRef<Filters>();
  const client = useClient();
  const setDataFilters = useInteractiveFiltersStore((d) => d.setDataFilters);

  React.useEffect(() => {
    const run = async () => {
      if (
        lastFilters.current &&
        orderedIsEqual(lastFilters.current, interactiveFilters)
      ) {
        return;
      }
      lastFilters.current = interactiveFilters;

      setFetching(true);
      const { data, error } = await client
        .query<PossibleFiltersQuery, PossibleFiltersQueryVariables>(
          PossibleFiltersDocument,
          {
            iri: dataSet,
            sourceType: dataSource.type,
            sourceUrl: dataSource.url,
            filters: interactiveFilters,
            // @ts-ignore This is to make urql requery
            filterKeys: Object.keys(interactiveFilters).join(", "),
          }
        )
        .toPromise();

      if (error || !data) {
        setError(error);
        setFetching(false);
        console.error("Could not fetch possible filters", error);

        return;
      }

      setError(undefined);
      setFetching(false);

      const filters = Object.assign(
        Object.fromEntries(
          data.possibleFilters.map((d) => [
            d.iri,
            { type: d.type, value: d.value },
          ])
        ) as Filters,
        mappedFilters
      );

      if (!isEqual(filters, chartConfig.filters) && !isEmpty(filters)) {
        for (const [k, v] of Object.entries(filters)) {
          if (k in dataFilters && v.type === "single") {
            dataFilters[k] = v;
          }
        }

        setDataFilters(dataFilters);
      }
    };

    run();
  }, [
    client,
    dispatch,
    chartConfig.fields,
    chartConfig.filters,
    dataSet,
    dataSource.type,
    dataSource.url,
    chartConfig,
    setDataFilters,
    dataFilters,
    interactiveFilters,
    mappedFilters,
  ]);

  return { error, fetching };
};
