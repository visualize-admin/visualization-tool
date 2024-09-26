import { Meta } from "@storybook/react";
import { useRef } from "react";

import { PublishActions } from "@/components/publish-actions";

const meta: Meta = {
  title: "organisms / Publish Actions",
};
export default meta;

const PublishActionsStory = () => {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <PublishActions configKey="123456789" locale="en" chartWrapperRef={ref} />
  );
};

export { PublishActionsStory as PublishActions };
