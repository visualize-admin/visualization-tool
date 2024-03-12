import { markdown } from "catalog";

const Doc = () => markdown`
> The components used in the User Interface are built upon the Material-UI library. This library provides
> a set of basic components that can be used to build complex interfaces.

All styles are defined in the \`federal\` theme file that contain the "Federal" customizations for MUI.

Components are developed with Storybook, a tool for developing UI components in isolation. The storybook
is accessible [here](/storybook).
`;

export default Doc;
