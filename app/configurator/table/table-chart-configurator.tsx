import { Trans } from "@lingui/macro";
import { Theme, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { useCallback, useMemo, useState } from "react";
import {
  DragDropContext,
  OnDragEndResponder,
  OnDragStartResponder,
} from "react-beautiful-dnd";

import { Loading } from "@/components/hint";
import { TableFields } from "@/config-types";
import {
  ConfiguratorStateConfiguringChart,
  getChartConfig,
} from "@/configurator";
import { TabDropZone } from "@/configurator/components/chart-controls/drag-and-drop-tab";
import {
  ControlSection,
  ControlSectionContent,
  SubsectionTitle,
} from "@/configurator/components/chart-controls/section";
import { ChartTypeSelector } from "@/configurator/components/chart-type-selector";
import { AnnotatorTabField } from "@/configurator/components/field";
import { useOrderedTableColumns } from "@/configurator/components/ui-helpers";
import {
  isConfiguring,
  useConfiguratorState,
} from "@/configurator/configurator-state";
import { moveFields } from "@/configurator/table/table-config-state";
import {
  useComponentsWithHierarchiesQuery,
  useDataCubeMetadataQuery,
} from "@/graphql/query-hooks";
import { useLocale } from "@/locales/use-locale";

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
  const [, dispatch] = useConfiguratorState(isConfiguring);
  const chartConfig = getChartConfig(state);
  const variables = {
    iri: chartConfig.dataSet,
    sourceType: state.dataSource.type,
    sourceUrl: state.dataSource.url,
    locale,
  };
  const [{ data: metadata }] = useDataCubeMetadataQuery({ variables });
  const [{ data: components }] = useComponentsWithHierarchiesQuery({
    variables,
  });

  const metaData = useMemo(() => {
    return metadata?.dataCubeByIri && components?.dataCubeByIri
      ? {
          ...metadata.dataCubeByIri,
          ...components.dataCubeByIri,
        }
      : null;
  }, [metadata?.dataCubeByIri, components?.dataCubeByIri]);

  const [currentDraggableId, setCurrentDraggableId] = useState<string | null>(
    null
  );

  const onDragEnd = useCallback<OnDragEndResponder>(
    ({ source, destination }) => {
      setCurrentDraggableId(null);

      if (!destination || chartConfig.chartType !== "table" || !metaData) {
        return;
      }

      const newChartConfig = moveFields(chartConfig, {
        source,
        destination,
      });

      dispatch({
        type: "CHART_CONFIG_REPLACED",
        value: {
          chartConfig: newChartConfig,
          dataSetMetadata: metaData,
        },
      });
    },
    [chartConfig, dispatch, metaData]
  );

  const onDragStart = useCallback<OnDragStartResponder>(({ draggableId }) => {
    setCurrentDraggableId(draggableId);
  }, []);

  const fields = chartConfig.fields as TableFields;
  const fieldsArray = useOrderedTableColumns(fields);

  if (metaData) {
    const groupFields = [...fieldsArray.filter((f) => f.isGroup)];
    const columnFields = [...fieldsArray.filter((f) => !f.isGroup)];

    const currentDraggedField =
      currentDraggableId !== null ? fields[currentDraggableId] : null;
    const isGroupsDropDisabled =
      currentDraggedField?.componentType === "NumericalMeasure";

    return (
      <>
        <ControlSection collapse>
          <SubsectionTitle titleId="controls-design" gutterBottom={false}>
            <Trans id="controls.select.chart.type">Chart Type</Trans>
          </SubsectionTitle>
          <ControlSectionContent px="small" gap="none">
            <ChartTypeSelector
              showHelp={false}
              state={state}
              chartKey={chartConfig.key}
              sx={{ mt: 2 }}
            />
          </ControlSectionContent>
        </ControlSection>
        <ControlSection collapse>
          <SubsectionTitle gutterBottom={false}>
            <Trans id="controls.section.tableoptions">Table Options</Trans>
          </SubsectionTitle>
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
            metaData={metaData}
            items={groupFields}
            isDropDisabled={isGroupsDropDisabled}
            emptyComponent={<EmptyGroups />}
            onUp={(_index) => {}} // TODO: implement
            onDown={(_index) => {}} // TODO: implement
          />

          <TabDropZone
            id="columns"
            title={<Trans id="controls.section.columns">Columns</Trans>}
            metaData={metaData}
            items={columnFields}
            onUp={(_index) => {}} // TODO: implement
            onDown={(_index) => {}} // TODO: implement
          />
        </DragDropContext>
      </>
    );
  } else {
    return <Loading />;
  }
};
