import { Meta, StoryObj } from "@storybook/react";

import { Footer } from "@/components/footer";

const meta: Meta = {
  component: Footer,
  title: "organisms / Footer",
};
export default meta;

const FooterStory: StoryObj = {
  render: () => <Footer />,
};

export { FooterStory as Footer };
