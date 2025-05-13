import { Paper } from "@mui/material";

import { PreviewTable } from "@/browse/datatable";

import { dimensions, observations } from "./preview-table.mock";

const meta = {
  title: "organisms / Preview Table",
};

export default meta;

const PreviewTableStory = () => (
  <Paper>
    <PreviewTable
      linkToMetadataPanel={false}
      title="My dataset preview"
      sortedComponents={dimensions}
      observations={observations["data"].slice(0, 10)}
    />
  </Paper>
);

export { PreviewTableStory as PreviewTable };
