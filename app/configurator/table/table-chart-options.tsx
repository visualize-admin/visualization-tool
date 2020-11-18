import { t } from "@lingui/macro";
import { I18n, Trans } from "@lingui/react";
import VisuallyHidden from "@reach/visually-hidden";
import get from "lodash/get";
import React, {
  ChangeEvent,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import {
  DragDropContext,
  Draggable,
  Droppable,
  OnDragEndResponder,
} from "react-beautiful-dnd";
import { Box, Button, Flex, Text } from "theme-ui";
import { Checkbox, Radio, Select } from "../../components/form";
import { DimensionFieldsWithValuesFragment } from "../../graphql/query-hooks";
import { DataCubeMetadata } from "../../graphql/types";
import { Icon } from "../../icons";
import { ColorPalette } from "../components/chart-controls/color-palette";
import {
  ControlSection,
  ControlSectionContent,
  SectionTitle,
} from "../components/chart-controls/section";
import {
  ChartOptionCheckboxField,
  ChartOptionSelectField,
  ColorPickerField,
} from "../components/field";
import {
  DimensionValuesMultiFilter,
  DimensionValuesSingleFilter,
} from "../components/filters";
import {
  getDefaultCategoricalPalette,
  getDefaultSequentialPalette,
  getFieldLabel,
  getOrderedTableColumns,
  mapColorsToComponentValuesIris,
} from "../components/ui-helpers";
import { FieldProps } from "../config-form";
import {
  ColumnStyle,
  ConfiguratorStateConfiguringChart,
  TableConfig,
  TableSortingOption,
} from "../config-types";
import { useConfiguratorState } from "../configurator-state";
import {
  addSortingOption,
  changeSortingOptionOrder,
  moveSortingOptions,
  removeSortingOption,
  updateIsFiltered,
  updateIsGroup,
  updateIsHidden,
} from "./table-config-state";

const useTableColumnGroupHiddenField = ({
  path,
  field,
  metaData,
}: {
  path: "isGroup" | "isHidden" | "isFiltered";
  field: string;
  metaData: DataCubeMetadata;
}): FieldProps => {
  const [state, dispatch] = useConfiguratorState();

  const onChange = useCallback<(e: ChangeEvent<HTMLInputElement>) => void>(
    (e) => {
      if (
        state.state === "CONFIGURING_CHART" &&
        state.chartConfig.chartType === "table"
      ) {
        const updater =
          path === "isGroup"
            ? updateIsGroup
            : path === "isHidden"
            ? updateIsHidden
            : updateIsFiltered;

        const chartConfig = updater(state.chartConfig, {
          field,
          value: e.currentTarget.checked,
        });

        dispatch({
          type: "CHART_CONFIG_REPLACED",
          value: {
            chartConfig,
            dataSetMetadata: metaData,
          },
        });
      }
    },
    [state, path, field, dispatch, metaData]
  );
  const stateValue =
    state.state === "CONFIGURING_CHART"
      ? get(state, `chartConfig.fields["${field}"].${path}`, "")
      : "";
  const checked = stateValue ? stateValue : false;

  return {
    name: path,
    checked,
    onChange,
  };
};

const ChartOptionGroupHiddenField = ({
  label,
  field,
  path,
  defaultChecked,
  disabled = false,
  metaData,
}: {
  label: string | ReactNode;
  field: string;
  path: "isGroup" | "isHidden" | "isFiltered";
  defaultChecked?: boolean;
  disabled?: boolean;
  metaData: DataCubeMetadata;
}) => {
  const fieldProps = useTableColumnGroupHiddenField({
    field,
    path,
    metaData,
  });

  return (
    <Checkbox
      disabled={disabled}
      label={label}
      {...fieldProps}
      checked={fieldProps.checked ?? defaultChecked}
    ></Checkbox>
  );
};

export const TableColumnOptions = ({
  state,
  metaData,
}: {
  state: ConfiguratorStateConfiguringChart;
  metaData: DataCubeMetadata;
}) => {
  const { activeField, chartConfig } = state;

  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (panelRef && panelRef.current) {
      panelRef.current.focus();
    }
  }, [activeField]);

  if (!activeField || chartConfig.chartType !== "table") {
    return null;
  }

  if (activeField === "table-settings") {
    return <TableSettings />;
  }
  if (activeField === "table-sorting") {
    return <TableSorting state={state} metaData={metaData} />;
  }

  const activeFieldComponentIri = chartConfig.fields[activeField]?.componentIri;
  // It's a dimension which is not mapped to an encoding field, so we show the filter!
  // FIXME: activeField and encodingField should match? to remove type assertion
  if (!activeFieldComponentIri) {
    return <TableSingleFilter state={state} metaData={metaData} />;
  }

  // Active field is always a component IRI, like in filters
  const component = [...metaData.dimensions, ...metaData.measures].find(
    (d) => d.iri === activeField
  );

  if (!component) {
    return <div>`No component ${activeField}`</div>;
  }

  const { isGroup, isFiltered } = chartConfig.fields[activeField];

  return (
    <I18n>
      {({ i18n }) => {
        const columnStyleOptions =
          component.__typename === "NominalDimension" ||
          component.__typename === "OrdinalDimension" ||
          component.__typename === "TemporalDimension"
            ? [
                { value: "text", label: i18n._(t("columnStyle.text")`Text`) },
                {
                  value: "category",
                  label: i18n._(t("columnStyle.categories")`Categories`),
                },
              ]
            : [
                { value: "text", label: i18n._(t("columnStyle.text")`Text`) },
                {
                  value: "heatmap",
                  label: i18n._(t("columnStyle.heatmap")`Heat Map`),
                },
                {
                  value: "bar",
                  label: i18n._(t("columnStyle.bar")`Bar Chart`),
                },
              ];

        return (
          <div
            key={`control-panel-table-column-${activeField}`}
            role="tabpanel"
            id={`control-panel-table-column-${activeField}`}
            aria-labelledby={`tab-${activeField}`}
            ref={panelRef}
            tabIndex={-1}
          >
            <ControlSection>
              <SectionTitle iconName={"table"}>{component.label}</SectionTitle>
              <ControlSectionContent side="right">
                {component.__typename !== "Measure" && (
                  <>
                    <ChartOptionGroupHiddenField
                      label={
                        <Trans id="controls.table.column.hidefilter">
                          Hide and filter
                        </Trans>
                      }
                      field={activeField}
                      path="isFiltered"
                      metaData={metaData}
                    />
                    <ChartOptionGroupHiddenField
                      label={
                        <Trans id="controls.table.column.group">
                          Use to group
                        </Trans>
                      }
                      field={activeField}
                      disabled={isFiltered}
                      path="isGroup"
                      metaData={metaData}
                    />
                    <Box sx={{ pl: 6, ml: "-2px" }}>
                      <ChartOptionGroupHiddenField
                        label={
                          <Trans id="controls.table.column.hide">
                            Hide column
                          </Trans>
                        }
                        disabled={!isGroup || isFiltered}
                        field={activeField}
                        path="isHidden"
                        metaData={metaData}
                      />
                    </Box>
                  </>
                )}

                {component.__typename === "Measure" && (
                  <ChartOptionGroupHiddenField
                    label={
                      <Trans id="controls.table.column.hide">Hide column</Trans>
                    }
                    field={activeField}
                    path="isHidden"
                    metaData={metaData}
                  />
                )}
              </ControlSectionContent>
            </ControlSection>
            {!isFiltered && (
              <ControlSection>
                <SectionTitle iconName={"image"}>
                  <Trans id="controls.section.columnstyle">Column Style</Trans>
                </SectionTitle>
                <ControlSectionContent side="right">
                  <ChartOptionSelectField<ColumnStyle>
                    id={"columnStyle"}
                    label={
                      <Trans id="controls.select.columnStyle">
                        Column Style
                      </Trans>
                    }
                    options={columnStyleOptions}
                    getValue={(type) => {
                      switch (type) {
                        case "text":
                          return {
                            type: "text",
                            textStyle: "regular",
                            textColor: "#333",
                            columnColor: "#fff",
                          };
                        case "category":
                          return {
                            type: "category",
                            textStyle: "regular",
                            palette: getDefaultCategoricalPalette().value,
                            colorMapping: mapColorsToComponentValuesIris({
                              palette: getDefaultCategoricalPalette().value,
                              component: component as DimensionFieldsWithValuesFragment,
                            }),
                          };
                        case "heatmap":
                          return {
                            type: "heatmap",
                            textStyle: "regular",
                            palette: getDefaultSequentialPalette().value,
                          };
                        case "bar":
                          return {
                            type: "bar",
                            textStyle: "regular",
                            barColorPositive: getDefaultCategoricalPalette()
                              .colors[0],
                            barColorNegative: getDefaultCategoricalPalette()
                              .colors[1],
                            barColorBackground: "#ccc",
                            barShowBackground: false,
                          };
                        default:
                          return undefined;
                      }
                    }}
                    getKey={(d) => d.type}
                    field={activeField}
                    path="columnStyle"
                  />

                  <ColumnStyleSubOptions
                    chartConfig={chartConfig}
                    activeField={activeField}
                    component={component as DimensionFieldsWithValuesFragment}
                  />
                </ControlSectionContent>
              </ControlSection>
            )}

            {(component.__typename === "NominalDimension" ||
              component.__typename === "OrdinalDimension" ||
              component.__typename === "TemporalDimension") && (
              <ControlSection>
                <SectionTitle disabled={!component} iconName="filter">
                  <Trans id="controls.section.filter">Filter</Trans>
                </SectionTitle>
                <ControlSectionContent side="right" as="fieldset">
                  <legend style={{ display: "none" }}>
                    <Trans id="controls.section.filter">Filter</Trans>
                  </legend>
                  {isFiltered ? (
                    <DimensionValuesSingleFilter
                      dataSetIri={metaData.iri}
                      dimensionIri={component.iri}
                    />
                  ) : (
                    <DimensionValuesMultiFilter
                      key={component.iri}
                      dimensionIri={component.iri}
                      dataSetIri={metaData.iri}
                      colorConfigPath="columnStyle"
                    />
                  )}
                </ControlSectionContent>
              </ControlSection>
            )}
          </div>
        );
      }}
    </I18n>
  );
};

