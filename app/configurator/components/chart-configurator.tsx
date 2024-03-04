import { t, Trans } from "@lingui/macro";
import {
  Badge,
  BadgeProps,
  Box,
  Button,
  CircularProgress,
  FormControlLabel,
  FormControlLabelProps,
  IconButton,
  Menu,
  MenuItem,
  Link as MuiLink,
  Switch,
  Theme,
  Tooltip,
  Typography,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import isEmpty from "lodash/isEmpty";
import isEqual from "lodash/isEqual";
import pickBy from "lodash/pickBy";
import sortBy from "lodash/sortBy";
import uniqBy from "lodash/uniqBy";
import Link from "next/link";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  DragDropContext,
  Draggable,
  Droppable,
  OnDragEndResponder,
} from "react-beautiful-dnd";
import { useClient } from "urql";

import { getChartSpec } from "@/charts/chart-config-ui-options";
import { useQueryFilters } from "@/charts/shared/chart-helpers";
import { OpenMetadataPanelWrapper } from "@/components/metadata-panel";
import MoveDragButtons from "@/components/move-drag-buttons";
import useDisclosure from "@/components/use-disclosure";
import {
  ChartConfig,
  ConfiguratorStateConfiguringChart,
  ConfiguratorStatePublishing,
  DataSource,
  Filters,
  getChartConfig,
  getChartConfigFilters,
  isMapConfig,
  useChartConfigFilters,
} from "@/configurator";
import { ChartAnnotator } from "@/configurator/components/annotators";
import {
  ControlSection,
  ControlSectionContent,
  ControlSectionSkeleton,
  SubsectionTitle,
  useControlSectionContext,
} from "@/configurator/components/chart-controls/section";
import { ChartTypeSelector } from "@/configurator/components/chart-type-selector";
import {
  ControlTabField,
  DataFilterSelect,
  DataFilterTemporal,
  isDynamicMaxValue,
  OnOffControlTabField,
} from "@/configurator/components/field";
import { canRenderDatePickerField } from "@/configurator/components/field-date-picker";
import {
  getFiltersByMappingStatus,
  isConfiguring,
  moveFilterField,
  useConfiguratorState,
} from "@/configurator/configurator-state";
import { useInteractiveDataFilterToggle } from "@/configurator/interactive-filters/interactive-filters-config-state";
import { InteractiveFiltersConfigurator } from "@/configurator/interactive-filters/interactive-filters-configurator";
import {
  Dimension,
  isStandardErrorDimension,
  isTemporalDimension,
  Measure,
} from "@/domain/data";
import { truthy } from "@/domain/types";
import {
  useDataCubesComponentsQuery,
  useDataCubesMetadataQuery,
  useDataCubesObservationsQuery,
} from "@/graphql/hooks";
import {
  PossibleFiltersDocument,
  PossibleFiltersQuery,
  PossibleFiltersQueryVariables,
} from "@/graphql/query-hooks";
import { Icon } from "@/icons";
import SvgIcAdd from "@/icons/components/IcAdd";
import SvgIcTrash from "@/icons/components/IcTrash";
import { useLocale } from "@/locales/use-locale";
import useEvent from "@/utils/use-event";

import { DatasetDialog } from "./add-dataset-dialog";

type DataFilterSelectGenericProps = {
  rawDimension: Dimension;
  filterDimensionIris: string[];
  index: number;
  disabled?: boolean;
  onRemove: () => void;
};

