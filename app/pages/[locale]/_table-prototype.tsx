// @ts-nocheck
import { Box, Label, Radio, Flex } from "@theme-ui/components";
import { NextPage } from "next";
import * as React from "react";
import { useMemo } from "react";
import { Table } from "../../charts/table-prototype/table";
import { ContentLayout } from "../../components/layout";
import holzernte from "../../data/holzernte.json";
import roteListen from "../../data/rote-listen-with-labels.json";

export const GROUPED_COLOR = "#F5F5F5";

export type Data = { [x: string]: string | number };
export interface Column {
  Header: string;
  accessor: string;
}
const Page: NextPage = () => {
  const [datasetLabel, setDatasetLabel] = React.useState("holzernte");
  const [dataset, setDataset] = React.useState(holzernte as Data[]);

  const data = useMemo(() => dataset.slice(0, 200), [dataset]);
  const columns: Column[] = useMemo(
    () =>
      Object.keys(data[0]).map((c) => ({
        Header: c,
        accessor: c,
      })),
    [data]
  );

  const updateDataset = (ds: string) => {
    if (ds === "holzernte") {
      setDataset(holzernte);
      setDatasetLabel("holzernte");
    } else if (ds === "roteListen") {
      setDataset(roteListen);
      setDatasetLabel("roteListen");
    }
  };
  return (
    <>
      <ContentLayout>
        <Box sx={{ px: 4, bg: "muted", mb: "auto" }}>
          <Flex
            sx={{
              m: 4,
              bg: "monochrome000",
              p: 2,
              justifyContent: "flex-start",
            }}
          >
            Dataset:
            <Label sx={{ mr: 3, width: "auto" }}>
              <Radio
                name="holzernte"
                value="holzernte"
                checked={datasetLabel === "holzernte"}
                onClick={(e) => updateDataset(e.currentTarget.value)}
              />
              holzernte
            </Label>
            <Label sx={{ mr: 3, width: "auto" }}>
              <Radio
                name="roteListen"
                value="roteListen"
                checked={datasetLabel === "roteListen"}
                onClick={(e) => updateDataset(e.currentTarget.value)}
              />
              roteListen
            </Label>
          </Flex>

          <Table
            data={data.map((d, i) => ({ id: i, ...d }))}
            columns={[{ Header: "id", accessor: "id" }, ...columns]}
          />
        </Box>
      </ContentLayout>
    </>
  );
};

export default Page;
