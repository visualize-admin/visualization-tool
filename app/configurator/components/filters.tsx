import { Trans } from "@lingui/macro";
import {
  Autocomplete,
  autocompleteClasses,
  Box,
  Button,
  ClickAwayListener,
  IconButton,
  Input,
  InputAdornment,
  Menu,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { makeStyles } from "@mui/styles";
import { groups } from "d3";
import { get, keyBy, sortBy } from "lodash";
import React, {
  MouseEventHandler,
  useCallback,
  useMemo,
  useState,
} from "react";

import Flex from "@/components/flex";
import { Loading } from "@/components/hint";
import {
  getFilterValue,
  isConfiguring,
  MultiFilterContextProvider,
  useConfiguratorState,
  useDimensionSelection,
  useMultiFilterContext,
} from "@/configurator";
import {
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
import SvgIcClose from "@/icons/components/IcClose";
import SvgIcSearch from "@/icons/components/IcSearch";
import SvgIcSettings from "@/icons/components/IcSettings";
import { dfs } from "@/lib/dfs";
import useEvent from "@/lib/use-event";
import { useLocale } from "@/locales/use-locale";
import { valueComparator } from "@/utils/sorting-values";

import { ControlSectionSkeleton } from "./chart-controls/section";
import useDisclosure from "./use-disclosure";

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

const AutocompletePopper = styled("div")(({ theme }) => ({
  // TODO See how to remove the important
  width: "350px !important",
  [`& .${autocompleteClasses.paper}`]: {
    boxShadow: "none",
    margin: 0,
    color: "inherit",
    fontSize: theme.typography.body2.fontSize,
    overflow: "scroll",
  },
  [`& .${autocompleteClasses.listbox}`]: {
    padding: 0,
    maxHeight: "max-content",
    overflow: "scroll",
    [`& .${autocompleteClasses.option}`]: {
      display: "grid",
      gridTemplateColumns: "min-content 1fr min-content",
      gridTemplateRows: "auto",
      gridColumnGap: "0.5rem",
      minHeight: "auto",
      alignItems: "flex-start",
      padding: 8,
      borderBottom: `1px solid  ${
        theme.palette.mode === "light" ? " #eaecef" : "#30363d"
      }`,
      "& > *:nth-child(1), & > *:nth-child(3)": {
        // background: "green",
        marginTop: "0.375rem",
      },
      '&[aria-selected="true"]': {
        backgroundColor: "transparent",
      },
      [`&.${autocompleteClasses.focused}, &.${autocompleteClasses.focused}[aria-selected="true"]`]:
        {
          backgroundColor: theme.palette.action.hover,
        },
    },
  },
  [`&.${autocompleteClasses.popper}`]: {
    width: 200,
  },
  [`&.${autocompleteClasses.popperDisablePortal}`]: {
    position: "relative",
  },
}));

const groupByParent = (node: { parents: HierarchyValue[] }) => {
  return node.parents.map((x) => x.label).join(" > ");
};

const DimensionValueTree = ({
  tree,
  dimensionIri,
}: {
  tree: HierarchyValue[];
  depth: number;
  classes: ReturnType<typeof useStyles>;
  dimensionIri: string;
}) => {
  const [config, dispatch] = useConfiguratorState(isConfiguring);
  const rawValues = config.chartConfig.filters[dimensionIri];
  const locale = useLocale();
  const [pendingValues, setPendingValues] = useState<typeof values>([]);

  const { selectAll, selectNone } = useDimensionSelection(dimensionIri);
  const { activeKeys, allValues, getValueColor } = useMultiFilterContext();

  const { options, byValue } = useMemo(() => {
    const flat = sortBy(
      dfs(tree, (node, { depth, parents }) => ({
        ...node,
        parents,
      })),
      (node) => node.parents.map((x) => x.label).join(" > ")
    );
    const byValue = keyBy(flat, (x) => x.value);
    return { options: sortBy(flat, groupByParent), byValue };
  }, [tree]);

  const values = useMemo(() => {
    return (
      (rawValues?.type === "multi" && Object.keys(rawValues.values)) ||
      []
    ).map((v) => byValue[v]);
  }, [byValue, rawValues]);

  const handleSelect = useEvent((ev, newValues: typeof values) => {
    setPendingValues(newValues);
  });

  const {
    open: openAutocomplete,
    close: closeAutocomplete,
    isOpen: isAutocompleteOpen,
  } = useDisclosure();

  const [anchorEl, setAnchorEl] = useState<HTMLElement>();
  const handleOpenAutocomplete: MouseEventHandler<HTMLButtonElement> = useEvent(
    (ev) => {
      setPendingValues(values);
      setAnchorEl(ev.currentTarget);
      openAutocomplete();
    }
  );
  const handleCloseAutocomplete = useEvent(() => {
    dispatch({
      type: "CHART_CONFIG_FILTER_SET_MULTI",
      value: {
        dimensionIri,
        values: pendingValues.map((x) => x?.value).filter(Boolean),
      },
    });
    anchorEl?.focus();
    setAnchorEl(undefined);
    closeAutocomplete();
  });
  const grouped = groups(values, groupByParent);
  return (
    <Box sx={{ position: "relative" }}>
      <Box color="grey.500" mb={4}>
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
        <IconButton onClick={handleOpenAutocomplete}>
          <SvgIcSettings />
        </IconButton>
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
      {grouped.map(([parentLabel, children]) => {
        return (
          <Box sx={{ mb: 1 }} key={parentLabel}>
            <Typography variant="h5" gutterBottom>
              {parentLabel}
            </Typography>
            {children.map((v) => {
              return (
                <Flex
                  key={v.value}
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ gap: "1rem", marginBottom: "0.5rem" }}
                >
                  <Typography variant="body2">{v?.label}</Typography>
                  <MultiFilterFieldColorPicker value={v.value} />
                </Flex>
              );
            })}
          </Box>
        );
      })}
      <Menu open={!!anchorEl} anchorEl={anchorEl}>
        <ClickAwayListener onClickAway={handleCloseAutocomplete}>
          <div>
            <Box mx="1rem" mb={"0.5rem"}>
              <Typography variant="h5">
                Select values to be displayed
              </Typography>
              <Typography variant="caption">
                For best results, select no more than 7 values
              </Typography>
            </Box>
            <Autocomplete
              PopperComponent={AutocompletePopper}
              value={pendingValues}
              multiple
              open
              renderTags={() => null}
              onChange={handleSelect}
              onClose={(ev, reason) => {
                if (reason === "escape") {
                  handleCloseAutocomplete();
                }
              }}
              options={options}
              groupBy={groupByParent}
              disableCloseOnSelect
              isOptionEqualToValue={(option, value) => {
                return option.value === value?.value;
              }}
              renderOption={(props, option, { selected }) => {
                return (
                  <li {...props}>
                    <Box
                      sx={{
                        visibility: selected ? "visible" : "hidden",
                        borderRadius: "3px",
                        background: getValueColor(option.value),
                        width: 12,
                        height: 12,
                      }}
                    />
                    <Box>{option.label}</Box>
                    <Box
                      component={SvgIcClose}
                      sx={{
                        visibility: selected ? "visible" : "hidden",
                        width: 32,
                      }}
                    />
                  </li>
                );
              }}
              renderInput={(params) => (
                <Box sx={{ mb: "0.75rem", mx: "1rem" }}>
                  <Input
                    sx={{ width: "100%" }}
                    startAdornment={
                      <InputAdornment position="start">
                        <SvgIcSearch />
                      </InputAdornment>
                    }
                    ref={params.InputProps.ref}
                    inputProps={params.inputProps}
                    autoFocus
                    placeholder="Search"
                  />
                </Box>
              )}
            />
          </div>
        </ClickAwayListener>
      </Menu>
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

  const [configuratorState, dispatch] = useConfiguratorState();

  const getValueColor = useCallback(
    (value: string) => {
      const path = colorConfigPath ? `${colorConfigPath}.` : "";
      const chartConfig =
        configuratorState.state === "CONFIGURING_CHART"
          ? configuratorState.chartConfig
          : null;

      const fullpath = `fields["segment"].${path}colorMapping["${value}"]`;
      console.log(fullpath, chartConfig);
      const color = chartConfig ? get(chartConfig, fullpath) : null;
      return color;
    },
    [colorConfigPath, configuratorState]
  );

  if (data?.dataCubeByIri?.dimensionByIri && !fetchingHierarchy) {
    return (
      <MultiFilterContextProvider
        dimensionData={dimensionData}
        dimensionIri={dimensionIri}
        hierarchyData={hierarchyTree || []}
        colorConfigPath={colorConfigPath}
        getValueColor={getValueColor}
      >
        <DimensionValueTree
          dimensionIri={dimensionIri}
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
              label={dv.label + "toto"}
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