const DataFilterSelectGeneric = (props: DataFilterSelectGenericProps) => {
  const { rawDimension, filterDimensionIris, index, disabled, onRemove } =
    props;
  const locale = useLocale();
  const [state] = useConfiguratorState();
  const chartConfig = getChartConfig(state);
  const [{ data, fetching }] = useDataCubesComponentsQuery({
    variables: {
      sourceType: state.dataSource.type,
      sourceUrl: state.dataSource.url,
      locale,
      cubeFilters: chartConfig.cubes.map((cube) => {
        const rawFilters = pickBy(cube.filters, (_, key) =>
          filterDimensionIris.includes(key)
        );
        return {
          iri: cube.iri,
          joinBy: cube.joinBy,
          componentIris: [rawDimension.iri],
          filters: Object.keys(rawFilters).length > 0 ? rawFilters : undefined,
          loadValues: true,
        };
      }),
    },
  });

  const dimension = data?.dataCubesComponents?.dimensions?.[0] ?? rawDimension;
  const controls = dimension.isKeyDimension ? null : (
    <Box sx={{ display: "flex", flexGrow: 1 }}>
      <IconButton
        disabled={disabled}
        sx={{ ml: 2, p: 0 }}
        onClick={onRemove}
        size="small"
      >
        <Icon name="trash" size="16" />
      </IconButton>
    </Box>
  );

  const sharedProps = {
    dimension,
    label: (
      <OpenMetadataPanelWrapper dim={dimension}>
        <span>{`${index + 1}. ${dimension.label}`}</span>
      </OpenMetadataPanelWrapper>
    ),
    controls,
    id: `select-single-filter-${index}`,
    disabled: fetching || disabled,
    isOptional: !dimension.isKeyDimension,
    loading: fetching,
  };

  if (
    isTemporalDimension(dimension) &&
    canRenderDatePickerField(dimension.timeUnit)
  ) {
    return (
      <DataFilterTemporal
        {...sharedProps}
        dimension={dimension}
        timeUnit={dimension.timeUnit}
      />
    );
  } else {
    return (
      <DataFilterSelect {...sharedProps} hierarchy={dimension.hierarchy} />
    );
  }
};

export const orderedIsEqual = (
  obj1: Record<string, unknown>,
  obj2: Record<string, unknown>
) => {
  return isEqual(Object.keys(obj1), Object.keys(obj2)) && isEqual(obj1, obj2);
};

/**
 * This runs every time the state changes and it ensures that the selected filters
 * return at least 1 observation. Otherwise filters are reloaded.
 */
const useEnsurePossibleFilters = ({
  state,
}: {
  state: ConfiguratorStateConfiguringChart | ConfiguratorStatePublishing;
}) => {
  const [, dispatch] = useConfiguratorState();
  const chartConfig = getChartConfig(state);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<Error>();
  const lastFilters = useRef<Record<string, Filters>>({});
  const client = useClient();
  const joinByIris = React.useMemo(() => {
    return chartConfig.cubes.flatMap((cube) => cube.joinBy).filter(truthy);
  }, [chartConfig.cubes]);

  useEffect(() => {
    const run = async () => {
      chartConfig.cubes.forEach(async (cube) => {
        const { mappedFilters, unmappedFilters } = getFiltersByMappingStatus(
          chartConfig,
          { cubeIri: cube.iri, joinByIris }
        );

        if (
          lastFilters.current[cube.iri] &&
          orderedIsEqual(lastFilters.current[cube.iri], unmappedFilters)
        ) {
          return;
        }

        lastFilters.current[cube.iri] = unmappedFilters;
        setFetching(true);

        const { data, error } = await client
          .query<PossibleFiltersQuery, PossibleFiltersQueryVariables>(
            PossibleFiltersDocument,
            {
              iri: cube.iri,
              sourceType: state.dataSource.type,
              sourceUrl: state.dataSource.url,
              filters: unmappedFilters,
              // @ts-ignore This is to make urql requery
              filterKey: Object.keys(unmappedFilters).join(", "),
            }
          )
          .toPromise();

        if (error || !data) {
          setError(error);
          setFetching(false);
          console.error("Could not fetch possible filters", error);

          return;
        }

        setError(undefined);
        setFetching(false);

        const filters = Object.assign(
          Object.fromEntries(
            data.possibleFilters.map((x) => [
              x.iri,
              { type: x.type, value: x.value },
            ])
          ) as Filters,
          mappedFilters
        );

        const oldFilters = getChartConfigFilters(chartConfig.cubes, cube.iri);

        // Replace resolved values with potential dynamic max values to not
        // override the dynamic max value with the resolved value
        for (const [key, value] of Object.entries(oldFilters)) {
          if (
            value.type === "single" &&
            isDynamicMaxValue(value.value) &&
            filters[key]
          ) {
            filters[key] = {
              type: "single",
              value: `${value.value}`,
            };
          }
        }

        if (!isEqual(filters, oldFilters) && !isEmpty(filters)) {
          dispatch({
            type: "CHART_CONFIG_FILTERS_UPDATE",
            value: {
              cubeIri: cube.iri,
              filters,
            },
          });
        }
      });
    };

    run();
  }, [
    client,
    dispatch,
    chartConfig,
    chartConfig.cubes,
    state.dataSource.type,
    state.dataSource.url,
    joinByIris,
  ]);

  return { error, fetching };
};

