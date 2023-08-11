import { t, Trans } from "@lingui/macro";
import {
  Box,
  Button,
  SelectChangeEvent,
  Theme,
  Typography,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { ascending } from "d3";
import { ChangeEvent, useCallback } from "react";
import {
  DragDropContext,
  Draggable,
  Droppable,
  OnDragEndResponder,
} from "react-beautiful-dnd";

import Flex from "@/components/flex";
import { Radio, Select } from "@/components/form";
import VisuallyHidden from "@/components/visually-hidden";
import {
  ConfiguratorStateConfiguringChart,
  TableConfig,
  TableSortingOption,
} from "@/config-types";
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
import { isNumericalMeasure } from "@/domain/data";
import { DataCubeMetadataWithHierarchies } from "@/graphql/types";
import { Icon } from "@/icons";
import useEvent from "@/utils/use-event";

const useStyles = makeStyles<Theme>((theme) => ({
  sortingItemContainer: {
    backgroundColor: theme.palette.grey[100],
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
    paddingLeft: theme.spacing(4),
    paddingRight: `calc(${theme.spacing(6)} + ${theme.spacing(2)})`,

    borderTopColor: theme.palette.divider,
    borderTopStyle: "solid",
    borderTopWidth: 1,
  },
  sortingItemBox: {
    "&:first-of-type $sortingItemContainer": {
      borderTopWidth: 0,
    },
  },
  selectWrapper: {
    color: theme.palette.grey[800],
    lineHeight: "1rem",
    textAlign: "left",
    marginBottom: theme.spacing(4),
  },
  metaOptionsContainer: {
    marginBottom: -theme.spacing(1),
    width: "100%",
    alignItems: "flex-start",
  },
  removeButton: {
    padding: 0,
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
  icon: {
    width: 24,
    height: 24,
    position: "absolute",
    top: "50%",
    right: 2,
    marginTop: -12,
  },
}));

const TableSortingOptionItem = ({
  componentIri,
  index,
  chartConfig,
  sortingOrder,
  metaData,
}: {
  metaData: DataCubeMetadataWithHierarchies;
  index: number;
  chartConfig: TableConfig;
} & TableSortingOption) => {
  const [, dispatch] = useConfiguratorState();
  const classes = useStyles();
  const component =
    metaData.dimensions.find(({ iri }) => iri === componentIri) ??
    metaData.measures.find(({ iri }) => iri === componentIri);

  const onRemove = useEvent(() => {
    dispatch({
      type: "CHART_CONFIG_REPLACED",
      value: {
        chartConfig: removeSortingOption(chartConfig, {
          index,
        }),
        dataSetMetadata: metaData,
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
        dataSetMetadata: metaData,
      },
    });
  });

  const sortingType = isNumericalMeasure(component)
    ? "byMeasure"
    : "byDimensionLabel";

  return component ? (
    <Box className={classes.sortingItemContainer}>
      <Typography variant="body1" className={classes.selectWrapper}>
        <ChangeTableSortingOption
          index={index}
          metaData={metaData}
          chartConfig={chartConfig}
        />
      </Typography>
      <Flex className={classes.metaOptionsContainer}>
        <Radio
          name={`${componentIri}-sortingOrder`}
          value="asc"
          checked={sortingOrder === "asc"}
          onChange={onChangeSortingOrder}
          label={getFieldLabel(`sorting.${sortingType}.asc`)}
        />
        <Radio
          name={`${componentIri}-sortingOrder`}
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
      </Flex>
    </Box>
  ) : null;
};

const AddTableSortingOption = ({
  metaData,
  chartConfig,
}: {
  metaData: DataCubeMetadataWithHierarchies;
  chartConfig: TableConfig;
}) => {
  const [, dispatch] = useConfiguratorState();

  const onChange = useCallback(
    (e: SelectChangeEvent<unknown>) => {
      const { value } = e.target;

      const component =
        metaData.dimensions.find(({ iri }) => iri === value) ??
        metaData.measures.find(({ iri }) => iri === value);

      if (component) {
        dispatch({
          type: "CHART_CONFIG_REPLACED",
          value: {
            chartConfig: addSortingOption(chartConfig, {
              componentIri: component.iri,
              componentType: component.__typename,
              sortingOrder: "asc",
            }),
            dataSetMetadata: metaData,
          },
        });
      }
    },
    [chartConfig, dispatch, metaData]
  );

  const columns = useOrderedTableColumns(chartConfig.fields);

  const options = [
    {
      value: "-",
      label: t({
        id: "controls.sorting.selectDimension",
        message: `Select a dimension …`,
      }),
      disabled: true,
    },
    ...columns
      .flatMap((c) => {
        if (
          chartConfig.sorting.some(
            ({ componentIri }) => componentIri === c.componentIri
          )
        ) {
          return [];
        }

        const component =
          metaData.dimensions.find(({ iri }) => iri === c.componentIri) ??
          metaData.measures.find(({ iri }) => iri === c.componentIri);

        return component
          ? [
              {
                value: component.iri,
                label: component.label,
              },
            ]
          : [];
      })
      .sort((a, b) => ascending(a.label, b.label)),
  ];

  return (
    <Select
      id="add-tablesorting"
      value="-"
      options={options}
      sortOptions={false}
      label={t({
        id: "controls.sorting.addDimension",
        message: `Add dimension`,
      })}
      onChange={onChange}
    />
  );
};

const ChangeTableSortingOption = ({
  metaData,
  chartConfig,
  index,
}: {
  metaData: DataCubeMetadataWithHierarchies;
  chartConfig: TableConfig;
  index: number;
}) => {
  const [, dispatch] = useConfiguratorState();

  const onChange = useCallback(
    (e: SelectChangeEvent<unknown>) => {
      const { value } = e.target;

      const component =
        metaData.dimensions.find(({ iri }) => iri === value) ??
        metaData.measures.find(({ iri }) => iri === value);

      if (component) {
        dispatch({
          type: "CHART_CONFIG_REPLACED",
          value: {
            chartConfig: changeSortingOption(chartConfig, {
              index,
              option: {
                componentIri: component.iri,
                componentType: component.__typename,
                sortingOrder: "asc",
              },
            }),
            dataSetMetadata: metaData,
          },
        });
      }
    },
    [chartConfig, dispatch, index, metaData]
  );

  const columns = useOrderedTableColumns(chartConfig.fields);

  const { componentIri } = chartConfig.sorting[index];

  const options = columns.flatMap((c) => {
    const component =
      metaData.dimensions.find(({ iri }) => iri === c.componentIri) ??
      metaData.measures.find(({ iri }) => iri === c.componentIri);

    return component
      ? [
          {
            value: component.iri,
            label: component.label,
          },
        ]
      : [];
  });
  return (
    <Select
      id={`change-sorting-option-${index}`}
      value={componentIri}
      options={options}
      label={t({ id: "controls.sorting.sortBy", message: `Sort by` })}
      onChange={onChange}
    />
  );
};

export const TableSortingOptions = ({
  state,
  dataSetMetadata,
}: {
  state: ConfiguratorStateConfiguringChart;
  dataSetMetadata: DataCubeMetadataWithHierarchies;
}) => {
  const [, dispatch] = useConfiguratorState();
  const { activeField, chartConfig } = state;
  const classes = useStyles();

  const onDragEnd = useCallback<OnDragEndResponder>(
    ({ source, destination }) => {
      if (
        !destination ||
        state.chartConfig.chartType !== "table" ||
        !dataSetMetadata
      ) {
        return;
      }

      dispatch({
        type: "CHART_CONFIG_REPLACED",
        value: {
          chartConfig: moveSortingOptions(state.chartConfig, {
            source,
            destination,
          }),
          dataSetMetadata,
        },
      });
    },
    [state, dispatch, dataSetMetadata]
  );

  if (!activeField || chartConfig.chartType !== "table") {
    return null;
  }

  const { sorting } = chartConfig;

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <ControlSection>
        <SectionTitle>
          <Trans id="controls.section.tableSorting">Table Sorting</Trans>
        </SectionTitle>
        <Droppable droppableId="table-sorting" type="table-sorting">
          {({ innerRef, placeholder }) => {
            return (
              <Box>
                <Box ref={innerRef}>
                  {sorting.map((option, i) => {
                    return (
                      <Draggable
                        key={option.componentIri}
                        draggableId={option.componentIri}
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
                              sx={{
                                position: "relative",
                                boxShadow: isDragging ? "tooltip" : undefined,
                              }}
                              className={classes.sortingItemBox}
                              style={{
                                ...draggableProps.style,
                              }}
                            >
                              <TableSortingOptionItem
                                {...option}
                                index={i}
                                metaData={dataSetMetadata}
                                chartConfig={chartConfig}
                              />
                              <Box
                                className={classes.icon}
                                sx={{
                                  color: isDragging
                                    ? "secondary.active"
                                    : "secondary.disabled",
                                  ":hover": {
                                    color: "secondary.hover",
                                  },
                                }}
                                {...dragHandleProps}
                              >
                                <Icon name="dragndrop" />
                              </Box>
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
                    metaData={dataSetMetadata}
                    chartConfig={chartConfig}
                  />
                </Box>
              </Box>
            );
          }}
        </Droppable>
      </ControlSection>
    </DragDropContext>
  );
};
