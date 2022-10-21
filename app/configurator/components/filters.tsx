import { t, Trans } from "@lingui/macro";
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
  Autocomplete,
  Divider,
  Drawer as MuiDrawer,
  Theme,
  IconButton,
  Tooltip,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { makeStyles } from "@mui/styles";
import { ascending, groups } from "d3";
import get from "lodash/get";
import groupBy from "lodash/groupBy";
import keyBy from "lodash/keyBy";
import sortBy from "lodash/sortBy";
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
  DimensionMetadataFragment,
  useDimensionHierarchyQuery,
  useDimensionValuesQuery,
  useTemporalDimensionValuesQuery,
} from "@/graphql/query-hooks";
import { HierarchyValue } from "@/graphql/resolver-types";
import SvgIcCheck from "@/icons/components/IcCheck";
import SvgIcChevronRight from "@/icons/components/IcChevronRight";
import SvgIcClose from "@/icons/components/IcClose";
import SvgIcFormatting from "@/icons/components/IcFormatting";
import SvgIcRefresh from "@/icons/components/IcRefresh";
import SvgIcSearch from "@/icons/components/IcSearch";
import { useLocale } from "@/locales/use-locale";
import { dfs } from "@/utils/dfs";
import { valueComparator } from "@/utils/sorting-values";
import useEvent from "@/utils/use-event";

import { interlace } from "../../utils/interlace";
import { ColorMapping, ConfiguratorState } from "../config-types";

import { ControlSectionSkeleton } from "./chart-controls/section";

const Drawer = styled(MuiDrawer)(({ theme }) => ({
  "& > .MuiPaper-root": {
    top: 152,
    bottom: 0,
    height: "auto",
    borderLeft: `1px ${theme.palette.divider} solid`,
    borderTop: `1px ${theme.palette.divider} solid`,
  },
}));

const useStyles = makeStyles((theme: Theme) => {
  return {
    autocompleteMenuContent: {
      "--mx": "1rem",
      "--colorBoxSize": "1.25rem",
      "--columnGap": "0.75rem",
      width: 320,
    },
    autocompleteHeader: {
      margin: "1rem var(--mx)",
    },
    autocompleteInputContainer: {
      margin: "0 var(--mx) 0rem",
      paddingBottom: "1rem",
      borderBottom: `1px solid ${theme.palette.divider}`,
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
      borderRadius: "4px",
      width: "var(--colorBoxSize)",
      height: "var(--colorBoxSize)",
      flexShrink: 0,
      boxSizing: "border-box",
      border: `1px solid ${theme.palette.divider}`,
      transition: "background-color 0.125s ease-out",
      alignSelf: "flex-start",
      marginTop: "0.125rem",
    },
    optionLabel: {
      flexGrow: 1,
    },
    optionCheck: {
      width: 16,
      height: 16,
      flexShrink: 0,
      alignSelf: "flex-start",
      marginTop: "0.125rem",
    },
    listSubheader: {
      minHeight: "3rem",
      padding: "0.5rem 0rem",
      margin: "0.5rem 1rem",
      alignItems: "center",
      gridTemplateRows: "auto min-content",
      border: `1px solid ${theme.palette.divider}`,
      borderWidth: "1px 0 1px 0",
      "& button": {
        padding: 0,
        minHeight: "auto",
      },

      "&:before, &:after": {
        display: "block",
        content: "' '",
      },
    },
    selectedValueRow: {
      display: "flex",
      alignItems: "flex-start",
      marginBottom: "0.5rem",
      gap: "0.5rem",
    },
  };
});