const useFilterReorder = ({
  onAddDimensionFilter,
}: {
  onAddDimensionFilter?: () => void;
}) => {
  const [state, dispatch] = useConfiguratorState(isConfiguring);
  const chartConfig = getChartConfig(state);
  const locale = useLocale();
  const filters = getChartConfigFilters(chartConfig.cubes);
  const joinByIris = React.useMemo(() => {
    return chartConfig.cubes.flatMap((cube) => cube.joinBy).filter(truthy);
  }, [chartConfig.cubes]);
  const { mappedFiltersIris } = useMemo(() => {
    return getFiltersByMappingStatus(chartConfig, { joinByIris });
  }, [chartConfig, joinByIris]);

  const variables = useMemo(() => {
    const cubeFilters = chartConfig.cubes.map((cube) => {
      const { unmappedFilters } = getFiltersByMappingStatus(chartConfig, {
        cubeIri: cube.iri,
        joinByIris,
      });

      return Object.keys(unmappedFilters).length > 0
        ? {
            iri: cube.iri,
            filters: unmappedFilters,
            joinBy: cube.joinBy,
          }
        : {
            iri: cube.iri,
            filters: undefined,
            joinBy: cube.joinBy,
            loadValues: true,
          };
    });

    // This is important for urql not to think that filters
    // are the same  while the order of the keys has changed.
    // If this is not present, we'll have outdated dimension
    // values after we change the filter order
    const requeryKey = cubeFilters.reduce((acc, d) => {
      return `${acc}${d.iri}${JSON.stringify(d.filters)}`;
    }, "");

    return {
      cubeFilters,
      requeryKey: requeryKey ? requeryKey : undefined,
    };
  }, [chartConfig, joinByIris]);

  const [
    { data: componentsData, fetching: componentsFetching },
    exectueComponentsQuery,
  ] = useDataCubesComponentsQuery({
    variables: {
      sourceType: state.dataSource.type,
      sourceUrl: state.dataSource.url,
      locale,
      ...variables,
    },
  });

  useEffect(() => {
    exectueComponentsQuery({
      variables: {
        sourceType: state.dataSource.type,
        sourceUrl: state.dataSource.url,
        locale,
        ...variables,
      },
    });
  }, [
    variables,
    exectueComponentsQuery,
    state.dataSource.type,
    state.dataSource.url,
    locale,
  ]);

  const dimensions = componentsData?.dataCubesComponents?.dimensions;
  const measures = componentsData?.dataCubesComponents?.measures;

  // Handlers
  const handleMove = useEvent((dimensionIri: string, delta: number) => {
    if (!dimensions || !measures) {
      return;
    }

    const dimension = dimensions.find((d) => d.iri === dimensionIri);

    if (dimension) {
      const newChartConfig = moveFilterField(chartConfig, {
        dimension,
        delta,
        possibleValues: dimension ? dimension.values.map((d) => d.value) : [],
      });

      dispatch({
        type: "CHART_CONFIG_REPLACED",
        value: {
          chartConfig: newChartConfig,
          dataCubesComponents: {
            dimensions,
            measures,
          },
        },
      });
    }
  });

  const handleAddDimensionFilter = useEvent((dimension: Dimension) => {
    onAddDimensionFilter?.();
    const filterValue = dimension.values[0];
    dispatch({
      type: "CHART_CONFIG_FILTER_SET_SINGLE",
      value: {
        cubeIri: dimension.cubeIri,
        dimensionIri: dimension.iri,
        value: `${filterValue.value}`,
      },
    });
  });

  const handleRemoveDimensionFilter = useEvent((dimension: Dimension) => {
    dispatch({
      type: "CHART_CONFIG_FILTER_REMOVE_SINGLE",
      value: {
        cubeIri: dimension.cubeIri,
        dimensionIri: dimension.iri,
      },
    });
  });

  const handleDragEnd: OnDragEndResponder = useEvent((result) => {
    const sourceIndex = result.source?.index;
    const destinationIndex = result.destination?.index;
    if (
      typeof sourceIndex !== "number" ||
      typeof destinationIndex !== "number" ||
      result.source === result.destination
    ) {
      return;
    }
    const delta = destinationIndex - sourceIndex;
    handleMove(result.draggableId, delta);
  });

  const { fetching: possibleFiltersFetching } = useEnsurePossibleFilters({
    state,
  });
  const fetching = possibleFiltersFetching || componentsFetching;

  const { filterDimensions, addableDimensions } = useMemo(() => {
    const keysOrder = Object.fromEntries(
      Object.keys(filters).map((k, i) => [k, i])
    );
    const filterDimensions = sortBy(
      dimensions?.filter(
        (dim) =>
          !mappedFiltersIris.has(dim.iri) && keysOrder[dim.iri] !== undefined
      ) || [],
      [(x) => keysOrder[x.iri] ?? Infinity]
    );
    const addableDimensions = dimensions?.filter(
      (dim) =>
        !mappedFiltersIris.has(dim.iri) &&
        keysOrder[dim.iri] === undefined &&
        !isStandardErrorDimension(dim)
    );

    return {
      filterDimensions,
      addableDimensions,
    };
  }, [dimensions, filters, mappedFiltersIris]);

  return {
    handleRemoveDimensionFilter,
    handleAddDimensionFilter,
    handleMove,
    handleDragEnd,
    fetching,
    dimensions,
    measures,
    filterDimensions,
    addableDimensions,
  };
};

