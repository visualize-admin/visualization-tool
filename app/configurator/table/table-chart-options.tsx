import { t, Trans } from "@lingui/macro";
import { Alert, Box, Typography } from "@mui/material";
import get from "lodash/get";
import { ChangeEvent, useCallback } from "react";

import { EncodingFieldType } from "@/charts/chart-config-ui-options";
import { Checkbox } from "@/components/form";
import {
  ColumnStyle,
  ConfiguratorStateConfiguringChart,
  getChartConfig,
  isTableConfig,
  TableConfig,
} from "@/config-types";
import { ColorPalette } from "@/configurator/components/chart-controls/color-palette";
import {
  ControlSection,
  ControlSectionContent,
  SectionTitle,
  SubsectionTitle,
} from "@/configurator/components/chart-controls/section";
import {
  ChartOptionCheckboxField,
  ChartOptionSelectField,
  ColorPickerField,
  DataFilterSelectTime,
} from "@/configurator/components/field";
import {
  DimensionValuesMultiFilter,
  DimensionValuesSingleFilter,
  TimeFilter,
} from "@/configurator/components/filters";
import { mapValueIrisToColor } from "@/configurator/components/ui-helpers";
import { FieldProps } from "@/configurator/config-form";
import {
  isConfiguring,
  useConfiguratorState,
} from "@/configurator/configurator-state";
import { TableSortingOptions } from "@/configurator/table/table-chart-sorting-options";
import {
  updateIsGroup,
  updateIsHidden,
} from "@/configurator/table/table-config-state";
import {
  canDataCubeDimensionBeMultiFiltered,
  DataCubeComponent,
  DataCubeDimension,
  DataCubeMeasure,
  isDataCubeMeasure,
  isDataCubeNumericalMeasure,
  isDataCubeStandardErrorDimension,
  isDataCubeTemporalDimension,
} from "@/domain/data";
import { DataCubeMetadataQuery } from "@/graphql/query-hooks";
import {
  getDefaultCategoricalPalette,
  getDefaultCategoricalPaletteName,
  getDefaultDivergingSteppedPalette,
} from "@/palettes";

const useTableColumnGroupHiddenField = ({
  path,
  field,
  metadata,
  dimensions,
  measures,
}: {
  path: "isGroup" | "isHidden";
  field: string;
  metadata: DataCubeMetadataQuery["dataCubeByIri"];
  dimensions: DataCubeDimension[];
  measures: DataCubeMeasure[];
}): FieldProps => {
  const [state, dispatch] = useConfiguratorState(isConfiguring);
  const chartConfig = getChartConfig(state);
  const onChange = useCallback<(e: ChangeEvent<HTMLInputElement>) => void>(
    (e) => {
      if (!isTableConfig(chartConfig) || !metadata) {
        return;
      }

      const updater = path === "isGroup" ? updateIsGroup : updateIsHidden;
      const newChartConfig = updater(chartConfig, {
        field,
        value: e.currentTarget.checked,
      });

      dispatch({
        type: "CHART_CONFIG_REPLACED",
        value: {
          chartConfig: newChartConfig,
          dataCubeMetadata: metadata,
          dataCubesComponents: {
            dimensions,
            measures,
          },
        },
      });
    },
    [chartConfig, path, field, dispatch, metadata, dimensions, measures]
  );
  const stateValue = get(chartConfig, `fields["${field}"].${path}`, "");
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
  metadata,
  dimensions,
  measures,
}: {
  label: string;
  field: string;
  path: "isGroup" | "isHidden";
  defaultChecked?: boolean;
  disabled?: boolean;
  metadata: DataCubeMetadataQuery["dataCubeByIri"];
  dimensions: DataCubeDimension[];
  measures: DataCubeMeasure[];
}) => {
  const fieldProps = useTableColumnGroupHiddenField({
    field,
    path,
    metadata,
    dimensions,
    measures,
  });

  return (
    <Checkbox
      disabled={disabled}
      label={label}
      {...fieldProps}
      checked={fieldProps.checked ?? defaultChecked}
    />
  );
};

