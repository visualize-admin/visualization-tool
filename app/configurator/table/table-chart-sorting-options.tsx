import { t, Trans } from "@lingui/macro";
import { I18n } from "@lingui/react";
import VisuallyHidden from "@reach/visually-hidden";
import React, { ChangeEvent, useCallback } from "react";
import {
  DragDropContext,
  Draggable,
  Droppable,
  OnDragEndResponder,
} from "react-beautiful-dnd";
import { Box, Button, Flex, Text } from "theme-ui";
import { Radio, Select } from "../../components/form";
import { DataCubeMetadata } from "../../graphql/types";
import { Icon } from "../../icons";
import {
  ControlSection,
  SectionTitle,
} from "../components/chart-controls/section";
import {
  getFieldLabel,
  useOrderedTableColumns,
} from "../components/ui-helpers";
import {
  ConfiguratorStateConfiguringChart,
  TableConfig,
  TableSortingOption,
} from "../config-types";
import { useConfiguratorState } from "../configurator-state";
import {
  addSortingOption,
  changeSortingOption,
  changeSortingOptionOrder,
  moveSortingOptions,
  removeSortingOption,
} from "./table-config-state";

const TableSortingOptionItem = ({
  componentIri,
  componentType,
  index,
  sortingOrder,
  metaData,
  chartConfig,
}: {
  metaData: DataCubeMetadata;
  index: number;
  chartConfig: TableConfig;
} & TableSortingOption) => {
  const [, dispatch] = useConfiguratorState();
  const component =
    metaData.dimensions.find(({ iri }) => iri === componentIri) ??
    metaData.measures.find(({ iri }) => iri === componentIri);

  const onRemove = useCallback(() => {
    dispatch({
      type: "CHART_CONFIG_REPLACED",
      value: {
        chartConfig: removeSortingOption(chartConfig, {
          index,
        }),
        dataSetMetadata: metaData,
      },
    });
  }, [chartConfig, dispatch, index, metaData]);

  const onChangeSortingOrder = useCallback(
    (e) => {
      dispatch({
        type: "CHART_CONFIG_REPLACED",
        value: {
          chartConfig: changeSortingOptionOrder(chartConfig, {
            index,
            sortingOrder: e.currentTarget.value,
          }),
          dataSetMetadata: metaData,
        },
      });
    },
    [chartConfig, dispatch, index, metaData]
  );

  const sortingType =
    component?.__typename === "Measure" ? "byMeasure" : "byDimensionLabel";

  return component ? (
    <Box
      sx={{
        bg: "monochrome100",
        py: 4,
        pl: 4,
        pr: 6,

        borderTopColor: "monochrome500",
        borderTopStyle: "solid",
        borderTopWidth: 1,
      }}
    >
      <Box sx={{ pr: 2 }}>
        <Text
          variant="paragraph1"
          sx={{
            color: "monochrome800",
            lineHeight: [1, 1, 1],
            textAlign: "left",
            mb: 3,
          }}
        >
          <ChangeTableSortingOption
            index={index}
            metaData={metaData}
            chartConfig={chartConfig}
          />
        </Text>
        <Flex sx={{ mt: 2, mb: -1, width: "100%", alignItems: "flex-start" }}>
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
            variant="reset"
            sx={{
              p: 0,
              cursor: "pointer",
              ml: "auto",
              mb: 2,
              top: "2px",
              position: "relative",
            }}
            onClick={onRemove}
          >
            <VisuallyHidden>
              <Trans id="controls.sorting.removeOption">
                Remove sorting dimension
              </Trans>
            </VisuallyHidden>
            <Box
              aria-hidden="true"
              sx={{
                color: "secondaryDisabled",
                ":hover": { color: "secondary" },
              }}
            >
              <Icon name="trash" size={20} />
            </Box>
          </Button>
        </Flex>
      </Box>
    </Box>
  ) : null;
};

const AddTableSortingOption = ({
  metaData,
  chartConfig,
}: {
  metaData: DataCubeMetadata;
  chartConfig: TableConfig;
}) => {
  const [, dispatch] = useConfiguratorState();

  const onChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      const { value } = e.currentTarget;

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

  return (
    <I18n>
      {({ i18n }) => {
        const options = [
          {
            value: "-",
            label: i18n._(
              t("controls.sorting.selectDimension")`Select a dimension …`
            ),
            disabled: true,
          },
          ...columns.flatMap((c) => {
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
          }),
        ];

        return (
          <Select
            id="add-tablesorting"
            value="-"
            options={options}
            label={i18n._(t("controls.sorting.addDimension")`Add dimension`)}
            onChange={onChange}
          />
        );
      }}
    </I18n>
  );
};

const ChangeTableSortingOption = ({
  metaData,
  chartConfig,
  index,
}: {
  metaData: DataCubeMetadata;
  chartConfig: TableConfig;
  index: number;
}) => {
  const [, dispatch] = useConfiguratorState();

  const onChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      const { value } = e.currentTarget;

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

  return (
    <I18n>
      {({ i18n }) => {
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
            label={i18n._(t("controls.sorting.sortBy")`Sort by`)}
            onChange={onChange}
          />
        );
      }}
    </I18n>
  );
};

export const TableSortingOptions = ({
  state,
  metaData,
}: {
  state: ConfiguratorStateConfiguringChart;
  metaData: DataCubeMetadata;
}) => {
  const [, dispatch] = useConfiguratorState();
  const { activeField, chartConfig } = state;

  const onDragEnd = useCallback<OnDragEndResponder>(
    ({ source, destination }) => {
      if (
        !destination ||
        state.chartConfig.chartType !== "table" ||
        !metaData
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
          dataSetMetadata: metaData,
        },
      });
    },
    [state, dispatch, metaData]
  );

  if (!activeField || chartConfig.chartType !== "table") {
    return null;
  }

  const { sorting } = chartConfig;

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <ControlSection>
        <SectionTitle iconName={"sort"}>
          <Trans id="controls.section.tableSorting">Table Sorting</Trans>
        </SectionTitle>
        <Droppable droppableId="table-sorting" type="table-sorting">
          {(
            { innerRef, placeholder },
            { isDraggingOver, isUsingPlaceholder, draggingOverWith }
          ) => {
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
                              style={{
                                ...draggableProps.style,
                              }}
                            >
                              <TableSortingOptionItem
                                {...option}
                                index={i}
                                metaData={metaData}
                                chartConfig={chartConfig}
                              />
                              <Box
                                sx={{
                                  width: 24,
                                  height: 24,
                                  position: "absolute",
                                  top: "50%",
                                  right: 2,
                                  marginTop: -12,
                                  color: isDragging
                                    ? "secondaryActive"
                                    : "secondaryDisabled",
                                  ":hover": {
                                    color: "secondaryHover",
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
                    borderTopColor: "monochrome500",
                    borderTopStyle: "solid",
                    borderTopWidth: 1,
                  }}
                >
                  <AddTableSortingOption
                    metaData={metaData}
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