const ColumnStyleSubOptions = ({
  chartConfig,
  activeField,
  component,
}: {
  chartConfig: TableConfig;
  activeField: string;
  component: DimensionFieldsWithValuesFragment;
}) => {
  const type = chartConfig.fields[activeField].columnStyle.type;
  return (
    <I18n>
      {({ i18n }) => {
        return (
          <>
            <ChartOptionSelectField<string>
              id="columnStyle.textStyle"
              label={
                <Trans id="controls.select.columnStyle.textStyle">
                  Text Style
                </Trans>
              }
              options={[
                {
                  value: "regular",
                  label: i18n._(t("columnStyle.textStyle.regular")`Regular`),
                },
                {
                  value: "bold",
                  label: i18n._(t("columnStyle.textStyle.bold")`Bold`),
                },
              ]}
              field={activeField}
              path="columnStyle.textStyle"
            />
            {type === "text" ? (
              <>
                <ColorPickerField
                  label={
                    <Trans id="controls.select.columnStyle.textColor">
                      Text Color
                    </Trans>
                  }
                  field={activeField}
                  path="columnStyle.textColor"
                />
                <ColorPickerField
                  label={
                    <Trans id="controls.select.columnStyle.columnColor">
                      Column Background
                    </Trans>
                  }
                  field={activeField}
                  path="columnStyle.columnColor"
                />
              </>
            ) : type === "category" ? (
              <>
                <ColorPalette
                  field={activeField}
                  colorConfigPath={"columnStyle"}
                  component={component}
                />
              </>
            ) : type === "heatmap" ? (
              <>
                <ColorPalette
                  field={activeField}
                  colorConfigPath={"columnStyle"}
                  component={component}
                />
              </>
            ) : type === "bar" ? (
              <>
                <ColorPickerField
                  label={
                    <Trans id="controls.select.columnStyle.barColorPositive">
                      Positive Bar Color
                    </Trans>
                  }
                  field={activeField}
                  path="columnStyle.barColorPositive"
                />
                <ColorPickerField
                  label={
                    <Trans id="controls.select.columnStyle.barColorNegative">
                      Negative Bar Color
                    </Trans>
                  }
                  field={activeField}
                  path="columnStyle.barColorNegative"
                />
                <ColorPickerField
                  label={
                    <Trans id="controls.select.columnStyle.barColorBackground">
                      Bar Background
                    </Trans>
                  }
                  field={activeField}
                  path="columnStyle.barColorBackground"
                />
                <ChartOptionCheckboxField
                  label={
                    <Trans id="controls.select.columnStyle.barShowBackground">
                      Show Bar Background
                    </Trans>
                  }
                  field={activeField}
                  path="columnStyle.barShowBackground"
                />
              </>
            ) : null}
          </>
        );
      }}
    </I18n>
  );
};

