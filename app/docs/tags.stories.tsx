import { Stack } from "@mui/material";

import { Tag } from "@/components/tag";

const meta = {
  title: "components / Tag",
  component: Tag,
};

export default meta;

const TagsStory = {
  render: () => {
    return (
      <Stack direction="row" gap={2}>
        <Tag type="theme">Water</Tag>
        <Tag type="theme">Pollution</Tag>
        <Tag type="theme">Finance</Tag>
        <Tag type="organization">BAFU</Tag>
      </Stack>
    );
  },
};

export { TagsStory as Tags };
