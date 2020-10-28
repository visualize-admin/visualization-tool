import { Trans } from "@lingui/macro";
import React, { useCallback } from "react";
import { ChartConfig, ConfiguratorStateConfiguringChart } from "..";
import { chartConfigOptionsUISpec } from "../../charts/chart-config-ui-options";
import { getFieldComponentIris } from "../../charts";
import { useDataCubeMetadataWithComponentValuesQuery } from "../../graphql/query-hooks";
import { DataCubeMetadata } from "../../graphql/types";
import { useLocale } from "../../locales/use-locale";
import {
  ControlSection,
  ControlSectionContent,
  SectionTitle,
} from "./chart-controls/section";
import { ControlTabField, FilterTabField } from "./field";
import { Loading } from "../../components/hint";
import { TabDropZone } from "./chart-controls/drag-and-drop-tab";
import {
  DragDropContext,
  DraggableLocation,
  OnDragEndResponder,
} from "react-beautiful-dnd";
import { useConfiguratorState } from "../configurator-state";
import { string } from "io-ts";
import { number } from "@lingui/core";
import { GenericField, GenericFields } from "../config-types";

type DropSection = "groups" | "columns";

const reorderFields = ({
  fields,
  source,
  destination,
}: {
  fields: GenericFields;
  source: DraggableLocation;
  destination: DraggableLocation;
}): GenericFields => {
  const fieldsArray = Object.values(fields); // We assume this is ordered?
  let groupFields = [...fieldsArray.filter((f) => f.isGroup)];
  let columnFields = [...fieldsArray.filter((f) => !f.isGroup)];

  let sourceFields =
    source.droppableId === "columns" ? columnFields : groupFields;
  let destinationFields =
    destination.droppableId === "columns" ? columnFields : groupFields;

  destinationFields.splice(
    destination.index,
    0,
    sourceFields.splice(source.index, 1)[0]
  );

  const allFields = [
    ...groupFields.map((f) => ({ ...f, isGroup: true })),
    ...columnFields.map((f) => ({ ...f, isGroup: false })),
  ];

  return Object.fromEntries(allFields.map((f, i) => [i, f]));
};

export const ChartConfiguratorTable = ({
  state,
}: {
  state: ConfiguratorStateConfiguringChart;
}) => {
  const locale = useLocale();
  const [{ data }] = useDataCubeMetadataWithComponentValuesQuery({
    variables: { iri: state.dataSet, locale },
  });

  const [, dispatch] = useConfiguratorState();

  const onDragEnd = useCallback<OnDragEndResponder>(
    ({ source, destination }) => {
      if (!destination) {
        return;
      }

      console.log(source.index, destination.index);

      if (destination.droppableId === "groups") {
        console.log("Grupss");
      }

      const fields = reorderFields({
        fields: state.chartConfig.fields,
        source,
        destination,
      });

      dispatch({
        type: "CHART_FIELDS_CHANGED",
        value: {
          fields,
        },
      });
    },
    [state, dispatch]
  );

  if (data?.dataCubeByIri) {
    const mappedIris = getFieldComponentIris(state.chartConfig.fields);
    const unMappedDimensions = data?.dataCubeByIri.dimensions.filter(
      (dim) => !mappedIris.has(dim.iri)
    );
    return (
      <>
        <ControlSection>
          <SectionTitle>
            <Trans id="controls.section.settings">Settings</Trans>
          </SectionTitle>
          <ControlSectionContent
            side="left"
            role="tablist"
            aria-labelledby="controls-settings"
          >
            settings and sorting
          </ControlSectionContent>
        </ControlSection>
        <DragDropContext onDragEnd={onDragEnd}>
          <ControlSection>
            <SectionTitle>
              <Trans id="controls.section.groups">Groups</Trans>
            </SectionTitle>
            <ControlSectionContent
              side="left"
              role="tablist"
              aria-labelledby="controls-groups"
            >
              <TabDropZone
                id="groups"
                items={Object.entries(state.chartConfig.fields).flatMap(
                  ([i, field]) => {
                    return field?.isGroup ? [{ id: field?.componentIri }] : [];
                  }
                )}
              ></TabDropZone>
            </ControlSectionContent>
          </ControlSection>
          <ControlSection>
            <SectionTitle>
              <Trans id="controls.section.columns">Columns</Trans>
            </SectionTitle>
            <ControlSectionContent
              side="left"
              role="tablist"
              aria-labelledby="controls-columns"
            >
              <TabDropZone
                id="columns"
                items={Object.entries(state.chartConfig.fields).flatMap(
                  ([i, field]) => {
                    return !field?.isGroup ? [{ id: field?.componentIri }] : [];
                  }
                )}
              ></TabDropZone>
            </ControlSectionContent>
          </ControlSection>
        </DragDropContext>

        <ControlSection>
          <SectionTitle>
            <Trans id="controls.section.filters">Filters</Trans>
          </SectionTitle>
          <ControlSectionContent
            side="left"
            role="tablist"
            aria-labelledby="controls-filters"
          >
            {unMappedDimensions.map((dimension, i) => (
              <FilterTabField
                key={dimension.iri}
                component={dimension}
                value={dimension.iri}
              ></FilterTabField>
            ))}
          </ControlSectionContent>
        </ControlSection>
      </>
    );
  } else {
    return <Loading />;
  }
};

const ChartFields = ({
  chartConfig,
  metaData,
}: {
  chartConfig: ChartConfig;
  metaData: DataCubeMetadata;
}) => {
  const { dimensions, measures } = metaData;

  const components = [...dimensions, ...measures];

  const { chartType } = chartConfig;
  return (
    <>
      {chartConfigOptionsUISpec[chartType].encodings.map((encoding) => {
        const encodingField = encoding.field;

        return (
          <ControlTabField
            key={encoding.field}
            component={components.find(
              (d) =>
                d.iri ===
                chartConfig.fields[encodingField as "y" | "segment"]
                  ?.componentIri
            )}
            value={encoding.field}
            labelId={`${chartConfig.chartType}.${encoding.field}`}
          />
        );
      })}
    </>
  );
};
