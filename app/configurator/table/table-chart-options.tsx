import { Trans } from "@lingui/react";
import get from "lodash/get";
import React, {
  ChangeEvent,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { Checkbox } from "../../components/form";
import { DataCubeMetadata } from "../../graphql/types";
import {
  ControlSection,
  ControlSectionContent,
  SectionTitle,
} from "../components/chart-controls/section";
import { ChartOptionSelectField, ColorPickerField } from "../components/field";
import { DimensionValuesMultiFilter } from "../components/filters";
import { FieldProps } from "../config-form";
import {
  ColumnStyle,
  ConfiguratorStateConfiguringChart,
  TableConfig,
} from "../config-types";
import { useConfiguratorState } from "../configurator-state";
import { updateIsGroup, updateIsHidden } from "./table-config-state";

const useTableColumnOptionField = ({
  path,
  field,
}: {
  path: "isGroup" | "isHidden";
  field: string;
}): FieldProps => {
  const [state, dispatch] = useConfiguratorState();

  const onChange = useCallback<(e: ChangeEvent<HTMLInputElement>) => void>(
    (e) => {
      if (
        state.state === "CONFIGURING_CHART" &&
        state.chartConfig.chartType === "table"
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
          },
        });
      }
    },
    [state, path, field, dispatch]
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

const ChartOptionCheckboxField = ({
  label,
  field,
  path,
  defaultChecked,
  disabled = false,
}: {
  label: string | ReactNode;
  field: string;
  path: "isGroup" | "isHidden";
  defaultChecked?: boolean;
  disabled?: boolean;
}) => {
  const fieldProps = useTableColumnOptionField({
    field,
    path,
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
  const { activeField } = state;

  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (panelRef && panelRef.current) {
      panelRef.current.focus();
    }
  }, [activeField]);

  if (!activeField) {
    return null;
  }

  // Active field is always a component IRI, like in filters
  const component = [...metaData.dimensions, ...metaData.measures].find(
    (d) => d.iri === activeField
  );

  if (!component) {
    return <div>`No component ${activeField}`</div>;
  }

  if (state.chartConfig.chartType !== "table") {
    return null;
  }

  const columnStyleOptions =
    component.__typename === "NominalDimension" ||
    component.__typename === "OrdinalDimension" ||
    component.__typename === "TemporalDimension"
      ? [
          { value: "text", label: "text" },
          { value: "category", label: "category" },
        ]
      : [
          { value: "text", label: "text" },
          { value: "heatmap", label: "heatmap" },
          { value: "bar", label: "bar" },
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
        <SectionTitle iconName={"table"}>
          <Trans id="controls.section.table.column">Column</Trans>
        </SectionTitle>
        <ControlSectionContent side="right">
          {component.__typename !== "Measure" && (
            <ChartOptionCheckboxField
              label={
                <Trans id="controls.table.column.group">Use to group</Trans>
              }
              field={activeField}
              path="isGroup"
            />
          )}

          {component.__typename === "Measure" && (
            <ChartOptionCheckboxField
              label={<Trans id="controls.table.column.hide">Hide column</Trans>}
              field={activeField}
              path="isHidden"
            />
          )}
        </ControlSectionContent>
      </ControlSection>

      <ControlSection>
        <SectionTitle iconName={"image"}>
          <Trans id="controls.section.columnstyle">Column Style</Trans>
        </SectionTitle>
        <ControlSectionContent side="right">
          <ChartOptionSelectField<ColumnStyle>
            id={"columnStyle"}
            label={<Trans id="controls.select.columnStyle">Column Style</Trans>}
            options={columnStyleOptions}
            getValue={(type) => {
              switch (type) {
                case "text":
                  return {
                    type: "text",
                    textStyle: "regular",
                    textColor: "text",
                    columnColor: "transparent",
                  };
                case "category":
                  return {
                    type: "category",
                    textStyle: "regular",
                    palette: "set3",
                    colorMapping: {},
                  };
                case "heatmap":
                  return {
                    type: "heatmap",
                    textStyle: "regular",
                    palette: "viridis",
                  };
                case "bar":
                  return {
                    type: "bar",
                    textStyle: "regular",
                    barColorPositive: "blue",
                    barColorNegative: "red",
                    barColorBackground: "red",
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
            chartConfig={state.chartConfig}
            activeField={activeField}
          />
        </ControlSectionContent>
      </ControlSection>

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
            {component && (
              <DimensionValuesMultiFilter
                key={component.iri}
                dimensionIri={component.iri}
                dataSetIri={metaData.iri}
              />
            )}
          </ControlSectionContent>
        </ControlSection>
      )}
    </div>
  );
};

const ColumnStyleSubOptions = ({
  chartConfig,
  activeField,
}: {
  chartConfig: TableConfig;
  activeField: string;
}) => {
  const type = chartConfig.fields[activeField].columnStyle.type;

  return (
    <>
      <ChartOptionSelectField<string>
        id="columnStyle.textStyle"
        label={
          <Trans id="controls.select.columnStyle.textStyle">Text Style</Trans>
        }
        options={[
          { value: "regular", label: "regular" },
          { value: "bold", label: "bold" },
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
                Column Color
              </Trans>
            }
            field={activeField}
            path="columnStyle.columnColor"
          />
        </>
      ) : type === "category" ? (
        <> cat optz </>
      ) : type === "heatmap" ? (
        <> heatmap optz</>
      ) : type === "bar" ? (
        <> bar optz</>
      ) : null}
    </>
  );
};
