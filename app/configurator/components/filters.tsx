import { t, Trans } from "@lingui/macro";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  ClickAwayListener,
  Divider,
  FormControlLabel,
  IconButton,
  Input,
  InputAdornment,
  SelectChangeEvent,
  Switch,
  Theme,
  Tooltip,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { makeStyles } from "@mui/styles";
import { ascending, groups, max } from "d3";
import get from "lodash/get";
import groupBy from "lodash/groupBy";
import keyBy from "lodash/keyBy";
import orderBy from "lodash/orderBy";
import sortBy from "lodash/sortBy";
import uniqBy from "lodash/uniqBy";
import React, {
  forwardRef,
  MouseEventHandler,
  MutableRefObject,
  ReactNode,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";

import { makeGetClosestDatesFromDateRange } from "@/charts/shared/brush/utils";
import { useFootnotesStyles } from "@/components/chart-footnotes";
import Flex from "@/components/flex";
import { Select } from "@/components/form";
import { Loading } from "@/components/hint";
import {
  getFilterValue,
  isConfiguring,
  MultiFilterContextProvider,
  useConfiguratorState,
  useMultiFilterContext,
} from "@/configurator";
import { ConfiguratorDrawer } from "@/configurator/components/drawer";
import {
  MultiFilterFieldColorPicker,
  SingleFilterField,
} from "@/configurator/components/field";
import {
  canRenderDatePickerField,
  DatePickerField,
} from "@/configurator/components/field-date-picker";
import { EditorIntervalBrush } from "@/configurator/interactive-filters/editor-time-interval-brush";
import { useTimeFormatLocale, useTimeFormatUnit } from "@/formatters";
import {
  DimensionMetadataFragment,
  Maybe,
  useDimensionHierarchyQuery,
  useDimensionValuesQuery,
  useTemporalDimensionValuesQuery,
} from "@/graphql/query-hooks";
import { HierarchyValue } from "@/graphql/resolver-types";
import { Icon } from "@/icons";
import SvgIcCheck from "@/icons/components/IcCheck";
import SvgIcChevronRight from "@/icons/components/IcChevronRight";
import SvgIcClose from "@/icons/components/IcClose";
import SvgIcFormatting from "@/icons/components/IcFormatting";
import SvgIcRefresh from "@/icons/components/IcRefresh";
import { getTimeInterval } from "@/intervals";
import { useLocale } from "@/locales/use-locale";
import {
  getOptionsFromTree,
  joinParents,
  pruneTree,
  sortHierarchy,
} from "@/rdf/tree-utils";
import { valueComparator } from "@/utils/sorting-values";
import useEvent from "@/utils/use-event";

import { ConfiguratorState, GenericSegmentField } from "../../config-types";
import { interlace } from "../../utils/interlace";
import { useInteractiveFiltersToggle } from "../interactive-filters/interactive-filters-config-state";

import { ControlSectionSkeleton } from "./chart-controls/section";

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
    textInput: {
      margin: `${theme.spacing(4)} 0px`,
      padding: "0px 12px",
      width: "100%",
      height: 40,
      minHeight: 40,
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
      marginTop: "0.375rem",
      marginRight: "0.5rem",
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
    selectedValueRow: {
      display: "flex",
      alignItems: "flex-start",
      marginBottom: "0.5rem",
      gap: "0.5rem",
    },
  };
});

const explodeParents = (parents: string) => {
  return parents ? parents.split(" > ") : [];
};

const groupByParent = (node: { parents: HierarchyValue[] }) => {
  return joinParents(node?.parents);
};

const getColorConfig = (
  config: ConfiguratorState,
  colorConfigPath: string | undefined
) => {
  if (!config.activeField) {
    return;
  }

  const path = colorConfigPath
    ? [config.activeField, colorConfigPath]
    : [config.activeField];

  return get(config.chartConfig.fields, path) as
    | GenericSegmentField
    | undefined;
};