export const TableColumnOptions = ({
  state,
  metadata,
  dimensions,
  measures,
}: {
  state: ConfiguratorStateConfiguringChart;
  metadata: NonNullable<DataCubeMetadataQuery["dataCubeByIri"]>;
  dimensions: DataCubeDimension[];
  measures: DataCubeMeasure[];
}) => {
  const chartConfig = getChartConfig(state);
  const { activeField: _activeField } = chartConfig;
  const activeField = _activeField as EncodingFieldType | undefined;

  if (!activeField || chartConfig.chartType !== "table") {
    return null;
  }

  // FIXME: table encoding should be added to UI encodings
  // @ts-ignore
  if (activeField === "table-settings") {
    return <TableSettings />;
  }

  // FIXME: table encoding should be added to UI encodings
  // @ts-ignore
  if (activeField === "table-sorting") {
    return (
      <TableSortingOptions
        state={state}
        metadata={metadata}
        dimensions={dimensions}
        measures={measures}
      />
    );
  }

  const activeFieldComponentIri = chartConfig.fields[activeField]?.componentIri;
  // It's a dimension which is not mapped to an encoding field, so we show the filter!
  // FIXME: activeField and encodingField should match? to remove type assertion
  if (!activeFieldComponentIri) {
    return null;
  }

  // Active field is always a component IRI, like in filters
  const allComponents = [...dimensions, ...measures];
  const component = allComponents.find((d) => d.iri === activeField);

  if (!component) {
    return (
      <Alert icon={false} severity="error">
        <Typography variant="body2">No component {activeField}</Typography>
      </Alert>
    );
  }

  const { isGroup, isHidden } = chartConfig.fields[activeField];

  const columnStyleOptions = isDataCubeNumericalMeasure(component)
    ? [
        {
          value: "text",
          label: t({ id: "columnStyle.text", message: `Text` }),
        },
        {
          value: "heatmap",
          label: t({ id: "columnStyle.heatmap", message: `Heat Map` }),
        },
        {
          value: "bar",
          label: t({ id: "columnStyle.bar", message: `Bar Chart` }),
        },
      ]
    : isDataCubeTemporalDimension(component)
    ? [
        {
          value: "text",
          label: t({ id: "columnStyle.text", message: `Text` }),
        },
      ]
    : [
        {
          value: "text",
          label: t({ id: "columnStyle.text", message: `Text` }),
        },
        {
          value: "category",
          label: t({ id: "columnStyle.categories", message: `Categories` }),
        },
      ];

  return (
    <div
      key={`control-panel-table-column-${activeField}`}
      role="tabpanel"
      id={`control-panel-table-column-${activeField}`}
      aria-labelledby={`tab-${activeField}`}
      tabIndex={-1}
    >
      <ControlSection>
        <SectionTitle>{component.label}</SectionTitle>
        <ControlSectionContent>
          {component.__typename !== "NumericalMeasure" && (
            <ChartOptionGroupHiddenField
              label={t({
                id: "controls.table.column.group",
                message: "Use to group",
              })}
              field={activeField}
              path="isGroup"
              metadata={metadata}
              dimensions={dimensions}
              measures={measures}
            />
          )}
          <ChartOptionGroupHiddenField
            label={t({
              id: "controls.table.column.hide",
              message: "Hide column",
            })}
            field={activeField}
            path="isHidden"
            metadata={metadata}
            dimensions={dimensions}
            measures={measures}
          />
        </ControlSectionContent>
      </ControlSection>
      {(isGroup || !isHidden) && (
        <ControlSection collapse>
          <SubsectionTitle iconName="formatting">
            <Trans id="controls.section.columnstyle">Column Style</Trans>
          </SubsectionTitle>
          <ControlSectionContent sx={{ mt: 2 }}>
            <ChartOptionSelectField<ColumnStyle>
              id="columnStyle"
              label={t({
                id: "controls.select.columnStyle",
                message: "Column Style",
              })}
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
                    const palette = getDefaultCategoricalPaletteName(component);

                    return {
                      type: "category",
                      textStyle: "regular",
                      palette,
                      colorMapping: mapValueIrisToColor({
                        palette,
                        dimensionValues: component.values,
                      }),
                    };
                  case "heatmap":
                    return {
                      type: "heatmap",
                      textStyle: "regular",
                      palette: getDefaultDivergingSteppedPalette().value,
                    };
                  case "bar":
                    return {
                      type: "bar",
                      textStyle: "regular",
                      barColorPositive:
                        getDefaultCategoricalPalette().colors[0],
                      barColorNegative:
                        getDefaultCategoricalPalette().colors[1],
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
              component={component}
            />
          </ControlSectionContent>
        </ControlSection>
      )}
      {canDataCubeDimensionBeMultiFiltered(component) &&
      !isDataCubeStandardErrorDimension(component) ? (
        <ControlSection collapse>
          <SubsectionTitle disabled={!component} iconName="filter">
            <Trans id="controls.section.filter">Filter</Trans>
          </SubsectionTitle>
          <ControlSectionContent component="fieldset">
            <legend style={{ display: "none" }}>
              <Trans id="controls.section.filter">Filter</Trans>
            </legend>
            {component.isKeyDimension && isHidden && !isGroup ? (
              <DimensionValuesSingleFilter dimension={component} />
            ) : isDataCubeMeasure(component) ? null : (
              <DimensionValuesMultiFilter
                key={component.iri}
                field={component.iri}
                dimension={component}
                dataSetIri={metadata.iri}
                colorComponent={component}
                colorConfigPath="columnStyle"
              />
            )}
          </ControlSectionContent>
        </ControlSection>
      ) : isDataCubeTemporalDimension(component) ? (
        <ControlSection collapse>
          <SubsectionTitle disabled={!component} iconName="filter">
            <Trans id="controls.section.filter">Filter</Trans>
          </SubsectionTitle>
          <ControlSectionContent component="fieldset">
            <legend style={{ display: "none" }}>
              <Trans id="controls.section.filter">Filter</Trans>
            </legend>
            {component.isKeyDimension && isHidden && !isGroup ? (
              <DataFilterSelectTime
                dimension={component}
                label={component.label}
                from={`${component.values[0].value}`}
                to={`${
                  component.values[component.values.length - 1]?.value ??
                  component.values[0].value
                }`}
                timeUnit={component.timeUnit}
                timeFormat={component.timeFormat}
                disabled={false}
                id={`select-single-filter-time`}
              />
            ) : (
              <TimeFilter key={component.iri} dimension={component} />
            )}
          </ControlSectionContent>
        </ControlSection>
      ) : null}
    </div>
  );
};

const ColumnStyleSubOptions = ({
  chartConfig,
  activeField,
  component,
}: {
  chartConfig: TableConfig;
  activeField: EncodingFieldType;
  component: DataCubeComponent;
}) => {
  const type = chartConfig.fields[activeField].columnStyle.type;
  return (
    <>
      <ChartOptionSelectField<string>
        id="columnStyle.textStyle"
        label={t({
          id: "controls.select.columnStyle.textStyle",
          message: "Text Style",
        })}
        options={[
          {
            value: "regular",
            label: t({
              id: "columnStyle.textStyle.regular",
              message: `Regular`,
            }),
          },
          {
            value: "bold",
            label: t({ id: "columnStyle.textStyle.bold", message: `Bold` }),
          },
        ]}
        field={activeField}
        path="columnStyle.textStyle"
      />
      {type === "text" ? (
        <>
          <ColorPickerField
            label={t({
              id: "controls.select.columnStyle.textColor",
              message: "Text Color",
            })}
            field={activeField}
            path="columnStyle.textColor"
          />
          <ColorPickerField
            label={t({
              id: "controls.select.columnStyle.columnColor",
              message: "Column Background",
            })}
            field={activeField}
            path="columnStyle.columnColor"
          />
        </>
      ) : type === "category" ? (
        <>
          <ColorPalette
            field={activeField}
            colorConfigPath="columnStyle"
            component={component}
          />
        </>
      ) : type === "heatmap" ? (
        <>
          <ColorPalette
            field={activeField}
            colorConfigPath="columnStyle"
            component={component}
          />
        </>
      ) : type === "bar" ? (
        <Box my={2}>
          <ColorPickerField
            label={t({
              id: "controls.select.columnStyle.barColorPositive",
              message: "Positive Bar Color",
            })}
            field={activeField}
            path="columnStyle.barColorPositive"
          />
          <ColorPickerField
            label={t({
              id: "controls.select.columnStyle.barColorNegative",
              message: "Negative Bar Color",
            })}
            field={activeField}
            path="columnStyle.barColorNegative"
          />
          <ColorPickerField
            label={t({
              id: "controls.select.columnStyle.barColorBackground",
              message: "Bar Background",
            })}
            field={activeField}
            path="columnStyle.barColorBackground"
          />
          <ChartOptionCheckboxField
            label={t({
              id: "controls.select.columnStyle.barShowBackground",
              message: "Show Bar Background",
            })}
            field={activeField}
            path="columnStyle.barShowBackground"
          />
        </Box>
      ) : null}
    </>
  );
};

const TableSettings = () => {
  return (
    <ControlSection>
      <SectionTitle>
        <Trans id="controls.section.tableSettings">Table Settings</Trans>
      </SectionTitle>
      <ControlSectionContent>
        <ChartOptionCheckboxField
          label={t({
            id: "controls.tableSettings.showSearch",
            message: "Show Search",
          })}
          field={null}
          path="settings.showSearch"
        />
      </ControlSectionContent>
    </ControlSection>
  );
};
