import React from "react";
import { Flex } from "rebass";
import { ControlList, CollapsibleSection } from "./chart-controls";
import { MetaInputField } from "./field";
import { useLocale } from "../lib/use-locale";
import { ConfiguratorStateDescribingChart } from "../domain";

export const ChartAnnotator = ({
  state
}: {
  state: ConfiguratorStateDescribingChart;
}) => {
  const locale = useLocale(); // FIXME: Should depend on local Locale (tabs)
  return (
    <Flex flexDirection="column">
      <CollapsibleSection title="Beschriftung">
        <ControlList>
          <MetaInputField metaKey="title" locale={locale} label={"Titel"} />
          <MetaInputField
            metaKey="description"
            locale={locale}
            label={"Description"}
          />
        </ControlList>
      </CollapsibleSection>
    </Flex>
  );
};