const useStyles = makeStyles<Theme, { fetching: boolean }>((theme) => ({
  loadingIndicator: {
    color: theme.palette.grey[700],
    display: "inline-block",
    marginLeft: 8,
  },
  filtersContainer: {
    "& > * + *": { marginTop: theme.spacing(3) },
    marginBottom: 4,
  },
  filterRow: {
    display: "grid",
    gridTemplateColumns: "auto min-content",
    overflow: "hidden",
    width: "100%",
    gridColumnGap: theme.spacing(2),
    gridTemplateRows: "min-content min-content",
    gridTemplateAreas: '"description drag-button" "select drag-button"',
    "& .buttons": {
      transition: "color 0.125s ease, opacity 0.125s ease-out",
      opacity: 0.25,
      color: theme.palette.secondary.active,
    },
    "& .buttons:hover": {
      // Type inheritance is broken when one level of nesting is added
      opacity: ({ fetching }: { fetching: boolean }) =>
        fetching ? undefined : 1,
    },
    "& > *": {
      overflow: "hidden",
    },
  },
  dragButtons: {
    gridArea: "drag-button",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-end",
    flexGrow: 0,
    flexShrink: 0,
    paddingBottom: 0,
  },
  addDimensionContainer: {
    marginTop: "1rem",
    paddingLeft: theme.spacing(2),
    "& .menu-button": {
      background: "transparent",
      border: 0,
      padding: 0,
    },
  },
  addDimensionButton: {
    display: "flex",
    minWidth: "auto",
    justifyContent: "center",
  },
}));