const AutocompletePopperStyled = styled("div")(({ theme }) => ({
  // The autocomplete styles the Popper and sets its width
  // to its anchorEl width via the style attribute
  // Since we cannot override the style attribute through
  // componentsProps.popper yet, we have to use !important
  // here
  width: "100% !important",
  [`& .${autocompleteClasses.paper}`]: {
    boxShadow: "none",
    margin: 0,
    color: "inherit",
    fontSize: theme.typography.body2.fontSize,
    padding: 0,
  },
  [`& .${autocompleteClasses.listbox}`]: {
    maxHeight: "max-content",
    [`& .${autocompleteClasses.option}`]: {
      display: "flex",
      minHeight: "auto",
      alignItems: "center",
      justifyContent: "flex-start",
      gap: "0.5rem",
      padding: "8px 16px",

      '&[aria-selected="true"]': {
        // We can see the selection status via the color box + selected icon
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

const joinParents = (parents?: HierarchyValue[]) => {
  return parents?.map((x) => x.label).join(" > ") || "";
};

const explodeParents = (parents: string) => {
  return parents ? parents.split(" > ") : [];
};

const AutocompletePopper: AutocompleteProps<
  unknown,
  true,
  true,
  true
>["PopperComponent"] = ({ disablePortal, anchorEl, open, ...rest }) => {
  return <AutocompletePopperStyled {...rest} />;
};

const groupByParent = (node: { parents: HierarchyValue[] }) => {
  return joinParents(node?.parents);
};

const isDimensionOptionEqualToDimensionValue = (
  option: HierarchyValue,
  value: HierarchyValue
) => {
  return option.value === value?.value;
};

const getOptionsFromTree = (tree: HierarchyValue[]) => {
  return sortBy(
    dfs(tree, (node, { parents }) => ({
      ...node,
      parents,
    })),
    (node) => joinParents(node.parents)
  );
};

type AutocompleteOption = ReturnType<typeof getOptionsFromTree>[number];

const getColorMapping = (
  config: ConfiguratorState,
  colorConfigPath: string | undefined
) => {
  if (!config.activeField) {
    return;
  }

  const colorMappingPath = `${config.activeField}.${
    colorConfigPath ? `${colorConfigPath}.` : ""
  }colorMapping`;

  return get(config.chartConfig.fields, colorMappingPath) as
    | ColorMapping
    | undefined;
};

const MultiFilterContent = ({
  field,
  colorComponent,
  tree,
}: {
  field: string;
  colorComponent: DimensionMetadataFragment | undefined;
  tree: HierarchyValue[];
}) => {
  const [config, dispatch] = useConfiguratorState(isConfiguring);
  const { activeKeys, allValues, colorConfigPath, dimensionIri } =
    useMultiFilterContext();
  const rawValues = config.chartConfig.filters[dimensionIri];

  const classes = useStyles();

  const { selectAll, selectNone } = useDimensionSelection(dimensionIri);

  const { options, optionsByValue, optionsByParent } = useMemo(() => {
    const flat = getOptionsFromTree(tree);
    const optionsByValue = keyBy(flat, (x) => x.value);
    const optionsByParent = groupBy(flat, groupByParent);
    return {
      options: sortBy(flat, [groupByParent, (x) => x.label]),
      optionsByValue,
      optionsByParent,
    };
  }, [tree]);

  const { values, valueGroups } = useMemo(() => {
    const values = (
      (rawValues?.type === "multi" && Object.keys(rawValues.values)) ||
      Object.keys(optionsByValue)
    ).map((v) => optionsByValue[v]);
    const grouped = groups(values, groupByParent)
      .sort(
        (a, b) =>
          ascending(explodeParents(a[0]).length, explodeParents(b[0]).length) ||
          ascending(a[0], b[0])
      )
      .map(([parent, group]) => {
        return [
          parent,
          group.sort(
            (a, b) =>
              ascending(a.position ?? 0, b.position ?? 0) ||
              ascending(a.label, b.label)
          ),
        ] as const;
      });
    return {
      values,
      valueGroups: grouped,
      valuesByParent: groupBy(values, groupByParent),
    };
  }, [optionsByValue, rawValues]);

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

  const handleUpdateColorMapping = useEvent(
    ({
      type,
    }: {
      type: /** Goes back to original color mapping. */
      | "reset"
        /** Shuffles colors to create new, randomized color mapping. */
        | "shuffle";
    }) => {
      const values = colorComponent?.values || [];

      switch (type) {
        case "reset":
          return dispatch({
            type: "CHART_CONFIG_UPDATE_COLOR_MAPPING",
            value: {
              field,
              colorConfigPath,
              dimensionIri,
              values,
              random: false,
            },
          });
        case "shuffle":
          const usedValues = new Set(values.map((v) => v.value));
          return dispatch({
            type: "CHART_CONFIG_UPDATE_COLOR_MAPPING",
            value: {
              field,
              colorConfigPath,
              dimensionIri,
              values: sortBy(values, (d) => (usedValues.has(d.value) ? 0 : 1)),
              random: true,
            },
          });
      }
    }
  );

  const hasColorMapping = useMemo(() => {
    return (
      !!getColorMapping(config, colorConfigPath) &&
      (colorComponent !== undefined
        ? dimensionIri === colorComponent.iri
        : true)
    );
  }, [colorConfigPath, config, dimensionIri, colorComponent]);

  const hasDefaultColors = useMemo(() => {
    return colorComponent?.values?.[0].color !== undefined;
  }, [colorComponent?.values]);

  return (
    <Box sx={{ position: "relative" }}>
      <Box mb={4}>
        <Flex justifyContent="space-between" gap="0.75rem">
          <Flex gap="0.75rem">
            <Button
              onClick={selectAll}
              variant="inline"
              disabled={activeKeys.size === allValues.length}
            >
              <Trans id="controls.filter.select.all">Select all</Trans>
            </Button>
            <Button
              onClick={selectNone}
              variant="inline"
              disabled={activeKeys.size === 0}
            >
              <Trans id="controls.filter.select.none">Select none</Trans>
            </Button>
          </Flex>
          <div>
            <Button
              variant="contained"
              size="small"
              color="primary"
              onClick={handleOpenAutocomplete}
            >
              <Trans id="controls.filters.select.filters">Filters</Trans>
            </Button>
          </div>
        </Flex>
        <Divider sx={{ mt: "0.5rem", mb: "0.7rem" }} />
        <Flex justifyContent="space-between">
          <Typography variant="h5">
            <Trans id="controls.filters.select.selected-filters">
              Selected filters
            </Trans>
            {hasColorMapping ? (
              hasDefaultColors ? (
                <Tooltip
                  title={
                    <Trans id="controls.filters.select.reset-colors">
                      Reset colors
                    </Trans>
                  }
                >
                  <IconButton
                    sx={{ ml: 1, my: -2 }}
                    size="small"
                    onClick={() => handleUpdateColorMapping({ type: "reset" })}
                  >
                    <SvgIcRefresh fontSize="inherit" />
                  </IconButton>
                </Tooltip>
              ) : (
                <Tooltip
                  title={
                    <Trans id="controls.filters.select.refresh-colors">
                      Refresh colors
                    </Trans>
                  }
                >
                  <IconButton
                    sx={{ ml: 1, my: -2 }}
                    size="small"
                    onClick={() =>
                      handleUpdateColorMapping({ type: "shuffle" })
                    }
                  >
                    <SvgIcFormatting fontSize="inherit" />
                  </IconButton>
                </Tooltip>
              )
            ) : null}
          </Typography>
          <Typography variant="body2" component="span">
            <Trans id="controls.filter.nb-elements">
              {activeKeys.size} of {allValues.length}
            </Trans>
          </Typography>
        </Flex>

        <Divider sx={{ my: "0.75rem" }} />
      </Box>

      {valueGroups.map(([parentLabel, children]) => {
        return (
          <Box sx={{ mb: 4 }} key={parentLabel}>
            <Typography variant="h5" sx={{ mb: 3 }}>
              {interlace(explodeParents(parentLabel), <BreadcrumbChevron />)}
            </Typography>
            {children.map((v) => {
              return (
                <Flex
                  key={v.value}
                  className={classes.selectedValueRow}
                  data-testid="chart-filters-value"
                >
                  {hasColorMapping ? (
                    <MultiFilterFieldColorPicker value={v.value} />
                  ) : null}
                  <Typography variant="body2" sx={{ flexGrow: 1 }}>
                    {v?.label}
                  </Typography>
                  {hasColorMapping ? null : <SvgIcCheck />}
                </Flex>
              );
            })}
          </Box>
        );
      })}
      <Drawer anchor="right" open={!!anchorEl} hideBackdrop>
        <ClickAwayListener onClickAway={handleCloseAutocomplete}>
          <DrawerContent
            pendingValuesRef={pendingValuesRef}
            options={options}
            optionsByParent={optionsByParent}
            onClose={handleCloseAutocomplete}
            values={values}
            hasColorMapping={hasColorMapping}
          />
        </ClickAwayListener>
      </Drawer>
    </Box>
  );
};

const useBreadcrumbStyles = makeStyles({
  root: {
    display: "inline",
    top: 2,
    position: "relative",
  },
});

const BreadcrumbChevron = () => {
  const classes = useBreadcrumbStyles();
  return <SvgIcChevronRight className={classes.root} />;
};

const DrawerContent = forwardRef<
  HTMLDivElement,
  {
    optionsByParent: Record<string, AutocompleteOption[]>;
    onClose: () => void;
    options: AutocompleteOption[];
    values: AutocompleteOption[];
    pendingValuesRef: MutableRefObject<AutocompleteOption[]>;
    hasColorMapping: boolean;
  }
>((props, ref) => {
  const {
    optionsByParent,
    onClose,
    values,
    options,
    pendingValuesRef,
    hasColorMapping,
  } = props;
  const classes = useStyles();
  const { getValueColor } = useMultiFilterContext();

  const [inputValue, setInputValue] = useState("");
  const [pendingValues, setPendingValues] = useState<AutocompleteOption[]>(
    () => values
  );
  pendingValuesRef.current = pendingValues;
  const handleSelect = useEvent((_, newValues: AutocompleteOption[]) => {
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
  >["onInputChange"] = useEvent((_, value, reason) => {
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

  const handleSelectGroup = useEvent((groupLabel: string) => {
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

  const handleAutocompleteClose = useEvent((_, reason) => {
    if (reason === "escape") {
      onClose();
    }
  });

  const renderInput = useCallback(
    (params) => (
      <Box className={classes.autocompleteInputContainer}>
        <Input
          size="small"
          className={classes.autocompleteInput}
          startAdornment={
            <InputAdornment position="start">
              <SvgIcSearch />
            </InputAdornment>
          }
          ref={params.InputProps.ref}
          inputProps={params.inputProps}
          autoFocus
          placeholder={t({
            id: "select.controls.filters.search",
            message: "Search",
          })}
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
              <div>
                {interlace(explodeParents(params.group), <BreadcrumbChevron />)}
              </div>
              <Button
                variant="text"
                onClick={() => handleSelectGroup(params.group)}
              >
                {hasSelectedAllGroup(params.group) ? (
                  <Trans id="controls.filter.select.none">Select none</Trans>
                ) : (
                  <Trans id="controls.filter.select.all">Select all</Trans>
                )}
              </Button>
            </ListSubheader>
          ) : null}
          {params.children}
        </>
      );
    },
    [classes.listSubheader, handleSelectGroup, hasSelectedAllGroup]
  );

  const renderOption = useCallback(
    (props, option, { selected }) => {
      return (
        <li {...props}>
          {hasColorMapping ? (
            <div
              className={classes.optionColor}
              style={{
                border: "1px solid #ccc",
                backgroundColor: selected
                  ? getValueColor(option.value)
                  : "transparent",
              }}
            />
          ) : null}
          <div className={classes.optionLabel}>{option.label}</div>
          <SvgIcCheck
            className={classes.optionCheck}
            style={{
              visibility: selected ? "visible" : "hidden",
            }}
          />
        </li>
      );
    },
    [
      classes.optionCheck,
      classes.optionColor,
      classes.optionLabel,
      getValueColor,
      hasColorMapping,
    ]
  );
  return (
    <div
      className={classes.autocompleteMenuContent}
      ref={ref}
      data-testid="edition-filters-drawer"
    >
      <Box className={classes.autocompleteHeader}>
        <Flex alignItems="center" justifyContent="space-between">
          <Typography variant="h5" gutterBottom>
            <Trans id="controls.set-filters">Set filters</Trans>
          </Typography>
          <IconButton sx={{ mt: "-0.5rem" }} size="small" onClick={onClose}>
            <SvgIcClose fontSize="inherit" />
          </IconButton>
        </Flex>
        <Typography variant="body2" color="textSecondary">
          <Trans id="controls.set-filters-caption">
            For best results, do not select more than 7 values in the
            visualization.
          </Trans>
        </Typography>
      </Box>
      <Autocomplete
        PopperComponent={AutocompletePopper}
        value={pendingValues}
        multiple
        open
        noOptionsText={t({ id: "No results" })}
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
          size="small"
          className={classes.autocompleteApplyButton}
          fullWidth
          onClick={onClose}
        >
          <Trans id="controls.set-values-apply">Apply filters</Trans>
        </Button>
      </Box>
    </div>
  );
});

const getPathToColorConfigProperty = ({
  field,
  colorConfigPath,
  propertyPath,
}: {
  field: string;
  colorConfigPath?: string;
  propertyPath: string;
}) => {
  return `fields["${field}"].${
    colorConfigPath !== undefined ? `${colorConfigPath}.` : ""
  }${propertyPath}`;
};

export const DimensionValuesMultiFilter = ({
  dataSetIri,
  dimensionIri,
  colorConfigPath,
  colorComponent,
  field = "segment",
}: {
  dataSetIri: string;
  dimensionIri: string;
  colorConfigPath?: string;
  colorComponent?: DimensionMetadataFragment;
  field?: string;
}) => {
  const locale = useLocale();
  const [{ dataSource, chartConfig }] = useConfiguratorState(isConfiguring);

  const [{ data }] = useDimensionValuesQuery({
    variables: {
      dataCubeIri: dataSetIri,
      dimensionIri,
      sourceType: dataSource.type,
      sourceUrl: dataSource.url,
      locale,
    },
  });

  const [{ fetching: fetchingHierarchy, data: hierarchyData }] =
    useDimensionHierarchyQuery({
      variables: {
        cubeIri: dataSetIri,
        dimensionIri,
        sourceType: dataSource.type,
        sourceUrl: dataSource.url,
        locale,
      },
    });

  const hierarchyTree = hierarchyData?.dataCubeByIri?.dimensionByIri?.hierarchy;
  const dimensionData = data?.dataCubeByIri?.dimensionByIri;

  const getValueColor = useEvent((value: string) => {
    const colorPath = getPathToColorConfigProperty({
      field,
      colorConfigPath,
      propertyPath: `colorMapping["${value}"]`,
    });
    return get(chartConfig, colorPath);
  });

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
          field={field}
          colorComponent={colorComponent}
          tree={
            hierarchyTree && hierarchyTree.length > 0
              ? hierarchyTree
              : data.dataCubeByIri.dimensionByIri.values
          }
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
    variables: {
      dimensionIri,
      sourceType: state.dataSource.type,
      sourceUrl: state.dataSource.url,
      locale,
      dataCubeIri: dataSetIri,
    },
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
        <Typography variant="body2">
          {timeFormatUnit(timeRange[0], timeUnit)} –{" "}
          {timeFormatUnit(timeRange[1], timeUnit)}
        </Typography>
        <EditorIntervalBrush
          timeExtent={[from, to]}
          timeRange={timeRange}
          timeInterval={timeInterval}
          timeUnit={timeUnit}
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
  const [state] = useConfiguratorState();
  const [{ data }] = useDimensionValuesQuery({
    variables: {
      dimensionIri,
      sourceType: state.dataSource.type,
      sourceUrl: state.dataSource.url,
      locale,
      dataCubeIri: dataSetIri,
    },
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
