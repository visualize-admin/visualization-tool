import { t, Trans } from "@lingui/macro";
import { Box, Button, SelectChangeEvent, Typography } from "@mui/material";
import isEmpty from "lodash/isEmpty";
import isEqual from "lodash/isEqual";
import * as React from "react";
import { useClient } from "urql";

import { useQueryFilters } from "@/charts/shared/chart-helpers";
import { useLoadingState } from "@/charts/shared/chart-loading-state";
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
  SingleFilters,
  useChartConfigFilters,
  useConfiguratorState,
} from "@/configurator";
import { orderedIsEqual } from "@/configurator/components/chart-configurator";
import { FieldLabel, LoadingIndicator } from "@/configurator/components/field";
import {
  canRenderDatePickerField,
  DatePickerField,
} from "@/configurator/components/field-date-picker";
import { FIELD_VALUE_NONE } from "@/configurator/constants";
import {
  Dimension,
  HierarchyValue,
  isTemporalDimension,
  Measure,
  TemporalDimension,
} from "@/domain/data";
import { useTimeFormatLocale } from "@/formatters";
import { useDataCubesComponentsQuery } from "@/graphql/hooks";
import {
  DataCubeObservationFilter,
  PossibleFiltersDocument,
  PossibleFiltersQuery,
  PossibleFiltersQueryVariables,
} from "@/graphql/query-hooks";
import { Icon } from "@/icons";
import { useLocale } from "@/locales/use-locale";
import {
  DataFilters,
  useInteractiveFilters,
  useInteractiveFiltersRaw,
} from "@/stores/interactive-filters";
import { hierarchyToOptions } from "@/utils/hierarchy";
import useEvent from "@/utils/use-event";

type PreparedFilter = {
  cubeIri: string;
  interactiveFilters: Filters;
  unmappedFilters: SingleFilters;
  mappedFilters: Filters;
};

type ChartDataFiltersProps = {
  dataSource: DataSource;
  chartConfig: ChartConfig;
  dimensions?: Dimension[];
  measures?: Measure[];
};

