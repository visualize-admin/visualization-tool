import { Meta } from "@storybook/react";

import { Header } from "@/components/header";

const meta: Meta = {
  title: "organisms / Header",
  component: Header,
};

export default meta;

const HeaderStory = {
  render: () => <Header />,
};

export { HeaderStory as Header };