const FilterControls = ({
  selectAll,
  selectNone,
  allKeysLength,
  activeKeysLength,
}: {
  selectAll: () => void;
  selectNone: () => void;
  allKeysLength: number;
  activeKeysLength: number;
}) => {
  const classes = useFootnotesStyles({ useMarginTop: false });

  return (
    <Box className={classes.actions}>
      <Button
        onClick={selectAll}
        variant="inline"
        disabled={activeKeysLength === allKeysLength}
      >
        <Trans id="controls.filter.select.all">Select all</Trans>
      </Button>
      <Button
        onClick={selectNone}
        variant="inline"
        disabled={activeKeysLength === 0}
      >
        <Trans id="controls.filter.select.none">Select none</Trans>
      </Button>
    </Box>
  );
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
  const { dimensionIri, activeKeys, allValues, colorConfigPath } =
    useMultiFilterContext();
  const rawValues = config.chartConfig.filters[dimensionIri];

  const classes = useStyles();

  const { sortedTree, flatOptions, optionsByValue } = useMemo(() => {
    const sortedTree = sortHierarchy(tree);
    const flatOptions = getOptionsFromTree(sortedTree);
    const optionsByValue = keyBy(flatOptions, (x) => x.value);
    return {
      sortedTree,
      flatOptions,
      optionsByValue,
    };
  }, [tree]);

  const { values, valueGroups } = useMemo(() => {
    const values = (
      (rawValues?.type === "multi" && Object.keys(rawValues.values)) ||
      Object.keys(optionsByValue)
    )
      .map((v) => optionsByValue[v])
      .filter(isHierarchyOptionSelectable);
    const grouped = groups(values, groupByParent)
      .sort((a, b) =>
        a[0].length === 0
          ? 1
          : ascending(
              explodeParents(a[0]).length,
              explodeParents(b[0]).length
            ) || ascending(a[0], b[0])
      )
      .map(([parent, group]) => {
        return [
          parent,
          orderBy(group, ["position", "identifier", "label"]),
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
  const pendingValuesRef = useRef<HierarchyValue[]>([]);
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

  const colorConfig = useMemo(() => {
    return getColorConfig(config, colorConfigPath);
  }, [config, colorConfigPath]);

  const hasColorMapping = useMemo(() => {
    return (
      !!colorConfig?.colorMapping &&
      (colorComponent !== undefined
        ? dimensionIri === colorComponent.iri
        : true)
    );
  }, [colorConfig?.colorMapping, dimensionIri, colorComponent]);

  const interactiveFilterProps = useInteractiveFiltersToggle("legend");

  return (
    <Box sx={{ position: "relative" }}>
      <Box mb={4}>
        <Box sx={{ justifyContent: "space-between", display: "flex" }}>
          {config.activeField === "segment" ? (
            <FormControlLabel
              componentsProps={{ typography: { variant: "caption" } }}
              control={<Switch {...interactiveFilterProps} />}
              label={
                <Tooltip
                  enterDelay={600}
                  title={
                    <span>
                      <Trans id="controls.filters.interactive.tooltip">
                        Allow users to change filters
                      </Trans>
                    </span>
                  }
                >
                  <Trans id="controls.filters.interactive.toggle">
                    Interactive
                  </Trans>
                </Tooltip>
              }
            />
          ) : null}
          <Button
            variant="contained"
            size="small"
            color="primary"
            onClick={handleOpenAutocomplete}
            sx={{ justifyContent: "center", mb: 2 }}
          >
            <Trans id="controls.set-filters">Edit filters</Trans>
          </Button>
        </Box>
        <Divider sx={{ mt: "0.5rem", mb: "0.7rem" }} />
        <Flex justifyContent="space-between">
          <Typography variant="h5">
            <Trans id="controls.filters.select.selected-filters">
              Selected filters
            </Trans>
            {hasColorMapping ? (
              colorConfig?.palette === "dimension" ? (
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
              {interlace(explodeParents(parentLabel), (i) => (
                <BreadcrumbChevron key={i} />
              ))}
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
      <ConfiguratorDrawer open={!!anchorEl} hideBackdrop>
        <ClickAwayListener onClickAway={handleCloseAutocomplete}>
          <DrawerContent
            pendingValuesRef={pendingValuesRef}
            options={sortedTree}
            flatOptions={flatOptions}
            onClose={handleCloseAutocomplete}
            values={values}
            hasColorMapping={hasColorMapping}
          />
        </ClickAwayListener>
      </ConfiguratorDrawer>
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

const StyledAccordion = styled(Accordion)({
  boxShadow: "none",
  minHeight: 0,

  "&:before": {
    display: "none",
  },
  "&.Mui-expanded": {
    minHeight: 0,
  },
});

const TreeAccordionSummary = styled(AccordionSummary)(({ theme }) => ({
  minHeight: 0,
  transition: "background-color 0.1s ease",
  paddingLeft: "0.25rem",
  paddingRight: "1rem",

  "&.Mui-expanded": {
    minHeight: 0,
  },
  "& > .MuiAccordionSummary-content": {
    alignItems: "center",
    marginTop: 0,
    marginBottom: 0,
    minHeight: 32,
  },
  "&:hover": {
    backgroundColor: theme.palette.primary.light,
  },
}));

const TreeAccordionDetails = styled(AccordionDetails)(() => ({
  padding: 0,
}));

const TreeAccordion = ({
  flat,
  depth,
  value,
  label,
  state,
  selectable,
  expandable,
  renderExpandButton,
  renderColorCheckbox,
  onSelect,
  children,
}: {
  flat?: boolean;
  depth: number;
  value: string;
  label: string;
  state: "SELECTED" | "CHILDREN_SELECTED" | "NOT_SELECTED";
  selectable: boolean;
  expandable: boolean;
  renderExpandButton: boolean;
  renderColorCheckbox: boolean;
  onSelect: () => void;
  children?: ReactNode;
}) => {
  const classes = useStyles();
  const { getValueColor } = useMultiFilterContext();
  const [expanded, setExpanded] = useState(() => (depth === 0 ? true : false));

  const paddingLeft = flat ? "1rem" : `${(depth + 1) * 8}px`;

  return (
    <StyledAccordion
      expanded={expanded}
      disableGutters
      TransitionProps={{ unmountOnExit: true }}
    >
      <TreeAccordionSummary
        sx={{ paddingLeft }}
        onClick={(e) => {
          e.stopPropagation();
          if (selectable) {
            onSelect();
          }
        }}
      >
        {renderExpandButton && (
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            sx={{
              alignSelf: "flex-start",
              visibility: expandable ? "visible" : "hidden",
              mt: 1,
              p: 1,
              ml: 2,
            }}
          >
            <Icon name={expanded ? "chevronDown" : "chevronRight"} size={16} />
          </IconButton>
        )}

        {renderColorCheckbox && (
          <div
            className={classes.optionColor}
            style={{
              visibility: selectable ? "visible" : "hidden",
              backgroundColor:
                state === "SELECTED" ? getValueColor(value) : "transparent",
            }}
          />
        )}

        <Typography variant="body2" className={classes.optionLabel}>
          {label}
        </Typography>

        <Icon
          name={
            state === "SELECTED"
              ? "check"
              : state === "CHILDREN_SELECTED"
              ? "indeterminate"
              : "eye"
          }
          className={classes.optionCheck}
          style={{
            visibility: state === "NOT_SELECTED" ? "hidden" : "visible",
            marginTop: 8,
          }}
        />
      </TreeAccordionSummary>
      {children && <TreeAccordionDetails>{children}</TreeAccordionDetails>}
    </StyledAccordion>
  );
};

const validateChildren = (
  d: Maybe<HierarchyValue[]> | undefined
): d is HierarchyValue[] => {
  return Array.isArray(d) && d.length > 0;
};

const areChildrenSelected = ({
  children,
  selectedValues,
}: {
  children: Maybe<HierarchyValue[]> | undefined;
  selectedValues: HierarchyValue[];
}): boolean => {
  if (validateChildren(children)) {
    const values = children.map((d) => d.value);
    if (selectedValues.some((d) => values.includes(d.value))) {
      return true;
    } else {
      return children
        .map((d) =>
          areChildrenSelected({ children: d.children, selectedValues })
        )
        .some((d) => d === true);
    }
  } else {
    return false;
  }
};

const isHierarchyOptionSelectable = (d: HierarchyValue) => {
  return d.hasValue !== undefined ? Boolean(d.hasValue) : true;
};

const Tree = ({
  flat,
  depthsMetadata,
  options,
  selectedValues,
  showColors,
  onSelect,
}: {
  flat: boolean;
  depthsMetadata: Record<number, { selectable: boolean; expandable: boolean }>;
  options: HierarchyValue[];
  selectedValues: HierarchyValue[];
  showColors: boolean;
  onSelect: (newSelectedValues: HierarchyValue[]) => void;
}) => {
  return (
    <>
      {options.map((d) => {
        const { depth, value, label, children } = d;
        const currentDepthsMetadata = depthsMetadata[depth];
        const hasChildren = validateChildren(children);
        const state = selectedValues.map((d) => d.value).includes(value)
          ? "SELECTED"
          : areChildrenSelected({ children, selectedValues })
          ? "CHILDREN_SELECTED"
          : "NOT_SELECTED";

        return (
          <TreeAccordion
            key={value}
            flat={flat}
            depth={depth}
            value={value}
            label={label}
            state={state}
            // Has value is only present for hierarchies.
            selectable={isHierarchyOptionSelectable(d)}
            expandable={hasChildren}
            renderExpandButton={currentDepthsMetadata.expandable || depth > 0}
            renderColorCheckbox={
              showColors && (currentDepthsMetadata.selectable || d.depth === -1)
            }
            onSelect={() => {
              if (state === "SELECTED") {
                onSelect(selectedValues.filter((d) => d.value !== value));
              } else {
                onSelect([...selectedValues, d]);
              }
            }}
          >
            {hasChildren ? (
              <Tree
                flat={flat}
                depthsMetadata={depthsMetadata}
                options={children as HierarchyValue[]}
                selectedValues={selectedValues}
                showColors={showColors}
                onSelect={onSelect}
              />
            ) : null}
          </TreeAccordion>
        );
      })}
    </>
  );
};

const DrawerContent = forwardRef<
  HTMLDivElement,
  {
    onClose: () => void;
    options: HierarchyValue[];
    flatOptions: HierarchyValue[];
    values: HierarchyValue[];
    pendingValuesRef: MutableRefObject<HierarchyValue[]>;
    hasColorMapping: boolean;
  }
>((props, ref) => {
  const {
    onClose,
    options,
    flatOptions,
    values,
    pendingValuesRef,
    hasColorMapping,
  } = props;
  const classes = useStyles();
  const [textInput, setTextInput] = useState("");
  const [pendingValues, setPendingValues] = useState<HierarchyValue[]>(() =>
    // Do not set unselectable options
    values.filter(isHierarchyOptionSelectable)
  );
  pendingValuesRef.current = pendingValues;

  const { depthsMetadata, uniqueSelectableFlatOptions } = useMemo(() => {
    const uniqueSelectableFlatOptions = uniqBy(
      flatOptions.filter(isHierarchyOptionSelectable),
      (d) => d.value
    );

    const depthsMetadata = flatOptions.reduce((acc, d) => {
      if (!acc[d.depth]) {
        acc[d.depth] = { selectable: false, expandable: false };
      }

      if (acc[d.depth].selectable === false && d.hasValue) {
        acc[d.depth].selectable = true;
      }

      if (
        acc[d.depth].expandable === false &&
        d.children &&
        d.children.length > 0
      ) {
        acc[d.depth].expandable = true;
      }

      return acc;
    }, {} as Record<number, { selectable: boolean; expandable: boolean }>);

    const maxDepth = max(flatOptions, (d) => d.depth);

    // Expand last level by default, so it's aligned correctly.
    if (maxDepth && maxDepth > 0) {
      depthsMetadata[maxDepth].expandable = true;
    }

    return { depthsMetadata, uniqueSelectableFlatOptions };
  }, [flatOptions]);

  const filteredOptions = useMemo(() => {
    return pruneTree(options, (d) =>
      d.label.toLowerCase().includes(textInput.toLowerCase())
    );
  }, [textInput, options]);

  return (
    <div
      className={classes.autocompleteMenuContent}
      ref={ref}
      data-testid="edition-filters-drawer"
    >
      <Box className={classes.autocompleteHeader}>
        <Flex alignItems="center" justifyContent="space-between">
          <Flex alignItems="center" gap="0.25rem" mb={3}>
            <Icon name="filter" size={16} />
            <Typography variant="h5">
              <Trans id="controls.set-filters">Edit filters</Trans>
            </Typography>
          </Flex>
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
        <Input
          className={classes.textInput}
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder={t({ id: "select.controls.filters.search" })}
          startAdornment={
            <InputAdornment position="start">
              <Icon name="search" size={16} />
            </InputAdornment>
          }
          sx={{ typography: "body2" }}
        />
        <FilterControls
          selectAll={() => setPendingValues(uniqueSelectableFlatOptions)}
          selectNone={() => setPendingValues([])}
          allKeysLength={uniqueSelectableFlatOptions.length}
          activeKeysLength={pendingValues.length}
        />
      </Box>
      <Tree
        flat={Object.keys(depthsMetadata).length === 1}
        depthsMetadata={depthsMetadata}
        options={filteredOptions}
        selectedValues={pendingValues}
        showColors={hasColorMapping}
        onSelect={(newValues: HierarchyValue[]) => setPendingValues(newValues)}
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
          // FIXME: types
          // @ts-ignore
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
  const temporalDimension =
    dimension?.__typename === "TemporalDimension" ? dimension : null;
  const activeFilter = getFilterValue(state, temporalDimension?.iri ?? "");
  const rangeActiveFilter =
    activeFilter?.type === "range" ? activeFilter : null;

  const onChangeFrom = useEvent((e: SelectChangeEvent<unknown>) => {
    if (rangeActiveFilter) {
      const from = e.target.value as string;
      setFilterRange([from, rangeActiveFilter.to]);
    }
  });

  const onChangeTo = useEvent((e: SelectChangeEvent<unknown>) => {
    if (rangeActiveFilter) {
      const to = e.target.value as string;
      setFilterRange([rangeActiveFilter.from, to]);
    }
  });

  const { sortedOptions, sortedValues } = useMemo(() => {
    if (temporalDimension) {
      const { timeFormat, timeUnit } = temporalDimension;
      const parse = formatLocale.parse(timeFormat);
      const sortedOptions = temporalDimension.values
        .map(({ value }) => {
          const date = parse(`${value}`) as Date;

          return {
            value,
            label: timeFormatUnit(date, timeUnit),
            date,
          };
        })
        .sort((a, b) => a.date.getTime() - b.date.getTime());

      return {
        sortedOptions,
        sortedValues: sortedOptions.map((d) => d.value),
      };
    }

    return {
      sortedOptions: [],
      sortedValues: [],
    };
  }, [temporalDimension, formatLocale, timeFormatUnit]);

  const getClosestDatesFromDateRange = React.useCallback(
    (from: Date, to: Date) => {
      const getClosestDatesFromDateRange = makeGetClosestDatesFromDateRange(
        sortedOptions,
        (d) => d.date
      );

      return getClosestDatesFromDateRange(from, to);
    },
    [sortedOptions]
  );

  if (temporalDimension && state.state === "CONFIGURING_CHART") {
    const { timeUnit, timeFormat } = temporalDimension;
    const timeInterval = getTimeInterval(timeUnit);

    const parse = formatLocale.parse(timeFormat);
    const formatDateValue = formatLocale.format(timeFormat);

    const from = sortedOptions[0].date;
    const to = sortedOptions[sortedOptions.length - 1].date;

    if (!from || !to) {
      return null;
    }

    const timeRange = rangeActiveFilter
      ? [
          parse(rangeActiveFilter.from) as Date,
          parse(rangeActiveFilter.to) as Date,
        ]
      : [from, to];

    const fromOptions = sortedOptions.filter(({ date }) => {
      return date <= timeRange[1];
    });

    const toOptions = sortedOptions.filter(({ date }) => {
      return date >= timeRange[0];
    });

    return (
      <Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          {rangeActiveFilter && (
            <>
              {canRenderDatePickerField(timeUnit) ? (
                <DatePickerField
                  name="time-range-start"
                  label={t({
                    id: "controls.filters.select.from",
                    message: "From",
                  })}
                  value={timeRange[0]}
                  // @ts-ignore
                  onChange={onChangeFrom}
                  isDateDisabled={(date) => {
                    return (
                      date > timeRange[1] ||
                      !sortedValues.includes(formatDateValue(date))
                    );
                  }}
                  timeUnit={timeUnit}
                  dateFormat={formatDateValue}
                  minDate={from}
                  maxDate={to}
                />
              ) : (
                <Select
                  id="time-range-start"
                  label={t({
                    id: "controls.filters.select.from",
                    message: "From",
                  })}
                  options={fromOptions}
                  sortOptions={false}
                  value={rangeActiveFilter.from}
                  onChange={onChangeFrom}
                />
              )}

              {canRenderDatePickerField(timeUnit) ? (
                <DatePickerField
                  name="time-range-end"
                  label={t({
                    id: "controls.filters.select.to",
                    message: "To",
                  })}
                  value={timeRange[1]}
                  // @ts-ignore
                  onChange={onChangeTo}
                  isDateDisabled={(date) => {
                    return (
                      date < timeRange[0] ||
                      !sortedValues.includes(formatDateValue(date))
                    );
                  }}
                  timeUnit={timeUnit}
                  dateFormat={formatDateValue}
                  minDate={from}
                  maxDate={to}
                />
              ) : (
                <Select
                  id="time-range-end"
                  label={t({ id: "controls.filters.select.to", message: "To" })}
                  options={toOptions}
                  sortOptions={false}
                  value={rangeActiveFilter.to}
                  onChange={onChangeTo}
                />
              )}
            </>
          )}
        </Box>
        <EditorIntervalBrush
          timeExtent={[from, to]}
          timeRange={timeRange}
          timeInterval={timeInterval}
          timeUnit={timeUnit}
          onChange={([from, to]) => {
            const [closestFrom, closestTo] = getClosestDatesFromDateRange(
              from,
              to
            );

            setFilterRange([
              formatDateValue(closestFrom),
              formatDateValue(closestTo),
            ]);
          }}
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
    const values = dimension?.values ?? [];

    return [...values].sort(valueComparator(locale));
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
              value={`${dv.value}`}
            />
          );
        })}
      </>
    );
  } else {
    return <Loading />;
  }
};
