import React from "react";
import { Flex } from "rebass";
import { ChartTypeSelectorField } from "./field";
import { Loading } from "./hint";
import { useDataSetAndMetadata } from "../domain";
import { Trans } from "@lingui/macro";

export const ChartTypeSelector = ({
  chartId,
  dataSet
}: {
  chartId: string;
  dataSet: string;
}) => {
  const meta = useDataSetAndMetadata(dataSet);
  if (meta.state === "loaded") {
    return (
      <Flex
        width="100%"
        flexWrap="wrap"
        justifyContent="space-between"
        alignItems="space-between"
      >
        {["bar", "line", "area", "scatterplot"].map(d => (
          <ChartTypeSelectorField
            key={d}
            type="radio"
            chartId={chartId}
            path={"chartType"}
            label={d}
            value={d}
            meta={meta}
          />
        ))}
      </Flex>
    );
  } else {
    return (
      <Loading>
        <Trans>Metadaten werden herausgeholt...</Trans>
      </Loading>
    );
  }
};