const TableSingleFilter = ({
  state,
  metaData,
}: {
  state: ConfiguratorStateConfiguringChart;
  metaData: DataCubeMetadata;
}) => {
  const { dimensions } = metaData;
  const activeDimension = dimensions.find(
    (dim) => dim.iri === state.activeField
  );
  const panelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (panelRef && panelRef.current) {
      panelRef.current.focus();
    }
  }, [state.activeField]);
  return (
    <div
      key={`filter-panel-${state.activeField}`}
      role="tabpanel"
      id={`filter-panel-${state.activeField}`}
      aria-labelledby={`tab-${state.activeField}`}
      ref={panelRef}
      tabIndex={-1}
    >
      <ControlSection>
        <SectionTitle iconName="table">
          {activeDimension && activeDimension.label}
        </SectionTitle>
        <ControlSectionContent side="right" as="fieldset">
          <legend style={{ display: "none" }}>
            {activeDimension && activeDimension.label}
          </legend>
          {activeDimension && (
            <DimensionValuesSingleFilter
              dataSetIri={metaData.iri}
              dimensionIri={activeDimension.iri}
            />
          )}
        </ControlSectionContent>
      </ControlSection>
    </div>
  );
};

const TableSettings = () => {
  return (
    <ControlSection>
      <SectionTitle iconName={"table"}>
        <Trans id="controls.section.tableSettings">Table Settings</Trans>
      </SectionTitle>
      <ControlSectionContent side="right">
        <ChartOptionCheckboxField
          label={
            <Trans id="controls.tableSettings.showSearch">Show Search</Trans>
          }
          field={null}
          path="settings.showSearch"
        />
      </ControlSectionContent>
    </ControlSection>
  );
};

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
      console.log(e.currentTarget.value);
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
          {component.label}
        </Text>
        <Flex sx={{ mt: 2, mb: -1, width: "100%", alignItems: "center" }}>
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
              sx={{ borderRadius: "circle", bg: "monochrome600" }}
            >
              <Icon name="clear" size={20} />
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
  const options = useMemo(() => {
    const columns = getOrderedTableColumns(chartConfig.fields);

    return [
      { value: "-", label: "Add a dimension …", disabled: true },
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
  }, [chartConfig, metaData]);

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

  return (
    <Box
      sx={{
        py: 4,
        px: 4,
        borderTopColor: "monochrome500",
        borderTopStyle: "solid",
        borderTopWidth: 1,
      }}
    >
      <Select
        id="add-tablesorting"
        value="-"
        options={options}
        label="Sort by"
        onChange={onChange}
      />
    </Box>
  );
};

const TableSorting = ({
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
        <SectionTitle iconName={"table"}>
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
                <AddTableSortingOption
                  metaData={metaData}
                  chartConfig={chartConfig}
                />
              </Box>
            );
          }}
        </Droppable>
      </ControlSection>
    </DragDropContext>
  );
};
