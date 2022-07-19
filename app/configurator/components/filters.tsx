import { Trans } from "@lingui/macro";
import { Box, BoxProps, Button, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import clsx from "clsx";
import React, { useCallback, useMemo } from "react";

import { Loading } from "@/components/hint";
import {
  getFilterValue,
  MultiFilterContextProvider,
  useConfiguratorState,
  useDimensionSelection,
  useMultiFilterContext,
} from "@/configurator";
import {
  MultiFilterFieldCheckbox,
  MultiFilterFieldColorPicker,
  SingleFilterField,
} from "@/configurator/components/field";
import {
  getTimeInterval,
  useTimeFormatLocale,
  useTimeFormatUnit,
} from "@/configurator/components/ui-helpers";
import { EditorIntervalBrush } from "@/configurator/interactive-filters/editor-time-interval-brush";
import {
  useDimensionHierarchyQuery,
  useDimensionValuesQuery,
  useTemporalDimensionValuesQuery,
} from "@/graphql/query-hooks";
import { HierarchyValue } from "@/graphql/resolver-types";
import { useLocale } from "@/locales/use-locale";
import { valueComparator } from "@/utils/sorting-values";

import { Accordion, AccordionSummary, AccordionContent } from "./Accordion";
import { ControlSectionSkeleton } from "./chart-controls/section";

const SelectionControls = ({
  dimensionIri,
  ...props
}: { dimensionIri: string } & BoxProps) => {
  const { selectAll, selectNone } = useDimensionSelection(dimensionIri);
  const { activeKeys, allValues } = useMultiFilterContext();

  return (
    <Box color="grey.500" mb={4} {...props}>
      <Button
        onClick={selectAll}
        variant="inline"
        color="primary"
        sx={{ typography: "body2", py: 1 }}
        disabled={activeKeys.size === allValues.length}
      >
        <Trans id="controls.filter.select.all">Select all</Trans>
      </Button>
      <Box component="span" mx={1}>
        ·
      </Box>
      <Button
        onClick={selectNone}
        variant="inline"
        color="primary"
        sx={{ typography: "body2" }}
        disabled={activeKeys.size === 0}
      >
        <Trans id="controls.filter.select.none">Select none</Trans>
      </Button>
      <br />
      <Typography
        variant="body2"
        color="grey.700"
        sx={{ display: "inline" }}
        component="span"
      >
        <Trans id="controls.filter.nb-elements">
          {activeKeys.size} of {allValues.length}
        </Trans>
      </Typography>
    </Box>
  );
};

const useStyles = makeStyles(() => {
  return {
    listItems: {
      display: "grid",
      // checkbox content, color picker
      gridTemplateColumns: "1fr min-content",
    },
    withChildren: {
      marginLeft: "1.25rem",
    },
    accordionSummary: {
      display: "grid",
      // checkbox content, color picker
      gridTemplateColumns: "1fr min-content",
      flexGrow: 1,
    },
    accordionContent: {
      marginLeft: "0.5rem",
    },
  };
});

const DimensionValueTree = ({
  tree,
  depth = 0,
  classes,
}: {
  tree: HierarchyValue[];
  depth: number;
  classes: ReturnType<typeof useStyles>;
}) => {
  return (
    <>
      {tree.map((tv) => {
        if (!tv.label) {
          return null;
        }
        return (
          <Accordion key={tv.value} initialExpanded>
            {tv.children && tv.children.length > 0 ? (
              <AccordionSummary>
                <div className={classes.accordionSummary}>
                  <MultiFilterFieldCheckbox label={tv.label} value={tv.value} />
                  <MultiFilterFieldColorPicker value={tv.value} />
                </div>
              </AccordionSummary>
            ) : (
              <div
                className={clsx(
                  classes.listItems,
                  tv.children && tv.children.length === 0
                    ? classes.withChildren
                    : null
                )}
                key={tv.value}
              >
                <MultiFilterFieldCheckbox label={tv.label} value={tv.value} />
                <MultiFilterFieldColorPicker value={tv.value} />
              </div>
            )}
            {tv.children && tv.children.length > 0 ? (
              <AccordionContent className={classes.accordionContent}>
                <DimensionValueTree
                  tree={tv.children}
                  depth={depth + 1}
                  classes={classes}
                />
              </AccordionContent>
            ) : null}
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
  const classes = useStyles();

  const [{ data }] = useDimensionValuesQuery({
    variables: { dimensionIri, locale, dataCubeIri: dataSetIri },
  });

  const [{ fetching: fetchingHierarchy, data: hierarchyData }] =
    useDimensionHierarchyQuery({
      variables: {
        cubeIri: dataSetIri,
        locale,
        dimensionIri,
      },
    });
  const hierarchyTree = hierarchyData?.dataCubeByIri?.dimensionByIri?.hierarchy;
  const dimensionData = data?.dataCubeByIri?.dimensionByIri;

  if (data?.dataCubeByIri?.dimensionByIri && !fetchingHierarchy) {
    return (
      <MultiFilterContextProvider
        dimensionData={dimensionData}
        dimensionIri={dimensionIri}
        hierarchyData={hierarchyTree || []}
        colorConfigPath={colorConfigPath}
      >
        <SelectionControls
          data-testid="selection-controls-tree-filters"
          dimensionIri={dimensionIri}
        />

        <DimensionValueTree
          tree={
            hierarchyTree && hierarchyTree.length > 0
              ? hierarchyTree
              : data.dataCubeByIri.dimensionByIri.values
          }
          depth={0}
          classes={classes}
        />
      </MultiFilterContextProvider>
    );
  } else {
    return <ControlSectionSkeleton sx={{ px: 0 }} />;
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
