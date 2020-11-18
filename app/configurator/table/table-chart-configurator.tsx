import { Trans } from "@lingui/macro";
import { useCallback, useState } from "react";
import {
  DragDropContext,
  OnDragEndResponder,
  OnDragStartResponder,
} from "react-beautiful-dnd";
import { ConfiguratorStateConfiguringChart } from "..";
import { Loading } from "../../components/hint";
import { useDataCubeMetadataWithComponentValuesQuery } from "../../graphql/query-hooks";
import { useLocale } from "../../locales/use-locale";
import { TabDropZone } from "../components/chart-controls/drag-and-drop-tab";
import {
  ControlSection,
  ControlSectionContent,
  SectionTitle,
} from "../components/chart-controls/section";
import { AnnotatorTabField } from "../components/field";
import { getOrderedTableColumns } from "../components/ui-helpers";
import { TableFields } from "../config-types";
import { useConfiguratorState } from "../configurator-state";
import { moveFields } from "./table-config-state";

export const ChartConfiguratorTable = ({
  state,
}: {
  state: ConfiguratorStateConfiguringChart;
}) => {
  const locale = useLocale();
  const [{ data }] = useDataCubeMetadataWithComponentValuesQuery({
    variables: { iri: state.dataSet, locale },
  });

  const metaData = data?.dataCubeByIri;

  const [, dispatch] = useConfiguratorState();

  const [currentDraggableId, setCurrentDraggableId] = useState<string | null>(
    null
  );

  const onDragEnd = useCallback<OnDragEndResponder>(
    ({ source, destination }) => {
      setCurrentDraggableId(null);

      if (
        !destination ||
        state.chartConfig.chartType !== "table" ||
        !metaData
      ) {
        return;
      }

      const chartConfig = moveFields(state.chartConfig, {
        source,
        destination,
      });

      dispatch({
        type: "CHART_CONFIG_REPLACED",
        value: {
          chartConfig,
          dataSetMetadata: metaData,
        },
      });
    },
    [state, dispatch, metaData]
  );

  const onDragStart = useCallback<OnDragStartResponder>(({ draggableId }) => {
    setCurrentDraggableId(draggableId);
  }, []);

  if (data?.dataCubeByIri) {
    const fields = state.chartConfig.fields as TableFields;

    const fieldsArray = getOrderedTableColumns(fields);
    const groupFields = [...fieldsArray.filter((f) => f.isGroup)];
    const columnFields = [...fieldsArray.filter((f) => !f.isGroup)];

    const currentDraggedField =
      currentDraggableId !== null ? fields[currentDraggableId] : null;
    const isGroupsDropDisabled =
      currentDraggedField?.componentType === "Measure";

    return (
      <>
        <ControlSection>
          <SectionTitle>
            <Trans id="controls.section.tableoptions">Table Options</Trans>
          </SectionTitle>
          <ControlSectionContent
            side="left"
            role="tablist"
            aria-labelledby="controls-settings"
          >
            <AnnotatorTabField
              key={"settings"}
              value={"table-settings"}
              icon="table"
              label={<Trans id="controls.table.settings">Settings</Trans>}
            />
            <AnnotatorTabField
              key={"sorting"}
              value={"table-sorting"}
              icon="sort"
              label={<Trans id="controls.table.sorting">Sorting</Trans>}
            />
          </ControlSectionContent>
        </ControlSection>
        <DragDropContext onDragEnd={onDragEnd} onDragStart={onDragStart}>
          <TabDropZone
            id="groups"
            title={<Trans id="controls.section.groups">Groups</Trans>}
            metaData={data.dataCubeByIri}
            items={groupFields}
            isDropDisabled={isGroupsDropDisabled}
          ></TabDropZone>

          <TabDropZone
            id="columns"
            title={<Trans id="controls.section.columns">Columns</Trans>}
            metaData={data.dataCubeByIri}
            items={columnFields}
          ></TabDropZone>
        </DragDropContext>
      </>
    );
  } else {
    return <Loading />;
  }
};
