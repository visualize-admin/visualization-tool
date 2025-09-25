import { Paper } from "@mui/material";

import { DataTablePreview } from "@/browse/ui/data-table-preview";

import { dimensions, measures, observations } from "./data-preview-table.mock";

const meta = {
  title: "organisms / Data Preview Table",
};

export default meta;

const PreviewTableStory = () => (
  <Paper>
    <DataTablePreview
      linkToMetadataPanel={false}
      title="My dataset preview"
      dimensions={dimensions}
      measures={measures}
      observations={observations["data"].slice(0, 10)}
    />
  </Paper>
);

export { PreviewTableStory as PreviewTable };
