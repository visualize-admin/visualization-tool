import type { Preview } from "@storybook/react";
import type { IndexEntry } from "@storybook/types";
import { AppContextDecorator, RouterDecorator } from "./decorators";

const preview: Preview = {
  // @ts-ignore
  nextjs: {
    router: {
      basePath: "/profile",
    },
  },
  decorators: [AppContextDecorator, RouterDecorator],
  options: {
    storySort: (a: IndexEntry, b: IndexEntry) =>
      a.id === b.id
        ? 0
        : a.id.localeCompare(b.id, undefined, { numeric: true }),
  },
};

export default preview;
