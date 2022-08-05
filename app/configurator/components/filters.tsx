import { Trans } from "@lingui/macro";
import {
  autocompleteClasses,
  Box,
  Button,
  ClickAwayListener,
  Input,
  InputAdornment,
  Typography,
  ListSubheader,
  AutocompleteProps,
  Popover,
  Autocomplete,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { makeStyles } from "@mui/styles";
import { groups } from "d3";
import { get, keyBy, sortBy, groupBy } from "lodash";
import React, {
  forwardRef,
  MouseEventHandler,
  MutableRefObject,
  useCallback,
  useMemo,
  useRef,
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
    autocompleteMenuContent: {
      "--mx": "1rem",
      "--colorBoxSize": "0.75rem",
      "--columnGap": "1rem",
    },
    autocompleteHeader: {
      margin: "1rem var(--mx)",
    },
    autocompleteInputContainer: {
      margin: "0 var(--mx) 1rem",
    },
    autocompleteApplyButtonContainer: {
      position: "sticky",
      zIndex: 1000,
      bottom: "0",
      left: "0",
      marginTop: "1rem",
      right: "0",
      padding: "1rem var(--mx)",
      background: "rgba(255,255,255,0.75)",
    },
    autocompleteApplyButton: {
      justifyContent: "center",
    },
    autocompleteInput: {
      width: "100%",
    },
    optionColor: {
      marginLeft: "0.25rem",
      borderRadius: "3px",
      width: "var(--colorBoxSize)",
      height: "var(--colorBoxSize)",
    },
    listSubheader: {
      minHeight: "3rem",
      padding:
        "0.5rem 1rem 0.5rem calc(var(--mx) + var(--colorBoxSize) + var(--columnGap))",
      alignItems: "center",
      display: "grid",
      gridTemplateColumns: "auto max-content",
    },
    selectedValueRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
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
    padding: 0,
  },
  [`& .${autocompleteClasses.listbox}`]: {
    padding: 0,
    maxHeight: "max-content",
    [`& .${autocompleteClasses.option}`]: {
      display: "grid",
      // color box, label, cross icon
      gridTemplateColumns: "min-content 1fr min-content",
      gridTemplateRows: "auto",
      gridColumnGap: "var(--columnGap)",
      minHeight: "auto",
      alignItems: "flex-start",
      padding: "8px 16px",
      borderBottom: `1px solid  ${theme.palette.divider}`,
      "& > *:nth-child(1), & > *:nth-child(3)": {
        marginTop: "0.375rem",
      },
      '&[aria-selected="true"]': {
        // We can see the selection status via the color box + cross icon
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

const getOptionsFromTree = (tree: HierarchyValue[]) => {
  return sortBy(
    dfs(tree, (node, { depth, parents }) => ({
      ...node,
      parents,
    })),
    (node) => node.parents.map((x) => x.label).join(" > ")
  );
};

type AutocompleteOption = ReturnType<typeof getOptionsFromTree>[number];

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

  const classes = useStyles();

  const { selectAll, selectNone } = useDimensionSelection(dimensionIri);
  const { activeKeys, allValues, getValueColor } = useMultiFilterContext();

  const { options, optionsByValue, optionsByParent } = useMemo(() => {
    const flat = getOptionsFromTree(tree);
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

  const [anchorEl, setAnchorEl] = useState<HTMLElement>();
  const handleOpenAutocomplete: MouseEventHandler<HTMLButtonElement> = useEvent(
    (ev) => {
      setAnchorEl(ev.currentTarget);
    }
  );

  // The popover content is responsible for keeping this ref up-to-date.
  // This is so that the click-away close event can still access the pending values
  // without the state changing (triggering a repositioning of the popover).
  const pendingValuesRef = useRef<AutocompleteOption[]>([]);
  const handleCloseAutocomplete = useEvent(() => {
    setAnchorEl(undefined);
    const newValues = pendingValuesRef.current
      .map((x) => x?.value)
      .filter(Boolean);
    dispatch({
      type: "CHART_CONFIG_FILTER_SET_MULTI",
      value: {
        dimensionIri,
        values: newValues,
      },
    });
    anchorEl?.focus();
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
      <Popover open={!!anchorEl} anchorEl={anchorEl}>
        <ClickAwayListener onClickAway={handleCloseAutocomplete}>
          <PopoverContent
            pendingValuesRef={pendingValuesRef}
            options={options}
            optionsByParent={optionsByParent}
            onClose={handleCloseAutocomplete}
            values={values}
          />
        </ClickAwayListener>
      </Popover>
    </Box>
  );
};

const PopoverContent = forwardRef<
  HTMLDivElement,
  {
    optionsByParent: Record<string, AutocompleteOption[]>;
    onClose: () => void;
    options: AutocompleteOption[];
    values: AutocompleteOption[];
    pendingValuesRef: MutableRefObject<AutocompleteOption[]>;
  }
>(({ optionsByParent, onClose, values, options, pendingValuesRef }, ref) => {
  const classes = useStyles();
  const { getValueColor } = useMultiFilterContext();

  const [inputValue, setInputValue] = useState("");
  const [pendingValues, setPendingValues] = useState<AutocompleteOption[]>(
    () => values
  );
  pendingValuesRef.current = pendingValues;
  const handleSelect = useEvent((ev, newValues: AutocompleteOption[]) => {
    setPendingValues(newValues);
  });

  const pendingValuesByParent = useMemo(() => {
    return groupBy(pendingValues, groupByParent);
  }, [pendingValues]);

  const handleChangeInput: AutocompleteProps<
    HierarchyValue,
    true,
    false,
    false
  >["onInputChange"] = useEvent((ev, value, reason) => {
    if (reason === "input") {
      setInputValue(value);
    }
  });
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

  const handleAutocompleteClose = useEvent((ev, reason) => {
    if (reason === "escape") {
      onClose();
    }
  });

  const renderInput = useCallback(
    (params) => (
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
    ),
    [classes.autocompleteInput, classes.autocompleteInputContainer]
  );

  const renderGroup = useCallback(
    (params) => {
      return (
        <>
          {params.group ? (
            <ListSubheader className={classes.listSubheader} key={params.key}>
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
    },
    [classes.listSubheader, handleClickGroup, hasSelectedAllGroup]
  );

  const renderOption = useCallback(
    (props, option, { selected }) => {
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
    },
    [classes.optionColor, getValueColor]
  );
  return (
    <div className={classes.autocompleteMenuContent} ref={ref}>
      <Box className={classes.autocompleteHeader}>
        <Typography variant="h5">Select values to be displayed</Typography>
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
        renderGroup={renderGroup}
        options={options}
        groupBy={groupByParent}
        disableCloseOnSelect
        isOptionEqualToValue={isDimensionOptionEqualToDimensionValue}
        renderOption={renderOption}
        renderInput={renderInput}
        onInputChange={handleChangeInput}
        inputValue={inputValue}
      />
      <Box className={classes.autocompleteApplyButtonContainer}>
        <Button
          size="large"
          className={classes.autocompleteApplyButton}
          fullWidth
          onClick={onClose}
        >
          Apply
        </Button>
      </Box>
    </div>
  );
});

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
