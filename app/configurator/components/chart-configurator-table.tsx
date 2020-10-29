import { Trans } from "@lingui/macro";
import React, { useCallback } from "react";
import {
  DragDropContext,
  DraggableLocation,
  OnDragEndResponder,
} from "react-beautiful-dnd";
import { ConfiguratorStateConfiguringChart } from "..";
import { getFieldComponentIris } from "../../charts";
import { Loading } from "../../components/hint";
import { useDataCubeMetadataWithComponentValuesQuery } from "../../graphql/query-hooks";
import { useLocale } from "../../locales/use-locale";
import { GenericFields, TableFields } from "../config-types";
import { useConfiguratorState } from "../configurator-state";
import { TabDropZone } from "./chart-controls/drag-and-drop-tab";
import {
  ControlSection,
  ControlSectionContent,
  SectionTitle,
} from "./chart-controls/section";
import { FilterTabField } from "./field";

const reorderFields = ({
  fields,
  source,
  destination,
}: {
  fields: TableFields;
  source: DraggableLocation;
  destination: DraggableLocation;
}): TableFields => {
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

      const fields = reorderFields({
        fields: state.chartConfig.fields as TableFields,
        source,
        destination,
      });

      dispatch({
        type: "CHART_FIELDS_CHANGED",
        value: {
          fields: fields as GenericFields,
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

    const fields = state.chartConfig.fields as TableFields;

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
          <TabDropZone
            id="groups"
            title={<Trans id="controls.section.groups">Groups</Trans>}
            metaData={data.dataCubeByIri}
            items={Object.entries(fields).flatMap(([key, field]) => {
              return field.isGroup ? [{ iri: field.componentIri }] : [];
            })}
          ></TabDropZone>

          <TabDropZone
            id="columns"
            title={<Trans id="controls.section.columns">Columns</Trans>}
            metaData={data.dataCubeByIri}
            items={Object.entries(fields).flatMap(([key, field]) => {
              return !field.isGroup ? [{ iri: field.componentIri }] : [];
            })}
          ></TabDropZone>
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
