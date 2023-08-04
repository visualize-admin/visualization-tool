import { useEffect, useRef } from "react";

import { getFieldComponentIri } from "@/charts";
import { ConfiguratorStateConfiguringChart } from "@/config-types";
import {
  ControlSection,
  ControlSectionContent,
  SectionTitle,
} from "@/configurator/components/chart-controls/section";
import { InteractiveFilterType } from "@/configurator/interactive-filters/interactive-filters-configurator";
import { useComponentsQuery } from "@/graphql/query-hooks";
import { useLocale } from "@/locales/use-locale";

export const InteractiveFiltersOptions = ({
  state,
}: {
  state: ConfiguratorStateConfiguringChart;
}) => {
  const { chartConfig, dataSet, dataSource } = state;
  const activeField = state.activeField as InteractiveFilterType;
  const locale = useLocale();

  const [{ data }] = useComponentsQuery({
    variables: {
      iri: dataSet,
      sourceType: dataSource.type,
      sourceUrl: dataSource.url,
      locale,
    },
  });

  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (panelRef && panelRef.current) {
      panelRef.current.focus();
    }
  }, [activeField]);

  if (data?.dataCubeByIri) {
    const { dimensions, measures } = data.dataCubeByIri;
    const allComponents = [...dimensions, ...measures];

    if (activeField === "timeRange") {
      const componentIri = getFieldComponentIri(chartConfig.fields, "x");
      const component = allComponents.find((d) => d.iri === componentIri);

      return (
        <ControlSection>
          <SectionTitle iconName="time">{component?.label}</SectionTitle>
          <ControlSectionContent gap="none">
            <></>
          </ControlSectionContent>
        </ControlSection>
      );
    }
  }

  return null;
};
