import { t, Trans } from "@lingui/macro";
import { Alert, Box, Typography } from "@mui/material";
import get from "lodash/get";
import { ChangeEvent, useCallback } from "react";

import { Checkbox } from "@/components/form";
import {
  ColumnStyle,
  ConfiguratorStateConfiguringChart,
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
import { useConfiguratorState } from "@/configurator/configurator-state";
import { TableSortingOptions } from "@/configurator/table/table-chart-sorting-options";
import {
  updateIsGroup,
  updateIsHidden,
} from "@/configurator/table/table-config-state";
import {
  canDimensionBeMultiFiltered,
  isNumericalMeasure,
  isStandardErrorDimension,
  isTemporalDimension,
} from "@/domain/data";
import { DimensionMetadataFragment } from "@/graphql/query-hooks";
import {
  DataCubeMetadata,
  DataCubeMetadataWithHierarchies,
} from "@/graphql/types";
import {
  getDefaultCategoricalPalette,
  getDefaultCategoricalPaletteName,
  getDefaultDivergingSteppedPalette,
} from "@/palettes";

const useTableColumnGroupHiddenField = ({
  path,
  field,
  metaData,
}: {
  path: "isGroup" | "isHidden";
  field: string;
  metaData: DataCubeMetadata;
}): FieldProps => {
  const [state, dispatch] = useConfiguratorState();

  const onChange = useCallback<(e: ChangeEvent<HTMLInputElement>) => void>(
    (e) => {
      if (
        state.state === "CONFIGURING_CHART" &&
        isTableConfig(state.chartConfig)
      ) {
        const updater = path === "isGroup" ? updateIsGroup : updateIsHidden;
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
  label: string;
  field: string;
  path: "isGroup" | "isHidden";
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
  metaData: DataCubeMetadataWithHierarchies;
}) => {
  const { activeField, chartConfig } = state;

  if (!activeField || chartConfig.chartType !== "table") {
    return null;
  }

  if (activeField === "table-settings") {
    return <TableSettings />;
  }
  if (activeField === "table-sorting") {
    return <TableSortingOptions state={state} dataSetMetadata={metaData} />;
  }

  const activeFieldComponentIri = chartConfig.fields[activeField]?.componentIri;
  // It's a dimension which is not mapped to an encoding field, so we show the filter!
  // FIXME: activeField and encodingField should match? to remove type assertion
  if (!activeFieldComponentIri) {
    return null;
  }

  // Active field is always a component IRI, like in filters
  const allComponents = [...metaData.dimensions, ...metaData.measures];
  const component = allComponents.find((d) => d.iri === activeField);

  if (!component) {
    return (
      <Alert icon={false} severity="error">
        <Typography variant="body2">No component {activeField}</Typography>
      </Alert>
    );
  }

  const { isGroup, isHidden } = chartConfig.fields[activeField];

  const columnStyleOptions = isNumericalMeasure(component)
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
    : isTemporalDimension(component)
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
              metaData={metaData}
            />
          )}
          <ChartOptionGroupHiddenField
            label={t({
              id: "controls.table.column.hide",
              message: "Hide column",
            })}
            field={activeField}
            path="isHidden"
            metaData={metaData}
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
                        dimensionValues: (
                          component as DimensionMetadataFragment
                        )?.values,
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
              component={component as DimensionMetadataFragment}
            />
          </ControlSectionContent>
        </ControlSection>
      )}
      {canDimensionBeMultiFiltered(component) &&
      !isStandardErrorDimension(component) ? (
        <ControlSection collapse>
          <SubsectionTitle disabled={!component} iconName="filter">
            <Trans id="controls.section.filter">Filter</Trans>
          </SubsectionTitle>
          <ControlSectionContent component="fieldset">
            <legend style={{ display: "none" }}>
              <Trans id="controls.section.filter">Filter</Trans>
            </legend>
            {component.isKeyDimension && isHidden && !isGroup ? (
              <DimensionValuesSingleFilter
                dataSetIri={metaData.iri}
                dimensionIri={component.iri}
              />
            ) : (
              <DimensionValuesMultiFilter
                key={component.iri}
                field={component.iri}
                dimensionIri={component.iri}
                dataSetIri={metaData.iri}
                colorComponent={component}
                colorConfigPath="columnStyle"
              />
            )}
          </ControlSectionContent>
        </ControlSection>
      ) : isTemporalDimension(component) ? (
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
  activeField: string;
  component: DimensionMetadataFragment;
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
