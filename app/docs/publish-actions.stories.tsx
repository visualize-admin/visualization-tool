import { Meta } from "@storybook/react";

import { PublishActions } from "@/components/publish-actions";

const meta: Meta = {
  title: "organisms / Publish Actions",
};
export default meta;

const PublishActionsStory = () => {
  return <PublishActions configKey="123456789" />;
};

export { PublishActionsStory as PublishActions };
