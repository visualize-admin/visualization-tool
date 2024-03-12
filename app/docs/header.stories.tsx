import { Meta } from "@storybook/react";

import { Header, Logo } from "@/components/header";

const meta: Meta = {
  title: "organisms / Header",
  component: Header,
};

export default meta;

const LogoStory = {
  render: () => <Logo />,
};

export { LogoStory as Logo };

const HeaderStory = {
  render: () => <Header contentId={"12"} />,
};

export { HeaderStory as Header };
