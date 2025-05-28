import { t, Trans } from "@lingui/macro";
import {
  Box,
  Button,
  SelectChangeEvent,
  Theme,
  Typography,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { ascending } from "d3-array";
import { ChangeEvent, ReactNode, useCallback } from "react";
import {
  DragDropContext,
  Draggable,
  Droppable,
  OnDragEndResponder,
} from "react-beautiful-dnd";

import { Radio, RadioGroup, Select } from "@/components/form";
import { VisuallyHidden } from "@/components/visually-hidden";
import {
  ConfiguratorStateConfiguringChart,
  TableConfig,
  TableSortingOption,
} from "@/config-types";
import { getChartConfig } from "@/config-utils";
import {
  ControlSection,
  SectionTitle,
} from "@/configurator/components/chart-controls/section";
import { getFieldLabel } from "@/configurator/components/field-i18n";
import { useOrderedTableColumns } from "@/configurator/components/ui-helpers";
import { useConfiguratorState } from "@/configurator/configurator-state";
import {
  addSortingOption,
  changeSortingOption,
  changeSortingOptionOrder,
  moveSortingOptions,
  removeSortingOption,
} from "@/configurator/table/table-config-state";
import { Dimension, isNumericalMeasure, Measure } from "@/domain/data";
import { Icon } from "@/icons";
import { useEvent } from "@/utils/use-event";

const useStyles = makeStyles<Theme>((theme) => ({
  sortingItemContainer: {
    padding: theme.spacing(4),
    paddingRight: theme.spacing(0),

    borderTop: `1px solid ${theme.palette.divider}`,
  },
  sortingItemBox: {
    "&:first-of-type $sortingItemContainer": {
      borderTopWidth: 0,
    },
  },
  selectWrapper: {
    lineHeight: "1rem",
    textAlign: "left",
    marginBottom: theme.spacing(4),
  },
  removeButton: {
    padding: 0,
    paddingRight: theme.spacing(6),
    cursor: "pointer",
    marginLeft: "auto",
    minWidth: 0,
    minHeight: 0,
  },
  iconWrapper: {
    // @ts-ignore
    color: theme.palette.secondary.disabled,

    "&:hover": {
      color: theme.palette.secondary.main,
    },
  },
}));

const TableSortingOptionItem = ({
  dimensions,
  measures,
  componentId,
  index,
  chartConfig,
  sortingOrder,
  sideControls,
}: {
  dimensions: Dimension[];
  measures: Measure[];
  index: number;
  chartConfig: TableConfig;
  sideControls?: ReactNode;
} & TableSortingOption) => {
  const [, dispatch] = useConfiguratorState();
  const classes = useStyles();
  const component = [...dimensions, ...measures].find(
    ({ id }) => id === componentId
  );

  const onRemove = useEvent(() => {
    dispatch({
      type: "CHART_CONFIG_REPLACED",
      value: {
        chartConfig: removeSortingOption(chartConfig, {
          index,
        }),
        dataCubesComponents: {
          dimensions,
          measures,
        },
      },
    });
  });

  const onChangeSortingOrder = useEvent((e: ChangeEvent<HTMLInputElement>) => {
    dispatch({
      type: "CHART_CONFIG_REPLACED",
      value: {
        chartConfig: changeSortingOptionOrder(chartConfig, {
          index,
          sortingOrder: e.currentTarget.value as "asc" | "desc",
        }),
        dataCubesComponents: {
          dimensions,
          measures,
        },
      },
    });
  });

  const sortingType = isNumericalMeasure(component)
    ? "byMeasure"
    : "byDimensionLabel";

  return component ? (
    <Box className={classes.sortingItemContainer}>
      <Typography className={classes.selectWrapper}>
        <ChangeTableSortingOption
          index={index}
          dimensions={dimensions}
          measures={measures}
          chartConfig={chartConfig}
          sideControls={sideControls}
        />
      </Typography>
      <RadioGroup>
        <Radio
          name={`${componentId}-sortingOrder`}
          value="asc"
          checked={sortingOrder === "asc"}
          onChange={onChangeSortingOrder}
          label={getFieldLabel(`sorting.${sortingType}.asc`)}
        />
        <Radio
          name={`${componentId}-sortingOrder`}
          value="desc"
          checked={sortingOrder === "desc"}
          onChange={onChangeSortingOrder}
          label={getFieldLabel(`sorting.${sortingType}.desc`)}
        />
        <Button
          variant="text"
          className={classes.removeButton}
          onClick={onRemove}
        >
          <VisuallyHidden>
            <Trans id="controls.sorting.removeOption">
              Remove sorting dimension
            </Trans>
          </VisuallyHidden>
          <Box className={classes.iconWrapper} aria-hidden="true">
            <Icon name="trash" size={20} />
          </Box>
        </Button>
      </RadioGroup>
    </Box>
  ) : null;
};

const AddTableSortingOption = ({
  dimensions,
  measures,
  chartConfig,
}: {
  dimensions: Dimension[];
  measures: Measure[];
  chartConfig: TableConfig;
}) => {
  const [, dispatch] = useConfiguratorState();

  const onChange = useCallback(
    (e: SelectChangeEvent<unknown>) => {
      const { value } = e.target;
      const component = [...dimensions, ...measures].find(
        ({ id }) => id === value
      );

      if (component) {
        dispatch({
          type: "CHART_CONFIG_REPLACED",
          value: {
            chartConfig: addSortingOption(chartConfig, {
              componentId: component.id,
              componentType: component.__typename,
              sortingOrder: "asc",
            }),
            dataCubesComponents: {
              dimensions,
              measures,
            },
          },
        });
      }
    },
    [chartConfig, dimensions, dispatch, measures]
  );

  const columns = useOrderedTableColumns(chartConfig.fields);

  const options = [
    {
      value: "-",
      label: t({
        id: "controls.sorting.selectDimension",
        message: "Select a dimension...",
      }),
      disabled: true,
    },
    ...columns
      .flatMap((c) => {
        if (
          chartConfig.sorting.some(
            ({ componentId }) => componentId === c.componentId
          )
        ) {
          return [];
        }

        const component = [...dimensions, ...measures].find(
          ({ id }) => id === c.componentId
        );

        return component
          ? [{ value: component.id, label: component.label }]
          : [];
      })
      .sort((a, b) => ascending(a.label, b.label)),
  ];

  return (
    <Select
      id="add-tablesorting"
      size="sm"
      value="-"
      options={options}
      sortOptions={false}
      label={t({
        id: "controls.sorting.addDimension",
        message: "Add dimension",
      })}
      onChange={onChange}
    />
  );
};

const ChangeTableSortingOption = ({
  dimensions,
  measures,
  chartConfig,
  index,
  sideControls,
}: {
  dimensions: Dimension[];
  measures: Measure[];
  chartConfig: TableConfig;
  index: number;
  sideControls?: ReactNode;
}) => {
  const [, dispatch] = useConfiguratorState();

  const onChange = useCallback(
    (e: SelectChangeEvent<unknown>) => {
      const { value } = e.target;
      const component = [...dimensions, ...measures].find(
        ({ id }) => id === value
      );

      if (component) {
        dispatch({
          type: "CHART_CONFIG_REPLACED",
          value: {
            chartConfig: changeSortingOption(chartConfig, {
              index,
              option: {
                componentId: component.id,
                componentType: component.__typename,
                sortingOrder: "asc",
              },
            }),
            dataCubesComponents: {
              dimensions,
              measures,
            },
          },
        });
      }
    },
    [chartConfig, dimensions, dispatch, index, measures]
  );

  const columns = useOrderedTableColumns(chartConfig.fields);
  const { componentId } = chartConfig.sorting[index];
  const options = columns.flatMap((c) => {
    const component = [...dimensions, ...measures].find(
      ({ id }) => id === c.componentId
    );

    return component ? [{ value: component.id, label: component.label }] : [];
  });

  return (
    <Select
      id={`change-sorting-option-${index}`}
      size="sm"
      value={componentId}
      options={options}
      label={t({ id: "controls.sorting.sortBy", message: "Sort by" })}
      onChange={onChange}
      sideControls={sideControls}
    />
  );
};

export const TableSortingOptions = ({
  state,
  dimensions,
  measures,
}: {
  state: ConfiguratorStateConfiguringChart;
  dimensions: Dimension[];
  measures: Measure[];
}) => {
  const [, dispatch] = useConfiguratorState();
  const chartConfig = getChartConfig(state);
  const { activeField } = chartConfig;
  const classes = useStyles();

  const onDragEnd = useCallback<OnDragEndResponder>(
    ({ source, destination }) => {
      if (!destination || chartConfig.chartType !== "table") {
        return;
      }

      dispatch({
        type: "CHART_CONFIG_REPLACED",
        value: {
          chartConfig: moveSortingOptions(chartConfig, {
            source,
            destination,
          }),
          dataCubesComponents: {
            dimensions,
            measures,
          },
        },
      });
    },
    [chartConfig, dimensions, dispatch, measures]
  );

  if (!activeField || chartConfig.chartType !== "table") {
    return null;
  }

  const { sorting } = chartConfig;

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <ControlSection hideTopBorder>
        <SectionTitle closable>
          <Trans id="controls.section.tableSorting">Table Sorting</Trans>
        </SectionTitle>
        <Droppable droppableId="table-sorting" type="table-sorting">
          {({ innerRef, placeholder }) => {
            return (
              <div>
                <Box ref={innerRef}>
                  {sorting.map((option, i) => {
                    return (
                      <Draggable
                        key={option.componentId}
                        draggableId={option.componentId}
                        index={i}
                      >
                        {(
                          { innerRef, draggableProps, dragHandleProps },
                          { isDragging }
                        ) => {
                          return (
                            <Box
                              ref={innerRef}
                              {...draggableProps}
                              className={classes.sortingItemBox}
                              sx={{
                                position: "relative",
                                boxShadow: isDragging ? "tooltip" : undefined,
                              }}
                              style={{
                                ...draggableProps.style,
                              }}
                            >
                              <TableSortingOptionItem
                                {...option}
                                index={i}
                                dimensions={dimensions}
                                measures={measures}
                                chartConfig={chartConfig}
                                sideControls={
                                  <Box
                                    sx={{
                                      color: isDragging
                                        ? "secondary.main"
                                        : "secondary.light",

                                      "&:hover": {
                                        color: "secondary.main",
                                      },
                                    }}
                                    {...dragHandleProps}
                                  >
                                    <Icon name="dragndrop" />
                                  </Box>
                                }
                              />
                            </Box>
                          );
                        }}
                      </Draggable>
                    );
                  })}
                </Box>
                {placeholder}
                <Box
                  sx={{
                    py: 4,
                    px: 4,
                    borderTopColor: "divider",
                    borderTopStyle: "solid",
                    borderTopWidth: 1,
                  }}
                >
                  <AddTableSortingOption
                    dimensions={dimensions}
                    measures={measures}
                    chartConfig={chartConfig}
                  />
                </Box>
              </div>
            );
          }}
        </Droppable>
      </ControlSection>
    </DragDropContext>
  );
};
