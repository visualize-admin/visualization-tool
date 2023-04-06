import { Trans } from "@lingui/macro";
import { Theme, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { useCallback, useState } from "react";
import {
  DragDropContext,
  OnDragEndResponder,
  OnDragStartResponder,
} from "react-beautiful-dnd";

import { Loading } from "@/components/hint";
import { ConfiguratorStateConfiguringChart } from "@/configurator";
import { TabDropZone } from "@/configurator/components/chart-controls/drag-and-drop-tab";
import {
  ControlSection,
  ControlSectionContent,
  SectionTitle,
} from "@/configurator/components/chart-controls/section";
import { AnnotatorTabField } from "@/configurator/components/field";
import { useOrderedTableColumns } from "@/configurator/components/ui-helpers";
import { TableFields } from "@/configurator/config-types";
import { useConfiguratorState } from "@/configurator/configurator-state";
import { moveFields } from "@/configurator/table/table-config-state";
import { useDataCubeMetadataWithComponentValuesAndHierarchiesQuery } from "@/graphql/query-hooks";
import { useLocale } from "@/locales/use-locale";

import { ChartTypeSelector } from "../components/chart-type-selector";

const useStyles = makeStyles((theme: Theme) => ({
  emptyGroups: {
    textAlign: "center",
    border: "1px dashed",
    borderColor: theme.palette.divider,
    margin: theme.spacing(2),
    color: theme.palette.text.secondary,
    borderRadius: 8,
    padding: theme.spacing(2),
  },
}));

const EmptyGroups = () => {
  const classes = useStyles();
  return (
    <Typography variant="body2" component="div" className={classes.emptyGroups}>
      <Trans id="controls.groups.empty-help">
        Drag and drop columns here to make groups.
      </Trans>
    </Typography>
  );
};

export const ChartConfiguratorTable = ({
  state,
}: {
  state: ConfiguratorStateConfiguringChart;
}) => {
  const locale = useLocale();
  const [{ data }] = useDataCubeMetadataWithComponentValuesAndHierarchiesQuery({
    variables: {
      iri: state.dataSet,
      sourceType: state.dataSource.type,
      sourceUrl: state.dataSource.url,
      locale,
    },
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

  const fields = state.chartConfig.fields as TableFields;
  const fieldsArray = useOrderedTableColumns(fields);

  if (data?.dataCubeByIri) {
    const groupFields = [...fieldsArray.filter((f) => f.isGroup)];
    const columnFields = [...fieldsArray.filter((f) => !f.isGroup)];

    const currentDraggedField =
      currentDraggableId !== null ? fields[currentDraggableId] : null;
    const isGroupsDropDisabled =
      currentDraggedField?.componentType === "NumericalMeasure";

    return (
      <>
        <ControlSection collapse>
          <SectionTitle titleId="controls-design" gutterBottom={false}>
            <Trans id="controls.select.chart.type">Chart Type</Trans>
          </SectionTitle>
          <ControlSectionContent px="small" gap="none">
            <ChartTypeSelector showHelp={false} state={state} sx={{ mt: 2 }} />
          </ControlSectionContent>
        </ControlSection>
        <ControlSection collapse>
          <SectionTitle gutterBottom={false}>
            <Trans id="controls.section.tableoptions">Table Options</Trans>
          </SectionTitle>
          <ControlSectionContent
            px="small"
            gap="none"
            role="tablist"
            aria-labelledby="controls-settings"
          >
            <AnnotatorTabField
              key={"settings"}
              value={"table-settings"}
              icon="settings"
              mainLabel={<Trans id="controls.table.settings">Settings</Trans>}
            />
            <AnnotatorTabField
              key={"sorting"}
              value={"table-sorting"}
              icon="sort"
              mainLabel={<Trans id="controls.table.sorting">Sorting</Trans>}
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
            emptyComponent={<EmptyGroups />}
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
