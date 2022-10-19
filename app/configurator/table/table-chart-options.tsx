import { t, Trans } from "@lingui/macro";
import { Box } from "@mui/material";
import get from "lodash/get";
import React, { ChangeEvent, useCallback, useEffect, useRef } from "react";

import { Checkbox } from "@/components/form";
import { ColorPalette } from "@/configurator/components/chart-controls/color-palette";
import {
  ControlSection,
  ControlSectionContent,
  SectionTitle,
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
import {
  getDefaultCategoricalPalette,
  getDefaultDivergingSteppedPalette,
  getIconName,
  mapValueIrisToColor,
} from "@/configurator/components/ui-helpers";
import { FieldProps } from "@/configurator/config-form";
import {
  ColumnStyle,
  ConfiguratorStateConfiguringChart,
  isTableConfig,
  TableConfig,
} from "@/configurator/config-types";
import { useConfiguratorState } from "@/configurator/configurator-state";
import { TableSortingOptions } from "@/configurator/table/table-chart-sorting-options";
import {
  updateIsGroup,
  updateIsHidden,
} from "@/configurator/table/table-config-state";
import { canDimensionBeMultiFiltered } from "@/domain/data";
import { DimensionMetadataFragment } from "@/graphql/query-hooks";
import { DataCubeMetadata } from "@/graphql/types";

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
    return <TableSortingOptions state={state} metaData={metaData} />;
  }

  const activeFieldComponentIri = chartConfig.fields[activeField]?.componentIri;
  // It's a dimension which is not mapped to an encoding field, so we show the filter!
  // FIXME: activeField and encodingField should match? to remove type assertion
  if (!activeFieldComponentIri) {
    return null;
  }

  // Active field is always a component IRI, like in filters
  const component =
    metaData.dimensions.find((d) => d.iri === activeField) ??
    metaData.measures.find((d) => d.iri === activeField);

  if (!component) {
    return <div>`No component ${activeField}`</div>;
  }

  const { isGroup, isHidden } = chartConfig.fields[activeField];

  const columnStyleOptions =
    component.__typename === "NominalDimension" ||
    component.__typename === "OrdinalDimension" ||
    component.__typename === "TemporalDimension"
      ? [
          {
            value: "text",
            label: t({ id: "columnStyle.text", message: `Text` }),
          },
          {
            value: "category",
            label: t({ id: "columnStyle.categories", message: `Categories` }),
          },
        ]
      : [
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
        <SectionTitle
          iconName={getIconName(`tableColumn${component.__typename}`)}
        >
          {component.label}
        </SectionTitle>
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
        <ControlSection>
          <SectionTitle iconName="formatting" sx={{ mb: 1 }}>
            <Trans id="controls.section.columnstyle">Column Style</Trans>
          </SectionTitle>
          <ControlSectionContent>
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
                    return {
                      type: "category",
                      textStyle: "regular",
                      palette: getDefaultCategoricalPalette().value,
                      colorMapping: mapValueIrisToColor({
                        palette: getDefaultCategoricalPalette().value,
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
      {canDimensionBeMultiFiltered(component) ? (
        <ControlSection>
          <SectionTitle disabled={!component} iconName="filter">
            <Trans id="controls.section.filter">Filter</Trans>
          </SectionTitle>
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
                dimensionIri={component.iri}
                dataSetIri={metaData.iri}
                colorConfigPath="columnStyle"
              />
            )}
          </ControlSectionContent>
        </ControlSection>
      ) : component.__typename === "TemporalDimension" ? (
        <ControlSection>
          <SectionTitle disabled={!component} iconName="filter">
            <Trans id="controls.section.filter">Filter</Trans>
          </SectionTitle>
          <ControlSectionContent component="fieldset">
            <legend style={{ display: "none" }}>
              <Trans id="controls.section.filter">Filter</Trans>
            </legend>
            {component.isKeyDimension && isHidden && !isGroup ? (
              <DataFilterSelectTime
                dimensionIri={component.iri}
                label={component.label}
                from={component.values[0].value}
                to={component.values[1].value}
                timeUnit={component.timeUnit}
                timeFormat={component.timeFormat}
                disabled={false}
                id={`select-single-filter-time`}
              />
            ) : (
              <TimeFilter
                key={component.iri}
                dimensionIri={component.iri}
                dataSetIri={metaData.iri}
              />
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
      <SectionTitle iconName="settings">
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