export const ChartDataFilters = (props: ChartDataFiltersProps) => {
  const { dataSource, chartConfig, dimensions, measures } = props;
  const { loading } = useLoadingState();
  const dataFilters = useInteractiveFilters((d) => d.dataFilters);
  const componentIris = chartConfig.interactiveFiltersConfig?.dataFilters
    .componentIris as string[];
  const queryFilters = useQueryFilters({
    chartConfig,
    dimensions,
    measures,
    allowNoneValues: true,
    componentIris,
  });
  const [filtersVisible, setFiltersVisible] = React.useState(false);

  React.useEffect(() => {
    if (componentIris.length === 0) {
      setFiltersVisible(false);
    }
  }, [componentIris.length]);

  const preparedFilters: PreparedFilter[] | undefined = React.useMemo(() => {
    if (!queryFilters) {
      return;
    }

    return chartConfig.cubes.map((cube) => {
      const cubeQueryFilters = queryFilters.find(
        (d) => d.iri === cube.iri
      ) as DataCubeObservationFilter;
      const filtersByMappingStatus = getFiltersByMappingStatus(chartConfig, {
        cubeIri: cube.iri,
      });
      const { unmappedFilters, mappedFilters } = filtersByMappingStatus;
      const unmappedKeys = Object.keys(unmappedFilters);
      const unmappedFiltersArray = Object.entries(
        cubeQueryFilters.filters as Filters
      ).filter(([k]) => unmappedKeys.includes(k));
      const interactiveFiltersArray = unmappedFiltersArray.filter(([k]) =>
        componentIris.includes(k)
      );

      return {
        cubeIri: cube.iri,
        interactiveFilters: Object.fromEntries(interactiveFiltersArray),
        unmappedFilters: Object.fromEntries(
          unmappedFiltersArray
        ) as SingleFilters,
        mappedFilters,
      };
    });
  }, [chartConfig, componentIris, queryFilters]);

  const { error } = useEnsurePossibleInteractiveFilters({
    dataSource,
    chartConfig,
    preparedFilters,
  });

  return error ? (
    <Typography variant="body2" color="error">
      <Trans id="controls.section.data.filters.possible-filters-error">
        An error happened while fetching possible filters, please retry later or
        reload the page.
      </Trans>
    </Typography>
  ) : (
    <Flex sx={{ flexDirection: "column", mt: 4 }}>
      <Flex
        sx={{
          justifyContent: "flex-end",
          alignItems: "flex-start",
          gap: 3,
          minHeight: 20,
        }}
      >
        {componentIris.length > 0 && (
          <Button
            variant="text"
            endIcon={
              <Icon
                name="add"
                size={16}
                style={{
                  transform: filtersVisible ? "rotate(45deg)" : "rotate(0deg)",
                  transition: "transform 0.2s ease-in-out",
                }}
              />
            }
            sx={{
              display: "flex",
              fontSize: ["0.75rem", "0.75rem", "0.75rem"],
              alignItems: "center",
              minWidth: "fit-content",
              minHeight: 0,
              px: 2,
              py: 1,
            }}
            onClick={() => setFiltersVisible(!filtersVisible)}
          >
            {loading && (
              <span style={{ marginTop: "0.1rem", marginRight: "0.5rem" }}>
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
          {preparedFilters?.map(({ cubeIri, interactiveFilters }) =>
            Object.keys(interactiveFilters).map((dimensionIri) => (
              <DataFilter
                key={dimensionIri}
                cubeIri={cubeIri}
                dimensionIri={dimensionIri}
                dataSource={dataSource}
                chartConfig={chartConfig}
                dataFilters={dataFilters}
                interactiveFilters={interactiveFilters}
                disabled={loading}
              />
            ))
          )}
        </Box>
      )}
    </Flex>
  );
};

type DataFilterProps = {
  cubeIri: string;
  dimensionIri: string;
  dataSource: DataSource;
  chartConfig: ChartConfig;
  dataFilters: DataFilters;
  interactiveFilters: Filters;
  disabled: boolean;
};

const DataFilter = (props: DataFilterProps) => {
  const {
    cubeIri,
    dimensionIri,
    dataSource,
    chartConfig,
    dataFilters,
    interactiveFilters,
    disabled,
  } = props;
  const locale = useLocale();
  const filters = useChartConfigFilters(chartConfig);
  const chartLoadingState = useLoadingState();
  const updateDataFilter = useInteractiveFilters((d) => d.updateDataFilter);
  const otherKeys = Object.keys(interactiveFilters).filter(
    (key) => key !== dimensionIri
  );
  const [{ data, fetching }] = useDataCubesComponentsQuery({
    variables: {
      sourceType: dataSource.type,
      sourceUrl: dataSource.url,
      locale,
      cubeFilters: [
        {
          iri: cubeIri,
          componentIris: [dimensionIri],
          filters: otherKeys.length > 0 ? interactiveFilters : undefined,
          loadValues: true,
        },
      ],
      // This is important for urql not to think that filters
      // are the same  while the order of the keys has changed.
      // If this is not present, we'll have outdated dimension
      // values after we change the filter order.
      // @ts-ignore
      filterKeys: otherKeys.join(", "),
    },
  });

  const dimension = data?.dataCubesComponents.dimensions[0];
  const hierarchy = dimension?.hierarchy;

  const setDataFilter = useEvent(
    (e: SelectChangeEvent<unknown> | { target: { value: string } }) => {
      updateDataFilter(dimensionIri, e.target.value as string);
    }
  );

  const configFilter = dimension ? filters[dimension.iri] : undefined;
  const configFilterValue =
    configFilter && configFilter.type === "single"
      ? configFilter.value
      : undefined;
  const dataFilterValue = dimension ? dataFilters[dimension.iri]?.value : null;
  const value = dataFilterValue ?? configFilterValue ?? FIELD_VALUE_NONE;

  React.useEffect(() => {
    const values = dimension?.values.map((d) => d.value) ?? [];

    // We only want to disable loading state when the filter is actually valid.
    // It can be invalid when the application is ensuring possible filters.
    if (
      (dataFilterValue && values.includes(dataFilterValue)) ||
      dataFilterValue === FIELD_VALUE_NONE
    ) {
      updateDataFilter(dimensionIri, dataFilterValue);
      chartLoadingState.set(`interactive-filter-${dimensionIri}`, fetching);
    } else if (fetching || values.length === 0) {
      chartLoadingState.set(`interactive-filter-${dimensionIri}`, fetching);
    }
  }, [
    chartLoadingState,
    dataFilterValue,
    dimension?.values,
    dimensionIri,
    fetching,
    setDataFilter,
    configFilterValue,
    updateDataFilter,
  ]);

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
            <OpenMetadataPanelWrapper dim={dimension}>
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
    const opts = (
      hierarchy
        ? hierarchyToOptions(
            hierarchy,
            dimensionValues.map((d) => d.value)
          )
        : dimensionValues
    ) as {
      label: string;
      value: string;
      isNoneValue?: boolean;
      hasValue: boolean;
    }[];

    if (!isKeyDimension) {
      opts.unshift({
        value: FIELD_VALUE_NONE,
        label: noneLabel,
        isNoneValue: true,
        hasValue: true,
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
            <OpenMetadataPanelWrapper dim={dimension}>
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
            <OpenMetadataPanelWrapper dim={dimension}>
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
  dataSource: DataSource;
  chartConfig: ChartConfig;
  preparedFilters?: PreparedFilter[];
};

/**
 * This runs every time the state changes and it ensures that the selected interactive
 * filters return at least 1 observation. Otherwise they are reloaded.
 */
const useEnsurePossibleInteractiveFilters = (
  props: EnsurePossibleInteractiveFiltersProps
) => {
  const { dataSource, chartConfig, preparedFilters } = props;
  const [, dispatch] = useConfiguratorState();
  const loadingState = useLoadingState();
  const [error, setError] = React.useState<Error>();
  const lastFilters = React.useRef<Record<string, Filters>>({});
  const client = useClient();
  const IFRaw = useInteractiveFiltersRaw();
  const setDataFilters = useInteractiveFilters((d) => d.setDataFilters);
  const filtersByCubeIri = React.useMemo(() => {
    return preparedFilters?.reduce<Record<string, PreparedFilter>>((acc, d) => {
      acc[d.cubeIri] = d;
      return acc;
    }, {});
  }, [preparedFilters]);

  React.useEffect(() => {
    const run = async () => {
      if (!filtersByCubeIri) {
        return;
      }

      chartConfig.cubes.forEach(async (cube) => {
        const { mappedFilters, unmappedFilters, interactiveFilters } =
          filtersByCubeIri[cube.iri];

        if (
          (lastFilters.current[cube.iri] &&
            orderedIsEqual(lastFilters.current[cube.iri], unmappedFilters)) ||
          isEmpty(unmappedFilters)
        ) {
          return;
        }

        lastFilters.current[cube.iri] = unmappedFilters;
        loadingState.set("possible-interactive-filters", true);
        const { data, error } = await client
          .query<PossibleFiltersQuery, PossibleFiltersQueryVariables>(
            PossibleFiltersDocument,
            {
              iri: cube.iri,
              sourceType: dataSource.type,
              sourceUrl: dataSource.url,
              filters: unmappedFilters,
              // @ts-ignore This is to make urql requery
              filterKeys: Object.keys(unmappedFilters).join(", "),
            }
          )
          .toPromise();

        if (error || !data) {
          setError(error);
          loadingState.set("possible-interactive-filters", false);
          console.error("Could not fetch possible filters", error);

          return;
        }

        setError(undefined);
        loadingState.set("possible-interactive-filters", false);

        const filters = Object.assign(
          Object.fromEntries(
            data.possibleFilters.map((d) => {
              const interactiveFilter = interactiveFilters[d.iri];
              return [
                d.iri,
                {
                  type: d.type,
                  value:
                    // We want to keep the none filter without overriding them.
                    interactiveFilter?.type === "single" &&
                    interactiveFilter.value === FIELD_VALUE_NONE
                      ? FIELD_VALUE_NONE
                      : d.value,
                },
              ];
            })
          ) as Filters,
          mappedFilters
        );

        // We need to get the values dynamically, as they can get updated by
        // useSyncInteractiveFilters and this callback runs with old value.
        const dataFilters = { ...IFRaw.getState().dataFilters };
        const filtersToUpdate = Object.fromEntries(
          Object.entries(filters).filter(
            ([k, v]) => k in dataFilters && v.type === "single"
          )
        );

        if (
          !isEqual(filtersToUpdate, interactiveFilters) &&
          !isEmpty(filtersToUpdate)
        ) {
          for (const [k, v] of Object.entries(filters)) {
            if (k in dataFilters && v.type === "single") {
              dataFilters[k] = v;
            }
          }

          setDataFilters(dataFilters);
        }
      });
    };

    run();
  }, [
    client,
    dispatch,
    chartConfig.fields,
    chartConfig.cubes,
    dataSource.type,
    dataSource.url,
    setDataFilters,
    loadingState,
    IFRaw,
    filtersByCubeIri,
  ]);

  return { error };
};
