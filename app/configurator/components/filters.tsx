import { Trans } from "@lingui/macro";
import { useCallback, useMemo } from "react";
import { Box, Button, Flex } from "theme-ui";
import {
  getFilterValue,
  MultiFilterContextProvider,
  useConfiguratorState,
  useDimensionSelection,
  useMultiFilterContext,
} from "..";
import { Loading } from "../../components/hint";
import {
  useDimensionValuesQuery,
  useTemporalDimensionValuesQuery,
} from "../../graphql/query-hooks";
import { useLocale } from "../../locales/use-locale";
import { EditorIntervalBrush } from "../interactive-filters/editor-time-interval-brush";
import {
  MultiFilterFieldCheckbox,
  MultiFilterFieldColorPicker,
  SingleFilterField,
} from "./field";
import {
  getTimeInterval,
  useTimeFormatLocale,
  useTimeFormatUnit,
} from "./ui-helpers";

const SelectionControls = ({ dimensionIri }: { dimensionIri: string }) => {
  const { selectAll, selectNone } = useDimensionSelection(dimensionIri);
  const { activeKeys, allValues } = useMultiFilterContext();

  return (
    <Box color="monochrome500">
      <Button
        onClick={selectAll}
        variant="inline"
        sx={{ mr: 2, mb: 4 }}
        disabled={activeKeys.size === allValues.length}
      >
        <Trans id="controls.filter.select.all">Select all</Trans>
      </Button>
      ·
      <Button
        onClick={selectNone}
        variant="inline"
        sx={{ ml: 2, mb: 4 }}
        disabled={activeKeys.size === 0}
      >
        <Trans id="controls.filter.select.none">Select none</Trans>
      </Button>
    </Box>
  );
};

export const DimensionValuesMultiFilter = ({
  dataSetIri,
  dimensionIri,
  colorConfigPath,
}: {
  dataSetIri: string;
  dimensionIri: string;
  colorConfigPath?: string;
}) => {
  const locale = useLocale();
  const [state] = useConfiguratorState();
  const [{ data }] = useDimensionValuesQuery({
    variables: { dimensionIri, locale, dataCubeIri: dataSetIri },
  });

  const dimension = data?.dataCubeByIri?.dimensionByIri;

  const sortedDimensionValues = useMemo(() => {
    return dimension?.values
      ? [...dimension.values].sort((a, b) =>
          a.label.localeCompare(b.label, locale)
        )
      : [];
  }, [dimension?.values, locale]);

  if (data?.dataCubeByIri?.dimensionByIri) {
    return (
      <MultiFilterContextProvider dimensionData={dimension}>
        <SelectionControls dimensionIri={dimensionIri} />
        {sortedDimensionValues.map((dv) => {
          if (state.state === "CONFIGURING_CHART") {
            return (
              <Flex
                key={dv.value}
                sx={{
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 1,
                  height: "2rem",
                }}
              >
                <Box sx={{ maxWidth: "82%" }}>
                  <MultiFilterFieldCheckbox
                    dimensionIri={dimensionIri}
                    label={dv.label}
                    value={dv.value}
                  />
                </Box>
                <MultiFilterFieldColorPicker
                  dimensionIri={dimensionIri}
                  value={dv.value}
                  colorConfigPath={colorConfigPath}
                />
              </Flex>
            );
          } else {
            return null;
          }
        })}
      </MultiFilterContextProvider>
    );
  } else {
    return <Loading />;
  }
};

export const TimeFilter = ({
  dataSetIri,
  dimensionIri,
}: {
  dataSetIri: string;
  dimensionIri: string;
}) => {
  const locale = useLocale();
  const formatLocale = useTimeFormatLocale();
  const timeFormatUnit = useTimeFormatUnit();
  const [state, dispatch] = useConfiguratorState();

  const setFilterRange = useCallback(
    ([from, to]: [string, string]) => {
      dispatch({
        type: "CHART_CONFIG_FILTER_SET_RANGE",
        value: {
          dimensionIri,
          from,
          to,
        },
      });
    },
    [dispatch, dimensionIri]
  );

  const [{ data }] = useTemporalDimensionValuesQuery({
    variables: { dimensionIri, locale, dataCubeIri: dataSetIri },
  });

  const dimension = data?.dataCubeByIri?.dimensionByIri;

  if (
    dimension &&
    dimension.__typename === "TemporalDimension" &&
    state.state === "CONFIGURING_CHART"
  ) {
    const { timeUnit, timeFormat } = dimension;

    const activeFilter = getFilterValue(state, dimension.iri);

    const timeInterval = getTimeInterval(timeUnit);

    const parse = formatLocale.parse(timeFormat);
    const formatDateValue = formatLocale.format(timeFormat);

    const from = parse(dimension.values[0].value);
    const to = parse(dimension.values[1].value);

    if (!from || !to) {
      return null;
    }

    const timeRange =
      activeFilter && activeFilter.type === "range"
        ? [parse(activeFilter.from)!, parse(activeFilter.to)!]
        : [from, to];

    return (
      <Box>
        {timeFormatUnit(timeRange[0], timeUnit)} –{" "}
        {timeFormatUnit(timeRange[1], timeUnit)}
        <EditorIntervalBrush
          timeExtent={[from, to]}
          timeRange={timeRange}
          timeInterval={timeInterval}
          onChange={([from, to]) =>
            setFilterRange([formatDateValue(from), formatDateValue(to)])
          }
        />
      </Box>
    );
  } else {
    return <Loading />;
  }
};

// This component is now only used in the Table Chart options.
export const DimensionValuesSingleFilter = ({
  dataSetIri,
  dimensionIri,
}: {
  dataSetIri: string;
  dimensionIri: string;
}) => {
  const locale = useLocale();
  const [{ data }] = useDimensionValuesQuery({
    variables: { dimensionIri, locale, dataCubeIri: dataSetIri },
  });

  const dimension = data?.dataCubeByIri?.dimensionByIri;

  const sortedDimensionValues = useMemo(() => {
    return dimension?.values
      ? [...dimension.values].sort((a, b) =>
          a.label.localeCompare(b.label, locale)
        )
      : [];
  }, [dimension?.values, locale]);

  if (dimension) {
    return (
      <>
        {sortedDimensionValues.map((dv) => {
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
