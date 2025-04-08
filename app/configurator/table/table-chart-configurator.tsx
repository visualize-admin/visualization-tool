import { Trans } from "@lingui/macro";
import { Theme, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { DragDropContext } from "react-beautiful-dnd";

import { Loading } from "@/components/hint";
import { ConfiguratorStateConfiguringChart } from "@/configurator";
import { TabDropZone } from "@/configurator/components/chart-controls/drag-and-drop-tab";
import {
  ControlSection,
  ControlSectionContent,
  SectionTitle,
} from "@/configurator/components/chart-controls/section";
import { ChartTypeSelector } from "@/configurator/components/chart-type-selector";
import { DatasetsControlSection } from "@/configurator/components/dataset-control-section";
import { ChartAnnotatorTabField } from "@/configurator/components/field";
import { useOrderedTableColumns } from "@/configurator/components/ui-helpers";
import { useTableChartController } from "@/configurator/table/table-chart-configurator.hook";

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
  const {
    dimensions,
    measures,
    currentDraggableId,
    chartConfig,
    handleDragEnd,
    handleDragStart,
  } = useTableChartController(state);

  const fieldsArray = useOrderedTableColumns(chartConfig.fields);

  if (!dimensions || !measures) {
    return <Loading />;
  }

  const groupFields = [...fieldsArray.filter((f) => f.isGroup)];
  const columnFields = [...fieldsArray.filter((f) => !f.isGroup)];

  const currentDraggedField =
    currentDraggableId !== null ? chartConfig.fields[currentDraggableId] : null;
  const isGroupsDropDisabled =
    currentDraggedField?.componentType === "NumericalMeasure";

  return (
    <>
      <DatasetsControlSection />
      <ControlSection collapse>
        <SectionTitle id="controls-design">
          <Trans id="controls.select.chart.type">Chart Type</Trans>
        </SectionTitle>
        <ControlSectionContent gap="none">
          <ChartTypeSelector
            showHelp={false}
            state={state}
            chartKey={chartConfig.key}
          />
        </ControlSectionContent>
      </ControlSection>
      <ControlSection collapse>
        <SectionTitle>
          <Trans id="controls.section.tableoptions">Table Options</Trans>
        </SectionTitle>
        <ControlSectionContent
          gap="none"
          px="none"
          role="tablist"
          aria-labelledby="controls-settings"
        >
          <ChartAnnotatorTabField
            key="settings"
            value="table-settings"
            icon="settings"
            mainLabel={<Trans id="controls.table.settings">Settings</Trans>}
          />
          <ChartAnnotatorTabField
            key="sorting"
            value="table-sorting"
            icon="sort"
            mainLabel={<Trans id="controls.table.sorting">Sorting</Trans>}
          />
        </ControlSectionContent>
      </ControlSection>
      <DragDropContext
        onDragEnd={(result) =>
          handleDragEnd({
            source: result.source,
            destination: result.destination,
          })
        }
        onDragStart={handleDragStart}
      >
        <TabDropZone
          id="groups"
          title={<Trans id="controls.section.groups">Groups</Trans>}
          dimensions={dimensions}
          measures={measures}
          items={groupFields}
          isDropDisabled={isGroupsDropDisabled}
          emptyComponent={<EmptyGroups />}
        />

        <TabDropZone
          id="columns"
          title={<Trans id="controls.section.columns">Columns</Trans>}
          dimensions={dimensions}
          measures={measures}
          items={columnFields}
        />
      </DragDropContext>
    </>
  );
};
