import { Trans } from "@lingui/macro";
import {
  Autocomplete,
  autocompleteClasses,
  Box,
  Button,
  ClickAwayListener,
  Input,
  InputAdornment,
  Menu,
  Typography,
  ListSubheader,
  AutocompleteProps,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { makeStyles } from "@mui/styles";
import { groups } from "d3";
import { get, keyBy, sortBy, groupBy } from "lodash";
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
import { dfs } from "@/lib/dfs";
import useEvent from "@/lib/use-event";
import { useLocale } from "@/locales/use-locale";
import { valueComparator } from "@/utils/sorting-values";

import { ControlSectionSkeleton } from "./chart-controls/section";

const useStyles = makeStyles(() => {
  return {
    autocompleteHeader: {
      margin: "1rem 0.5rem",
    },
    listItems: {
      display: "grid",
      // checkbox content, color picker
      gridTemplateColumns: "1fr min-content",
    },
    autocompleteInputContainer: {
      margin: "0 0.75rem 1rem",
    },
    autocompleteApplyButtonContainer: {
      position: "sticky",
      zIndex: 1000,
      bottom: "0",
      left: "0",
      marginTop: "1rem",
      right: "0",
      padding: "1rem",
      background: "rgba(255,255,255,0.75)",
    },
    autocompleteApplyButton: {
      justifyContent: "center",
    },
    autocompleteInput: {
      width: "100%",
    },
    optionColor: {
      borderRadius: "3px",
      width: 12,
      height: 12,
    },
    listSubheader: {
      minHeight: "3rem",
      padding: "0.5rem 0 0.5rem, 2.25rem",
      alignItems: "center",
      display: "grid",
      gridTemplateColumns: "auto max-content",
    },
    selectedValueRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "1rem",
      marginBottom: "0.5rem",
    },
  };
});

