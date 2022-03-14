import Flex from "../../components/flex";
import { Trans } from "@lingui/macro";
import React, { useCallback, useMemo } from "react";
import { Box, Button, Typography } from "@mui/material";
import {
  getFilterValue,
  MultiFilterContextProvider,
  useConfiguratorState,
  useDimensionSelection,
  useMultiFilterContext,
} from "..";
import { Loading } from "../../components/hint";
import Stack from "../../components/Stack";
import {
  useDimensionValuesQuery,
  useTemporalDimensionValuesQuery,
} from "../../graphql/query-hooks";
import { useLocale } from "../../locales/use-locale";
import {
  HierarchyValue,
  useHierarchicalDimensionValuesQuery,
} from "../../utils/dimension-hierarchy";
import { valueComparator } from "../../utils/sorting-values";
import { EditorIntervalBrush } from "../interactive-filters/editor-time-interval-brush";
import { Accordion, AccordionContent, AccordionSummary } from "./Accordion";
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
        sx={{ ml: 2, mr: 2, mb: 4 }}
        disabled={activeKeys.size === 0}
      >
        <Trans id="controls.filter.select.none">Select none</Trans>
      </Button>
      ·
      <Typography
        color="monochrome700"
        sx={{ px: 2, fontSize: 3, display: "inline" }}
        component="span"
      >
        <Trans id="controls.filter.nb-elements">
          {activeKeys.size} of {allValues.length}
        </Trans>
      </Typography>
    </Box>
  );
};

const renderDimensionTree = (tree: HierarchyValue[], depth = 0) => {
  return (
    <>
      {tree.map((tv) => {
        return (
          <Accordion key={tv.value} initialExpanded>
            <Stack spacing={0.5}>
              {tv.children && tv.children.length > 0 ? (
                <AccordionSummary>
                  <MultiFilterFieldCheckbox
                    label={tv.label}
                    value={tv.children.map((c) => c.value)}
                  />
                  <MultiFilterFieldColorPicker value={tv.value} />
                </AccordionSummary>
              ) : (
                <Flex
                  key={tv.value}
                  sx={{
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Box sx={{ flexGrow: 1 }}>
                    <MultiFilterFieldCheckbox
                      label={tv.label}
                      value={tv.value}
                    />
                  </Box>
                  <Box sx={{ flexShrink: 0 }}>
                    <MultiFilterFieldColorPicker value={tv.value} />
                  </Box>
                </Flex>
              )}
            </Stack>
            <AccordionContent>
              <Stack spacing={0.5} ml={5}>
                {tv.children.map((dv) => {
                  if (dv.children.length > 0) {
                    // Render tree recursively
                    return renderDimensionTree(dv.children, depth + 1);
                  }
                  return (
                    <Flex
                      key={dv.value}
                      sx={{
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Box sx={{ flexGrow: 1 }}>
                        <MultiFilterFieldCheckbox
                          label={dv.label}
                          value={dv.value}
                        />
                      </Box>
                      <Box sx={{ flexShrink: 0 }}>
                        <MultiFilterFieldColorPicker value={dv.value} />
                      </Box>
                    </Flex>
                  );
                })}
              </Stack>
            </AccordionContent>
          </Accordion>
        );
      })}
    </>
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

  const [{ data }] = useDimensionValuesQuery({
    variables: { dimensionIri, locale, dataCubeIri: dataSetIri },
  });

  const { data: tree, fetching: fetchingHierarchy } =
    useHierarchicalDimensionValuesQuery({
      dimensionIri,
      locale,
      dataSetIri,
    });

  const dimensionData = data?.dataCubeByIri?.dimensionByIri;

  if (data?.dataCubeByIri?.dimensionByIri && !fetchingHierarchy) {
    return (
      <MultiFilterContextProvider
        dimensionData={dimensionData}
        dimensionIri={dimensionIri}
        colorConfigPath={colorConfigPath}
      >
        <SelectionControls dimensionIri={dimensionIri} />
        {tree ? renderDimensionTree(tree) : null}
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
    const to = parse(dimension.values[dimension.values.length - 1].value);

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
      ? [...dimension.values].sort(valueComparator(locale))
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