const InteractiveDataFilterCheckbox = ({
  value,
  ...props
}: { value: string } & Omit<FormControlLabelProps, "control" | "label">) => {
  const { checked, toggle } = useInteractiveDataFilterToggle(value);

  return (
    <FormControlLabel
      componentsProps={{
        typography: { variant: "caption", color: "text.secondary" },
      }}
      {...props}
      control={<Switch checked={checked} onChange={() => toggle()} />}
      label={
        <Tooltip
          enterDelay={600}
          arrow
          title={
            <span>
              <Trans id="controls.filters.interactive.tooltip">
                Allow users to change filters
              </Trans>
            </span>
          }
        >
          <Typography variant="caption">
            <Trans id="controls.filters.interactive.toggle">Interactive</Trans>
          </Typography>
        </Tooltip>
      }
    />
  );
};

const FiltersBadge = ({ sx }: { sx?: BadgeProps["sx"] }) => {
  const ctx = useControlSectionContext();
  const [state] = useConfiguratorState(isConfiguring);
  const chartConfig = getChartConfig(state);
  const filters = useChartConfigFilters(chartConfig);

  return (
    <Badge
      invisible={ctx.isOpen}
      badgeContent={
        Object.values(filters).filter((d) => d.type === "single").length
      }
      color="secondary"
      sx={{ display: "block", ...sx }}
    />
  );
};

