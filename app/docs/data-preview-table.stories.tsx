import { Paper } from "@mui/material";

import { DataTablePreview } from "@/browse/data-table-preview";

import { dimensions, observations } from "./preview-table.mock";

const meta = {
  title: "organisms / Data Preview Table",
};

export default meta;

const PreviewTableStory = () => (
  <Paper>
    <DataTablePreview
      linkToMetadataPanel={false}
      title="My dataset preview"
      sortedComponents={dimensions}
      observations={observations["data"].slice(0, 10)}
    />
  </Paper>
);

export { PreviewTableStory as PreviewTable };