const AutocompletePopperStyled = styled("div")(({ theme }) => ({
  // The autocomplete styles the Popper and sets its width
  // to its anchorEl width via the style attribute
  // Since we cannot override the style attribute through
  // componentsProps.popper yet, we have to use !important
  // here
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
      padding: "8px 16px",
      borderBottom: `1px solid  ${theme.palette.divider}`,
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

const AutocompletePopper: AutocompleteProps<
  unknown,
  true,
  true,
  true
>["PopperComponent"] = ({ disablePortal, anchorEl, open, ...rest }) => {
  return <AutocompletePopperStyled {...rest} />;
};

const groupByParent = (node: { parents: HierarchyValue[] }) => {
  return node?.parents.map((x) => x.label).join(" > ") || "";
};

const isDimensionOptionEqualToDimensionValue = (
  option: HierarchyValue,
  value: HierarchyValue
) => {
  return option.value === value?.value;
};

const MultiFilterContent = ({
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
  const [pendingValues, setPendingValues] = useState<typeof values>([]);

  const classes = useStyles();

  const { selectAll, selectNone } = useDimensionSelection(dimensionIri);
  const { activeKeys, allValues, getValueColor } = useMultiFilterContext();

  const { options, optionsByValue, optionsByParent } = useMemo(() => {
    const flat = sortBy(
      dfs(tree, (node, { depth, parents }) => ({
        ...node,
        parents,
      })),
      (node) => node.parents.map((x) => x.label).join(" > ")
    );
    const optionsByValue = keyBy(flat, (x) => x.value);
    const optionsByParent = groupBy(flat, groupByParent);
    return {
      options: sortBy(flat, groupByParent),
      optionsByValue,
      optionsByParent,
    };
  }, [tree]);

  const { values, valueGroups } = useMemo(() => {
    const values = (
      (rawValues?.type === "multi" && Object.keys(rawValues.values)) ||
      []
    ).map((v) => optionsByValue[v]);
    const grouped = groups(values, groupByParent);
    return {
      values,
      valueGroups: grouped,
      valuesByParent: groupBy(values, groupByParent),
    };
  }, [optionsByValue, rawValues]);

  // Recomputes color palette making sure that used values
  // are sorted first, so they have different colors
  const handleRecomputeColorMapping = useEvent(() => {
    const usedValues = new Set(values.map((v) => v.value));
    dispatch({
      type: "CHART_CONFIG_UPDATE_COLOR_MAPPING",
      value: {
        dimensionIri,
        values: sortBy(allValues, (v) => (usedValues.has(v) ? 0 : 1)),
      },
    });
  });

  const handleSelect = useEvent((ev, newValues: typeof values) => {
    setPendingValues(newValues);
  });

  const pendingValuesByParent = useMemo(() => {
    return groupBy(pendingValues, groupByParent);
  }, [pendingValues]);

  const hasSelectedAllGroup = useCallback(
    (groupKey: string) => {
      return (
        pendingValuesByParent[groupKey]?.length >=
        optionsByParent[groupKey]?.length
      );
    },
    [pendingValuesByParent, optionsByParent]
  );

  const handleClickGroup = useEvent((groupLabel: string) => {
    return setPendingValues((pendingValues) => {
      if (hasSelectedAllGroup(groupLabel)) {
        const toRemove = new Set(
          optionsByParent[groupLabel].map((x) => x.value)
        );
        return pendingValues.filter((x) => !toRemove.has(x.value));
      } else {
        return [...pendingValues, ...optionsByParent[groupLabel]];
      }
    });
  });

  const [anchorEl, setAnchorEl] = useState<HTMLElement>();
  const handleOpenAutocomplete: MouseEventHandler<HTMLButtonElement> = useEvent(
    (ev) => {
      setPendingValues(values);
      setAnchorEl(ev.currentTarget);
    }
  );
  const handleCloseAutocomplete = useEvent(() => {
    setAnchorEl(undefined);
    const newValues = pendingValues.map((x) => x?.value).filter(Boolean);
    dispatch({
      type: "CHART_CONFIG_FILTER_SET_MULTI",
      value: {
        dimensionIri,
        values: newValues,
      },
    });
    anchorEl?.focus();
  });

  const [inputValue, setInputValue] = useState("");
  const handleInputChange: AutocompleteProps<
    unknown,
    true,
    true,
    true
  >["onInputChange"] = useEvent((ev, value, reason) => {
    // Do not let MUI reset the input on option selection
    if (reason === "input") {
      setInputValue(value);
    }
  });
  const handleAutocompleteClose = useEvent((ev, reason) => {
    if (reason === "escape") {
      handleCloseAutocomplete();
    }
  });
  return (
    <Box sx={{ position: "relative" }}>
      <Box color="grey.500" mb={4}>
        <Button variant="inline" onClick={handleRecomputeColorMapping}>
          Refresh colors
        </Button>
        <br />
        <Button variant="inline" onClick={handleOpenAutocomplete}>
          Select filters
        </Button>
        <Box component="span" mx={1}>
          ·
        </Box>
        <Button
          onClick={selectAll}
          variant="inline"
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

      {valueGroups.map(([parentLabel, children]) => {
        return (
          <Box sx={{ mb: 4 }} key={parentLabel}>
            <Typography variant="h5" sx={{ mb: 3 }}>
              {parentLabel}
            </Typography>
            {children.map((v) => {
              return (
                <Flex key={v.value} className={classes.selectedValueRow}>
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
            <Box className={classes.autocompleteHeader}>
              <Typography variant="h5">
                Select values to be displayed
              </Typography>
              <Typography variant="caption">
                For best results, do not select more than 7 values
              </Typography>
            </Box>
            <Autocomplete
              PopperComponent={AutocompletePopper}
              value={pendingValues}
              multiple
              open
              renderTags={() => null}
              onChange={handleSelect}
              onClose={handleAutocompleteClose}
              renderGroup={(params) => {
                return (
                  <>
                    {params.group ? (
                      <ListSubheader
                        className={classes.listSubheader}
                        key={params.key}
                      >
                        <span>{params.group}</span>
                        <Button
                          variant="text"
                          onClick={() => handleClickGroup(params.group)}
                        >
                          {hasSelectedAllGroup(params.group)
                            ? "Select none"
                            : "Select all"}
                        </Button>
                      </ListSubheader>
                    ) : null}
                    {params.children}
                  </>
                );
              }}
              options={options}
              groupBy={groupByParent}
              disableCloseOnSelect
              inputValue={inputValue}
              onInputChange={handleInputChange}
              isOptionEqualToValue={isDimensionOptionEqualToDimensionValue}
              renderOption={(props, option, { selected }) => {
                return (
                  <li {...props}>
                    <Box
                      className={classes.optionColor}
                      sx={{
                        visibility: selected ? "visible" : "hidden",
                        background: getValueColor(option.value),
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
                <Box className={classes.autocompleteInputContainer}>
                  <Input
                    className={classes.autocompleteInput}
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
            <Box className={classes.autocompleteApplyButtonContainer}>
              <Button
                size="large"
                className={classes.autocompleteApplyButton}
                fullWidth
                onClick={handleCloseAutocomplete}
              >
                Apply
              </Button>
            </Box>
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
        <MultiFilterContent
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
