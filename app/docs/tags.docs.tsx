import { Stack } from "@mui/material";
import { markdown, ReactSpecimen } from "catalog";

import Tag from "@/components/tag";

export default () => {
  return markdown`

Tags are used to show organizations and themes of a dataset.

${(
  <ReactSpecimen>
    <Stack direction="row">
      <Tag type="theme">Water</Tag>
      <Tag type="theme">Pollution</Tag>
      <Tag type="theme">Finance</Tag>
      <Tag type="organization">BAFU</Tag>
    </Stack>
  </ReactSpecimen>
)}
`;
};