export const ChartConfigurator = ({
  state,
}: {
  state: ConfiguratorStateConfiguringChart;
}) => {
  const chartConfig = getChartConfig(state);
  const {
    isOpen: isFilterMenuOpen,
    open: openFilterMenu,
    close: closeFilterMenu,
  } = useDisclosure();
  const {
    fetching: dataFetching,
    handleAddDimensionFilter,
    handleRemoveDimensionFilter,
    handleDragEnd,
    dimensions,
    measures,
    filterDimensions,
    addableDimensions,
    handleMove,
  } = useFilterReorder({
    onAddDimensionFilter: () => closeFilterMenu(),
  });
  const { fetching: possibleFiltersFetching, error: possibleFiltersError } =
    useEnsurePossibleFilters({
      state,
    });
  const fetching = possibleFiltersFetching || dataFetching;
  const filterMenuButtonRef = useRef(null);
  const classes = useStyles({ fetching });

  if (!dimensions || !measures) {
    return (
      <>
        <ControlSectionSkeleton />
        <ControlSectionSkeleton />
      </>
    );
  }

  return (
    <>
      <ControlSection collapse>
        <SubsectionTitle titleId="controls-design" gutterBottom={false}>
          <Trans id="controls.select.chart.type">Chart Type</Trans>
        </SubsectionTitle>
        <ControlSectionContent px="small">
          <ChartTypeSelector
            showHelp={false}
            chartKey={chartConfig.key}
            state={state}
            sx={{ mt: 2 }}
          />
        </ControlSectionContent>
      </ControlSection>
      <ControlSection collapse>
        <SubsectionTitle titleId="controls-design" gutterBottom={false}>
          <Trans id="controls.section.chart.options">Chart Options</Trans>
        </SubsectionTitle>
        <ControlSectionContent
          px="small"
          gap="none"
          role="tablist"
          aria-labelledby="controls-design"
        >
          <ChartFields
            dataSource={state.dataSource}
            chartConfig={chartConfig}
            dimensions={dimensions}
            measures={measures}
          />
        </ControlSectionContent>
      </ControlSection>
      {filterDimensions.length === 0 &&
      addableDimensions &&
      addableDimensions.length === 0 ? null : (
        <ControlSection className={classes.filterSection} collapse>
          <SubsectionTitle titleId="controls-data" gutterBottom={false}>
            <Trans id="controls.section.data.filters">Filters</Trans>{" "}
            {fetching ? (
              <CircularProgress
                size={12}
                className={classes.loadingIndicator}
              />
            ) : null}
            <FiltersBadge sx={{ ml: "auto", mr: 4 }} />
          </SubsectionTitle>
          <ControlSectionContent
            aria-labelledby="controls-data"
            data-testid="configurator-filters"
          >
            {possibleFiltersError ? (
              <Typography variant="body2" color="error">
                <Trans id="controls.section.data.filters.possible-filters-error">
                  An error happened while fetching possible filters, please
                  retry later or reload the page.
                </Trans>
              </Typography>
            ) : null}
            {filterDimensions.length === 0 ? (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: -4 }}
              >
                <Trans id="controls.section.data.filters.none">
                  No filters
                </Trans>
              </Typography>
            ) : null}
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="filters">
                {(provided) => (
                  <Box
                    {...provided.droppableProps}
                    className={classes.filtersContainer}
                    ref={provided.innerRef}
                  >
                    {filterDimensions.map((dimension, i) => (
                      <Draggable
                        isDragDisabled={fetching}
                        draggableId={dimension.iri}
                        index={i}
                        key={dimension.iri}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            className={classes.filterRow}
                            {...provided.dragHandleProps}
                            {...provided.draggableProps}
                          >
                            <div>
                              <InteractiveDataFilterCheckbox
                                value={dimension.iri}
                                sx={{ mb: 1 }}
                              />
                            </div>
                            <DataFilterSelectGeneric
                              key={dimension.iri}
                              rawDimension={dimension}
                              filterDimensionIris={filterDimensions
                                .slice(0, i)
                                .map((d) => d.iri)}
                              index={i}
                              disabled={fetching}
                              onRemove={() =>
                                handleRemoveDimensionFilter(dimension)
                              }
                            />

                            <Box className={classes.dragButtons}>
                              <MoveDragButtons
                                moveUpButtonProps={{
                                  title: t({ id: "Move filter up" }),
                                }}
                                moveDownButtonProps={{
                                  title: t({ id: "Move filter down" }),
                                }}
                                dragButtonProps={{
                                  title: t({
                                    id: "Drag filters to reorganize",
                                  }),
                                }}
                                className="buttons"
                                onClickUp={() => handleMove(dimension.iri, -1)}
                                onClickDown={() => handleMove(dimension.iri, 1)}
                              />
                            </Box>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </Box>
                )}
              </Droppable>
            </DragDropContext>
            {addableDimensions && addableDimensions.length > 0 ? (
              <Box className={classes.addDimensionContainer}>
                <Button
                  ref={filterMenuButtonRef}
                  onClick={openFilterMenu}
                  variant="contained"
                  className={classes.addDimensionButton}
                  color="primary"
                >
                  <Trans>Add filter</Trans>
                  <Icon name="add" height={18} />
                </Button>
                <Menu
                  anchorEl={filterMenuButtonRef.current}
                  open={isFilterMenuOpen}
                  onClose={closeFilterMenu}
                >
                  {addableDimensions.map((dim) => (
                    <MenuItem
                      onClick={() => handleAddDimensionFilter(dim)}
                      key={dim.iri}
                    >
                      {dim.label}
                    </MenuItem>
                  ))}
                </Menu>
              </Box>
            ) : null}
          </ControlSectionContent>
        </ControlSection>
      )}
      <ChartAnnotator />
      {chartConfig.chartType !== "table" && (
        <InteractiveFiltersConfigurator state={state} />
      )}
      <ChooseDatasetsControlSection />
    </>
  );
};

const ChooseDatasetsControlSection = () => {
  const [state, dispatch] = useConfiguratorState(isConfiguring);
  const locale = useLocale();
  const commonQueryVariables = {
    sourceType: state.dataSource.type,
    sourceUrl: state.dataSource.url,
    locale,
  };
  const cubes = useMemo(() => {
    const cubes = uniqBy(
      state.chartConfigs.flatMap((x) => x.cubes),
      (x) => x.iri
    );
    return cubes;
  }, [state.chartConfigs]);
  const [metadataQuery] = useDataCubesMetadataQuery({
    variables: {
      ...commonQueryVariables,
      cubeFilters: cubes.map((cube) => ({
        iri: cube.iri,
      })),
    },
  });
  const {
    isOpen: isDatasetDialogOpen,
    open: openDatasetDialog,
    close: closeDatasetDialog,
  } = useDisclosure();
  return (
    <ControlSection collapse>
      <SubsectionTitle titleId="controls-data" gutterBottom={false}>
        <Trans id="controls.section.datasets.title">Datasets</Trans>{" "}
        <FiltersBadge sx={{ ml: "auto", mr: 4 }} />
      </SubsectionTitle>
      <ControlSectionContent
        aria-labelledby="controls-data"
        data-testid="configurator-filters"
      >
        <Box
          sx={{
            gap: "0.5rem",
            mb: "1rem",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {metadataQuery.data?.dataCubesMetadata.map((x) => {
            return (
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                key={x.iri}
              >
                <div>
                  <Link href={`/browse?dataset=${x.iri}`} passHref>
                    <MuiLink
                      color="primary"
                      underline="none"
                      variant="caption"
                      component="span"
                    >
                      Dataset
                    </MuiLink>
                  </Link>
                  <br />
                  <Typography variant="caption">{x.title}</Typography>
                </div>
                <div>
                  <IconButton
                    onClick={() =>
                      dispatch({
                        type: "DATASET_REMOVE",
                        value: { locale, iri: x.iri },
                      })
                    }
                  >
                    <SvgIcTrash />
                  </IconButton>
                </div>
              </Box>
            );
          })}
        </Box>
        <Box>
          {cubes.length === 1 ? (
            <Button
              onClick={openDatasetDialog}
              startIcon={<SvgIcAdd />}
              variant="outlined"
              size="small"
            >
              {t({ id: "chart.datasets.add", message: "Add dataset" })}
            </Button>
          ) : null}
        </Box>
        <DatasetDialog
          state={state}
          open={isDatasetDialogOpen}
          onClose={closeDatasetDialog}
        />
      </ControlSectionContent>
    </ControlSection>
  );
};

type ChartFieldsProps = {
  dataSource: DataSource;
  chartConfig: ChartConfig;
  dimensions?: Dimension[];
  measures?: Measure[];
};

const ChartFields = (props: ChartFieldsProps) => {
  const { dataSource, chartConfig, dimensions, measures } = props;
  const components = [...(dimensions ?? []), ...(measures ?? [])];
  const queryFilters = useQueryFilters({
    chartConfig,
    dimensions,
    measures,
  });
  const locale = useLocale();
  const [{ data: observationsData }] = useDataCubesObservationsQuery({
    variables: {
      locale,
      sourceType: dataSource.type,
      sourceUrl: dataSource.url,
      cubeFilters: queryFilters ?? [],
    },
    pause: !queryFilters,
  });
  const observations = observationsData?.dataCubesObservations?.data ?? [];

  return (
    <>
      {getChartSpec(chartConfig)
        .encodings.filter((d) => !d.hide)
        .map((encoding) => {
          const { field, getDisabledState } = encoding;
          const component = components.find(
            (d) => d.iri === (chartConfig.fields as any)[field]?.componentIri
          );
          const baseLayer = isMapConfig(chartConfig) && field === "baseLayer";

          return baseLayer ? (
            <OnOffControlTabField
              key={field}
              value={field}
              icon="baseLayer"
              label={<Trans id="chart.map.layers.base">Map Display</Trans>}
              active={chartConfig.baseLayer.show}
            />
          ) : (
            <ControlTabField
              key={field}
              chartConfig={chartConfig}
              component={
                isMapConfig(chartConfig) && field === "symbolLayer"
                  ? chartConfig.fields.symbolLayer
                    ? component
                    : undefined
                  : component
              }
              value={field}
              labelId={`${chartConfig.chartType}.${field}`}
              {...getDisabledState?.(chartConfig, components, observations)}
            />
          );
        })}
    </>
  );
};
