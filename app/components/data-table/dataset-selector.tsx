import * as React from "react";
import { Row } from "react-table";
import { Data, GROUPED_COLOR } from "../../pages/[locale]/_table-a-old";
import {
  Box,
  Button,
  Flex,
  Grid,
  Label,
  Text,
  Checkbox,
  Radio,
  Select,
} from "@theme-ui/components";

export const DatasetSelector = ({
  row,
  prepareRow,
}: {
  row: Row<Data>;
  prepareRow: (row: Row<Data>) => void;
}) => {
  const [datasetLabel, setDatasetLabel] = React.useState("holzernte");
  const [dataset, setDataset] = React.useState(holzernte);
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
    <Box sx={{ m: 4, bg: "monochrome000", p: 2 }}>
      Dataset:
      <Label>
        <Radio
          name="holzernte"
          value="holzernte"
          checked={datasetLabel === "holzernte"}
          onClick={(e) => updateDataset(e.currentTarget.value)}
        />
        holzernte
      </Label>
      <Label>
        <Radio
          name="roteListen"
          value="roteListen"
          checked={datasetLabel === "roteListen"}
          onClick={(e) => updateDataset(e.currentTarget.value)}
        />
        roteListen
      </Label>
    </Box>
  );
};
