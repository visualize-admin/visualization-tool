import { Trans } from "@lingui/macro";
import { useCallback } from "react";
import { DragDropContext, OnDragEndResponder } from "react-beautiful-dnd";
import { ConfiguratorStateConfiguringChart } from "..";
import { getFieldComponentIris } from "../../charts";
import { Loading } from "../../components/hint";
import { useDataCubeMetadataWithComponentValuesQuery } from "../../graphql/query-hooks";
import { useLocale } from "../../locales/use-locale";
import { TabDropZone } from "../components/chart-controls/drag-and-drop-tab";
import {
  ControlSection,
  ControlSectionContent,
  SectionTitle,
} from "../components/chart-controls/section";
import { FilterTabField } from "../components/field";
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

  const [, dispatch] = useConfiguratorState();

  const onDragEnd = useCallback<OnDragEndResponder>(
    ({ source, destination }) => {
      if (!destination || state.chartConfig.chartType !== "table") {
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

    const fieldsArray = getOrderedTableColumns(fields);
    const groupFields = [...fieldsArray.filter((f) => f.isGroup)];
    const columnFields = [...fieldsArray.filter((f) => !f.isGroup)];

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
            items={groupFields}
          ></TabDropZone>

          <TabDropZone
            id="columns"
            title={<Trans id="controls.section.columns">Columns</Trans>}
            metaData={data.dataCubeByIri}
            items={columnFields}
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
