import { Tooltip, Typography } from "@mui/material";
import { markdown, ReactSpecimen } from "catalog";

const Doc = () => markdown`
Tooltips are used to provide more information.

${(
  <ReactSpecimen span={2}>
    <Tooltip title="I have a tooltip" arrow open>
      <Typography display="inline" variant="body2">
        Content with tooltip
      </Typography>
    </Tooltip>
  </ReactSpecimen>
)}
`;

export default Doc;
