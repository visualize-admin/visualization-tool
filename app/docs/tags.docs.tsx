import { Stack } from "@mui/material";
import { markdown, ReactSpecimen } from "catalog";

import Tag from "@/components/tag";

export default () => {
  return markdown`

Tags are used to show organizations and themes of a dataset.

${(
  <ReactSpecimen>
    <Stack direction="row">
      <Tag type="DataCubeTheme">Water</Tag>
      <Tag type="DataCubeTheme">Pollution</Tag>
      <Tag type="DataCubeTheme">Finance</Tag>
      <Tag type="DataCubeOrganization">BAFU</Tag>
    </Stack>
  </ReactSpecimen>
)}
`;
};
