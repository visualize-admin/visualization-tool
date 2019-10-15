import React from "react";
import { Flex } from "rebass";
import { ChartTypeSelectorField } from "./field";
import { Loading } from "./hint";
import { useDataSetAndMetadata } from "../domain";
import { Container } from "./container";

export const ChartTypeSelector = ({
  chartId,
  dataSet
}: {
  chartId: string;
  dataSet: string;
}) => {
  const meta = useDataSetAndMetadata(dataSet);

  if (meta.state === "loaded") {
    console.log({ meta });
    return (
      <Container
        title="Charttyp auswählen"
        sx={{ m: 4, width: "322px", alignSelf: "flex-start" }}
      >
        {/* <Trans>Charttyp auswählen</Trans> */}
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
      </Container>
    );
  } else {
    return <Loading>Loading datasets list</Loading>;
  }
};
