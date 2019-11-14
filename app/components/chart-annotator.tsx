import React from "react";
import { Flex } from "rebass";
import { ControlList, ControlSection } from "./chart-controls";
import { MetaInputField } from "./field";
import { useLocale } from "../lib/use-locale";

export const ChartAnnotator = ({ chartId }: { chartId: string }) => {
  const locale = useLocale(); // FIXME: Should depend on local Locale (tabs)
  return (
    <Flex flexDirection="column">
      <ControlSection title="Beschriftung">
        <ControlList>
          <MetaInputField
            chartId={chartId}
            metaKey="title"
            locale={locale}
            label={"Titel"}
          />
          <MetaInputField
            chartId={chartId}
            metaKey="description"
            locale={locale}
            label={"Description"}
          />
        </ControlList>
      </ControlSection>
    </Flex>
  );
};
