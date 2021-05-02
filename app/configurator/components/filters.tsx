import { Trans } from "@lingui/macro";
import get from "lodash/get";
import { useCallback, useMemo } from "react";
import { Box, Button } from "theme-ui";
import { getFilterValue, useConfiguratorState } from "..";
import { Loading } from "../../components/hint";
import {
  useDimensionValuesQuery,
  useTemporalDimensionValuesQuery,
} from "../../graphql/query-hooks";
import { useLocale } from "../../locales/use-locale";
import { EditorIntervalBrush } from "../interactive-filters/editor-time-interval-brush";
import { MultiFilterField, SingleFilterField } from "./field";
import { getTimeInterval, useTimeFormatLocale } from "./ui-helpers";

type SelectionState = "SOME_SELECTED" | "NONE_SELECTED" | "ALL_SELECTED";

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
  const [state, dispatch] = useConfiguratorState();
  const [{ data }] = useDimensionValuesQuery({
    variables: { dimensionIri, locale, dataCubeIri: dataSetIri },
  });

  const selectAll = useCallback(() => {
    dispatch({
      type: "CHART_CONFIG_FILTER_RESET_MULTI",
      value: {
        dimensionIri,
      },
    });
  }, [dispatch, dimensionIri]);

  const selectNone = useCallback(() => {
    dispatch({
      type: "CHART_CONFIG_FILTER_SET_NONE_MULTI",
      value: { dimensionIri },
    });
  }, [dispatch, dimensionIri]);

  const dimension = data?.dataCubeByIri?.dimensionByIri;

  const sortedDimensionValues = useMemo(() => {
    return dimension?.values
      ? [...dimension.values].sort((a, b) =>
          a.label.localeCompare(b.label, locale)
        )
      : [];
  }, [dimension?.values, locale]);

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
            sx={{ mr: 2, mb: 4 }}
            disabled={selectionState === "ALL_SELECTED"}
          >
            <Trans id="controls.filter.select.all">Select all</Trans>
          </Button>
          ·
          <Button
            onClick={selectNone}
            variant="inline"
            sx={{ ml: 2, mb: 4 }}
            disabled={selectionState === "NONE_SELECTED"}
          >
            <Trans id="controls.filter.select.none">Select none</Trans>
          </Button>
        </Box>

        {sortedDimensionValues.map((dv) => {
          if (state.state === "CONFIGURING_CHART") {
            const path = colorConfigPath ? `${colorConfigPath}.` : "";

            const color = get(
              state,
              `chartConfig.fields["${state.activeField}"].${path}colorMapping["${dv.value}"]`
            );

            return (
              <MultiFilterField
                key={dv.value}
                dimensionIri={dimensionIri}
                label={dv.label}
                value={dv.value}
                allValues={dimension.values.map((d) => d.value)}
                checked={selectionState === "ALL_SELECTED" ? true : undefined}
                checkAction={selectionState === "NONE_SELECTED" ? "SET" : "ADD"}
                color={color}
                colorConfigPath={colorConfigPath}
              />
            );
          } else {
            return null;
          }
        })}
      </>
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
    // TODO use localized time format
    const format = formatLocale.format(timeFormat);

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
        {format(timeRange[0])} – {format(timeRange[1])}
        <EditorIntervalBrush
          timeExtent={[from, to]}
          timeRange={timeRange}
          timeInterval={timeInterval}
          onChange={([from, to]) => setFilterRange([format(from), format(to)])}
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
